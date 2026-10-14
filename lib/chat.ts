import { z } from "zod";
import { linksFor } from "@/lib/answer-links";
import { fallbackFor, FALLBACK_PAGE } from "@/lib/chat-fallback";
import { ANSWER_TIMEOUT_MS, MAX_ASSISTANT_CHARS, MAX_INPUT_CHARS } from "@/lib/chat-limits";
import { buildSystemPrompt, lastMessages } from "@/lib/chat-prompt";
import { ChatProviderError, type ChatProvider } from "@/lib/chat-provider";
import { createCitationStripper } from "@/lib/citations";
import { getOffLimits, loadContent } from "@/lib/content";
import type { Command, Project } from "@/lib/content-schemas";
import { followupsFor } from "@/lib/followups";
import { getKnowledge, type Knowledge } from "@/lib/knowledge";
import { clientKey, type RateLimiter } from "@/lib/ratelimit";
import { sseEvent } from "@/lib/sse";

// The page an `error` event points to by default (F4.8). The fallback for a question is in lib/chat-fallback.ts.
export { FALLBACK_PAGE };

// Only `role` and `content` are read, so a client can't pass anything else through. A "system" role
// isn't accepted at all: visitor messages are questions, never instructions. The caps are checked for
// every message in the request, so an over-long one is a 400 before the model is called (Guardrails).
const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1)
    .superRefine((messages, ctx) => {
      messages.forEach((message, index) => {
        const limit = message.role === "user" ? MAX_INPUT_CHARS : MAX_ASSISTANT_CHARS;
        if (message.content.length > limit) {
          ctx.addIssue({
            code: "custom",
            message: `must be at most ${String(limit)} characters`,
            path: [index, "content"],
          });
        }
      });
    }),
});

// What a request's log line says happened (D-051). `abandoned` is a visitor who left before the answer ended.
type Outcome =
  "answered" | "unanswered" | "rate_limited" | "timeout" | "upstream" | "disabled" | "abandoned";

type Options = {
  // Built per request from the content. A test passes a fixed prompt, so it doesn't need `content/`.
  systemPrompt?: () => string;
  // Receives the reason a request failed, with no visitor text in it.
  onError?: (error: unknown) => void;
  // The pack the citations are checked against. A test passes one built from its fixture.
  knowledge?: () => Knowledge;
  // The commands and projects the links, follow-ups and fallbacks are built from (US-030, US-031).
  content?: () => { commands: Command[]; projects: Project[] };
  // Counts requests per client. Only the route passes one, so unit tests are never limited.
  rateLimiter?: RateLimiter;
  // How long an answer may take, before the timeout error (US-031). A test passes a small one.
  timeoutMs?: number;
  // Whether the chat is on. Read on each request, so a change to the environment applies at once.
  enabled?: () => boolean;
  // Receives the one log line per request. The default writes it to the console.
  onLog?: (line: string) => void;
};

function defaultSystemPrompt(): string {
  return buildSystemPrompt({ offLimits: getOffLimits(), knowledge: getKnowledge().text });
}

// Read per request, like the system prompt, so a change to content/ shows without a restart.
function defaultContent() {
  const { commands, projects } = loadContent();
  return { commands, projects };
}

// The chat is on unless CHAT_ENABLED is unset, empty or "true" in any case. Any other value turns it off,
// so a typo fails closed (D-049).
export function chatEnabled(value: string | undefined): boolean {
  return value === undefined || value === "" || value.toLowerCase() === "true";
}

function logError(error: unknown): void {
  const reason = error instanceof Error ? error.message : "unknown error";
  console.error(`chat: request failed: ${reason}`);
}

// One line per request that reaches the model or is refused: the outcome, the visitor's question and the
// number of valid sources cited. Never an IP address, header, user agent or answer (D-051).
function logLine(outcome: Outcome, question: string, cited: number): string {
  return JSON.stringify({ event: "chat", outcome, question, cited });
}

const EVENT_STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
};

