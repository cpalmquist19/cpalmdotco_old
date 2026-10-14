import { z } from "zod";
import { buildSystemPrompt, lastMessages } from "@/lib/chat-prompt";
import { ChatProviderError, type ChatProvider } from "@/lib/chat-provider";
import { getOffLimits } from "@/lib/content";
import { getKnowledge } from "@/lib/knowledge";
import { sseEvent } from "@/lib/sse";

// The page an `error` event points to. US-031 and US-032 refine it per code (F4.8).
export const FALLBACK_PAGE = "/about/";

// Only `role` and `content` are read, so a client can't pass anything else through. A "system" role
// isn't accepted at all: visitor messages are questions, never instructions.
const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1),
});

type Options = {
  // Built per request from the content. A test passes a fixed prompt, so it doesn't need `content/`.
  systemPrompt?: () => string;
  // Receives the reason a request failed, with no visitor text in it.
  onError?: (error: unknown) => void;
};

function defaultSystemPrompt(): string {
  return buildSystemPrompt({ offLimits: getOffLimits(), knowledge: getKnowledge().text });
}

function logError(error: unknown): void {
  const reason = error instanceof Error ? error.message : "unknown error";
  console.error(`chat: request failed: ${reason}`);
}

// POST /api/chat (API contract). Validates the body, asks the provider for the answer's text, and writes
// it as server-sent events. `links` and `followups` are empty until US-030 fills them.
export function createChatHandler(provider: ChatProvider, options: Options = {}) {
  const systemPrompt = options.systemPrompt ?? defaultSystemPrompt;
  const onError = options.onError ?? logError;

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

    // Closing the tab aborts the paid call, and so does the stream being cancelled.
    const abort = new AbortController();
    request.signal.addEventListener("abort", () => abort.abort(), { once: true });
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) =>
          controller.enqueue(encoder.encode(sseEvent(event, data)));
        try {
          const system = systemPrompt();
          for await (const chunk of provider({ system, messages, signal: abort.signal })) {
            send("token", { t: chunk });
          }
          send("links", []);
          send("followups", []);
          send("done", {});
        } catch (error) {
          // A visitor who has gone needs no error line.
          if (!abort.signal.aborted) {
            onError(error);
            const code = error instanceof ChatProviderError ? error.code : "upstream";
            send("error", { code, fallback: FALLBACK_PAGE });
          }
        } finally {
          controller.close();
        }
      },
      cancel() {
        abort.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  };
}
