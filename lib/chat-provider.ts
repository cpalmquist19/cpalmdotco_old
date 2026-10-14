import Anthropic from "@anthropic-ai/sdk";

// The model for the chat, from D-002.
export const CHAT_MODEL = "claude-haiku-5-5";
// The spec's output cap (Guardrails). The API requires one, and US-031 owns the other limits.
export const MAX_OUTPUT_TOKENS = 500;

export type ChatMessage = { role: "user" | "assistant"; content: string };

// What the `error` event can carry (API contract).
export type ChatFailureCode = "rate_limited" | "timeout" | "upstream";

export class ChatProviderError extends Error {
  readonly code: ChatFailureCode;

  constructor(code: ChatFailureCode, message: string) {
    super(message);
    this.name = "ChatProviderError";
    this.code = code;
  }
}

// A provider turns a conversation into the answer's text chunks. The route only knows this type, so a
// test, or a later FastAPI port, can stand in for the Claude API (D-001).
export type ChatProvider = (input: {
  system: string;
  messages: ChatMessage[];
  signal: AbortSignal;
}) => AsyncIterable<string>;

// The part of the SDK client the provider uses, so a test can pass a fake and never touch the network.
export type StreamingClient = {
  messages: {
    stream: (
      body: Anthropic.MessageStreamParams,
      options?: { signal?: AbortSignal },
    ) => AsyncIterable<Anthropic.MessageStreamEvent>;
  };
};

// Read at request time, never at import time: a build with no key must still pass (US-029).
function clientFromEnvironment(): StreamingClient {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey === "") {
    throw new ChatProviderError("upstream", "ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

function toProviderError(error: unknown): ChatProviderError {
  if (error instanceof ChatProviderError) return error;
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new ChatProviderError("timeout", "the model request timed out");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new ChatProviderError("rate_limited", "the model provider rate limited the request");
  }
  // Only the kind of failure is kept: an SDK error's message can echo request details.
  const status = error instanceof Anthropic.APIError ? ` (status ${String(error.status)})` : "";
  return new ChatProviderError("upstream", `the model request failed${status}`);
}

// The Claude API provider. The system block is marked cacheable, so the knowledge pack is billed at the
// cache rate after the first request. Thinking is off: it would spend the 500-token cap before the
// answer, and a grounded answer from a pack in the prompt doesn't need it.
export function anthropicProvider(getClient: () => StreamingClient = clientFromEnvironment) {
  const provider: ChatProvider = async function* ({ system, messages, signal }) {
    try {
      const client = getClient();
      const stream = client.messages.stream(
        {
          model: CHAT_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          thinking: { type: "disabled" },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
        },
        { signal },
      );
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
        if (event.type === "message_delta" && event.delta.stop_reason === "refusal") {
          throw new ChatProviderError("upstream", "the model declined to answer");
        }
      }
    } catch (error) {
      throw toProviderError(error);
    }
  };
  return provider;
}
