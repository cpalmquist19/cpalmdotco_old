import { z } from "zod";
import type { AnswerLink } from "@/lib/answer-links";
import { FALLBACK_PAGE } from "@/lib/chat-fallback";
import { MAX_ASSISTANT_CHARS } from "@/lib/chat-limits";
import type { Turn } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

// The failures the server can name in an `error` event (API contract). The browser shows each as one line.
export const CHAT_ERROR_CODES = ["rate_limited", "timeout", "upstream"] as const;
export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

// One event of an answer, as the browser reads it. An `error` ends the answer (F4.8, D-048).
export type ChatEvent =
  | { type: "token"; text: string }
  | { type: "links"; links: AnswerLink[] }
  | { type: "followups"; questions: string[] }
  | { type: "done" }
  | { type: "error"; code: ChatErrorCode; fallback: string };

export type RequestMessage = { role: "user" | "assistant"; content: string };

const tokenData = z.object({ t: z.string() });
const linksData = z.array(z.object({ label: z.string(), href: z.string() }));
const followupsData = z.array(z.string());
const errorData = z.object({ code: z.enum(CHAT_ERROR_CODES), fallback: z.string() });

type Parsed = ChatEvent | "skip" | "invalid";

// One frame: an `event:` line and a `data:` line. A frame with neither (a comment) is skipped, and a frame
// whose data doesn't match its event is invalid, so the answer ends with an upstream error.
function parseFrame(frame: string): Parsed {
  const lines = frame.split("\n");
  const name = lines.find((line) => line.startsWith("event: "))?.slice("event: ".length);
  const payload = lines.find((line) => line.startsWith("data: "))?.slice("data: ".length);
  if (name === undefined || payload === undefined) return "skip";

  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return "invalid";
  }
  switch (name) {
    case "token": {
      const parsed = tokenData.safeParse(json);
      return parsed.success ? { type: "token", text: parsed.data.t } : "invalid";
    }
    case "links": {
      const parsed = linksData.safeParse(json);
      // The server only builds site paths. Anything else must never become an <a href>.
      return parsed.success
        ? { type: "links", links: parsed.data.filter((link) => link.href.startsWith("/")) }
        : "invalid";
    }
    case "followups": {
      const parsed = followupsData.safeParse(json);
      return parsed.success ? { type: "followups", questions: parsed.data } : "invalid";
    }
    case "done":
      return { type: "done" };
    case "error": {
      const parsed = errorData.safeParse(json);
      if (!parsed.success) return "invalid";
      const fallback = parsed.data.fallback.startsWith("/") ? parsed.data.fallback : FALLBACK_PAGE;
      return { type: "error", code: parsed.data.code, fallback };
    }
    default:
      return "skip";
  }
}

// The request body's messages: each command turn as its label and intro, each exchange as its question and
// its answer, then the new question. The server keeps the last six and drops a leading answer (US-031).
export function requestMessages(
  turns: readonly Turn[],
  commands: readonly Command[],
  question: string,
): RequestMessage[] {
  const history = turns.flatMap((turn): RequestMessage[] => {
    if (typeof turn === "string") {
      const command = commands.find((item) => item.command === turn);
      if (command === undefined) return [];
      return [
        { role: "user", content: command.label },
        { role: "assistant", content: command.intro ?? command.description },
      ];
    }
    const answer = turn.answer.slice(0, MAX_ASSISTANT_CHARS);
    return [
      { role: "user", content: turn.question },
      ...(answer.trim() === "" ? [] : [{ role: "assistant" as const, content: answer }]),
    ];
  });
  return [...history, { role: "user", content: question }];
}

// The part of `fetch` the client uses, so a test can pass a fake without a network.
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

type Options = {
  messages: RequestMessage[];
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
};

// Asks /api/chat and yields the answer's events as they arrive. A response that isn't an event stream, a
// failed request and a stream that closes with no `done` or `error` each give one upstream error. A stopped
// answer (the signal aborted) yields nothing more, because the visitor asked for that.
export async function* streamAnswer({
  messages,
  signal,
  fetchImpl = (url, init) => fetch(url, init),
}: Options): AsyncGenerator<ChatEvent> {
  const upstream: ChatEvent = { type: "error", code: "upstream", fallback: FALLBACK_PAGE };

  let response: Response;
  try {
    response = await fetchImpl("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch {
    if (signal?.aborted !== true) yield upstream;
    return;
  }
  const body = response.body;
  // A refusal (429, 503) is still an event stream, so its status doesn't matter here (D-048).
  if (
    body === null ||
    !(response.headers.get("content-type") ?? "").startsWith("text/event-stream")
  ) {
    yield upstream;
    return;
  }

  const reader = body.getReader();
  // A stopped answer cancels the read, which otherwise waits for the next chunk.
  const cancel = () => {
    reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", cancel, { once: true });
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // `stream: true` keeps a multi-byte character that a chunk splits until the next chunk completes it.
      buffer += decoder.decode(value, { stream: true });
      for (let end = buffer.indexOf("\n\n"); end !== -1; end = buffer.indexOf("\n\n")) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const parsed = parseFrame(frame);
        if (parsed === "invalid") {
          yield upstream;
          return;
        }
        if (parsed === "skip") continue;
        yield parsed;
        if (parsed.type === "done" || parsed.type === "error") return;
      }
    }
    // The stream ended with no `done` or `error`: the platform cut it off, or the connection dropped.
    if (signal?.aborted !== true) yield upstream;
  } catch {
    if (signal?.aborted !== true) yield upstream;
  } finally {
    signal?.removeEventListener("abort", cancel);
    cancel();
  }
}
