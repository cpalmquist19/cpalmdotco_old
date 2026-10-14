import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import { anthropicProvider, ChatProviderError, type StreamingClient } from "@/lib/chat-provider";

type Params = Anthropic.MessageStreamParams;

function textDelta(text: string): Anthropic.MessageStreamEvent {
  return { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } };
}

// A fake client that records the request body and replays the given events. It never reaches the network.
function fakeClient(events: Anthropic.MessageStreamEvent[]) {
  const calls: Params[] = [];
  const client: StreamingClient = {
    messages: {
      stream: async function* (body) {
        calls.push(body);
        yield* events;
      },
    },
  };
  return { client, calls };
}

async function collect(chunks: AsyncIterable<string>): Promise<string[]> {
  const seen: string[] = [];
  for await (const chunk of chunks) seen.push(chunk);
  return seen;
}

const input = {
  system: "the system prompt",
  messages: [{ role: "user" as const, content: "What do you do?" }],
  signal: new AbortController().signal,
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("US-029", () => {
  it("US-029: the Anthropic provider asks for claude-haiku-5-5 with max_tokens 500", async () => {
    const { client, calls } = fakeClient([textDelta("Hello")]);

    const chunks = await collect(anthropicProvider(() => client)(input));

    expect(chunks).toEqual(["Hello"]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe("claude-haiku-5-5");
    expect(calls[0]?.max_tokens).toBe(500);
    expect(calls[0]?.messages).toEqual(input.messages);
  });

  it("US-029: the system block carries cache_control ephemeral", async () => {
    const { client, calls } = fakeClient([textDelta("Hi")]);

    await collect(anthropicProvider(() => client)(input));

    expect(calls[0]?.system).toEqual([
      { type: "text", text: "the system prompt", cache_control: { type: "ephemeral" } },
    ]);
  });

  it("US-029: only text deltas become chunks, in order", async () => {
    const { client } = fakeClient([{ type: "message_stop" }, textDelta("One "), textDelta("two")]);

    expect(await collect(anthropicProvider(() => client)(input))).toEqual(["One ", "two"]);
  });

  it("US-029: a refusal becomes an upstream failure", async () => {
    const { client } = fakeClient([
      textDelta("Partial"),
      {
        type: "message_delta",
        delta: { stop_reason: "refusal", stop_sequence: null, container: null, stop_details: null },
        usage: {
          output_tokens: 3,
          input_tokens: null,
          cache_creation_input_tokens: null,
          cache_read_input_tokens: null,
          output_tokens_details: null,
          server_tool_use: null,
        },
      },
    ]);

    const failure = collect(anthropicProvider(() => client)(input));

    await expect(failure).rejects.toMatchObject({ code: "upstream" });
  });

  it("US-029: a missing API key becomes an upstream failure, not a crash", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");

    const failure = collect(anthropicProvider()(input));

    await expect(failure).rejects.toBeInstanceOf(ChatProviderError);
    await expect(failure).rejects.toMatchObject({
      code: "upstream",
      message: "ANTHROPIC_API_KEY is not set",
    });
  });

  it("US-029: an error from the client is mapped to a code and keeps no request text", async () => {
    const client: StreamingClient = {
      messages: {
        stream: () => {
          throw new Error("boom: What do you do?");
        },
      },
    };

    const failure = collect(anthropicProvider(() => client)(input));

    await expect(failure).rejects.toMatchObject({
      code: "upstream",
      message: "the model request failed",
    });
  });
});