// POST /api/chat (API contract). Checks the body, then the kill switch and the rate limit, then asks the
// provider for the answer's text and writes it as server-sent events. The citations are taken out of the
// text, and `links` and `followups` come from the sources the answer cited.
export function createChatHandler(provider: ChatProvider, options: Options = {}) {
  const systemPrompt = options.systemPrompt ?? defaultSystemPrompt;
  const onError = options.onError ?? logError;
  const knowledge = options.knowledge ?? getKnowledge;
  const content = options.content ?? defaultContent;
  const enabled = options.enabled ?? (() => chatEnabled(process.env.CHAT_ENABLED));
  const onLog = options.onLog ?? ((line: string) => console.info(line));
  const timeoutMs = options.timeoutMs ?? ANSWER_TIMEOUT_MS;

  return async function handle(request: Request): Promise<Response> {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return Response.json({ error: "invalid_json" }, { status: 400 });
    }
    const body = bodySchema.safeParse(json);
    if (!body.success || body.data.messages.at(-1)?.role !== "user") {
      return Response.json({ error: "invalid_body" }, { status: 400 });
    }
    const messages = lastMessages(body.data.messages);
    // Every question the visitor has sent, this one included, so a follow-up they already asked comes last.
    const asked = body.data.messages.flatMap((message) =>
      message.role === "user" ? [message.content] : [],
    );
    const question = body.data.messages.at(-1)?.content ?? "";

    // A refusal is still an event stream, so the browser reads every failure the same way (D-048). Its
    // fallback page is chosen by the question, which is why the body is checked first.
    const refuse = (
      status: number,
      code: "rate_limited" | "upstream",
      outcome: Outcome,
      extra: Record<string, string> = {},
    ) => {
      onLog(logLine(outcome, question, 0));
      const fallback = fallbackFor(question, content().commands);
      return new Response(sseEvent("error", { code, fallback }), {
        status,
        headers: { ...EVENT_STREAM_HEADERS, ...extra },
      });
    };

    if (!enabled()) return refuse(503, "upstream", "disabled");
    if (options.rateLimiter !== undefined) {
      const verdict = options.rateLimiter.check(clientKey(request.headers));
      if (!verdict.allowed) {
        return refuse(429, "rate_limited", "rate_limited", {
          "Retry-After": String(verdict.retryAfterSeconds),
        });
      }
    }

    // Closing the tab aborts the paid call, and so does the stream being cancelled. The timeout aborts it too,
    // but is kept apart, because a timed-out visitor is still waiting for the error line.
    const abort = new AbortController();
    let visitorGone = false;
    const leave = () => {
      visitorGone = true;
      abort.abort();
    };
    request.signal.addEventListener("abort", leave, { once: true });
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) =>
          controller.enqueue(encoder.encode(sseEvent(event, data)));
        let timer: ReturnType<typeof setTimeout> | undefined;
        let timedOut = false;
        let outcome: Outcome = "answered";
        let cited = 0;
        try {
          const system = systemPrompt();
          const { sources } = knowledge();
          const stripper = createCitationStripper();
          timer = setTimeout(() => {
            timedOut = true;
            abort.abort();
          }, timeoutMs);
          for await (const chunk of provider({ system, messages, signal: abort.signal })) {
            const visible = stripper.push(chunk);
            if (visible !== "") send("token", { t: visible });
          }
          const rest = stripper.finish();
          if (rest !== "") send("token", { t: rest });

          const { commands, projects } = content();
          const links = linksFor(stripper.cited(), { sources, commands, projects });
          const known = new Set(sources.map((source) => source.id));
          cited = stripper.cited().filter((id) => known.has(id)).length;
          outcome = cited > 0 ? "answered" : "unanswered";
          send("links", links);
          send("followups", followupsFor({ links, commands, asked }));
          send("done", {});
        } catch (error) {
          if (timedOut) {
            outcome = "timeout";
            send("error", { code: "timeout", fallback: fallbackFor(question, content().commands) });
          } else if (visitorGone) {
            // A visitor who has gone needs no error line.
            outcome = "abandoned";
          } else {
            onError(error);
            const code = error instanceof ChatProviderError ? error.code : "upstream";
            outcome = code;
            send("error", { code, fallback: fallbackFor(question, content().commands) });
          }
        } finally {
          clearTimeout(timer);
          onLog(logLine(outcome, question, cited));
          controller.close();
        }
      },
      cancel() {
        leave();
      },
    });

    return new Response(stream, { headers: EVENT_STREAM_HEADERS });
  };
}
