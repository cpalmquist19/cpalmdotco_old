import { describe, expect, it } from "vitest";
import { requestMessages, streamAnswer, type ChatEvent } from "@/lib/chat-client";
import { commandOf } from "@/tests/unit/helpers/command";
import type { Exchange } from "@/lib/conversation";

const encoder = new TextEncoder();

// The server's frames, as the wire carries them: an event line, a data line and a blank line.
function frames(events: [string, unknown][]): string {
  return events
    .map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    .join("");
}

// A response whose body is the given bytes, delivered in the given pieces.
function streamOf(pieces: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const piece of pieces) controller.enqueue(piece);
      controller.close();
    },
  });
}

function eventStream(body: ReadableStream<Uint8Array>, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
  });
}

// A fetch that answers with the given response, and records what it was asked.
function fetchReturning(response: Response) {
  const asked: { url: string; body: string | undefined } = { url: "", body: undefined };
  const fetchImpl = async (url: string, init: RequestInit) => {
    asked.url = url;
    asked.body = typeof init.body === "string" ? init.body : undefined;
    return response;
  };
  return { fetchImpl, asked };
}

async function collect(response: Response | Error, signal?: AbortSignal): Promise<ChatEvent[]> {
  const fetchImpl = (): Promise<Response> =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response);
  const events: ChatEvent[] = [];
  for await (const event of streamAnswer({
    messages: [{ role: "user", content: "Hi" }],
    signal,
    fetchImpl,
  })) {
    events.push(event);
  }
  return events;
}

const upstream: ChatEvent = { type: "error", code: "upstream", fallback: "/about/" };

describe("US-032", () => {
  it("US-032: events are read when a chunk ends in the middle of a line, and in the middle of a multi-byte character", async () => {
    const bytes = encoder.encode(
      frames([
        ["token", { t: "Héllo 🙂" }],
        ["done", {}],
      ]),
    );
    // Three bytes at a time cuts lines and the multi-byte characters apart.
    const pieces: Uint8Array[] = [];
    for (let at = 0; at < bytes.length; at += 3) pieces.push(bytes.slice(at, at + 3));

    const events = await collect(eventStream(streamOf(pieces)));

    expect(events).toEqual([{ type: "token", text: "Héllo 🙂" }, { type: "done" }]);
  });

  it("US-032: token, links, followups and done are yielded in order with their payloads", async () => {
    const body = frames([
      ["token", { t: "Caleb builds tests." }],
      ["links", [{ label: "About", href: "/about/" }]],
      ["followups", ["What's your background?"]],
      ["done", {}],
    ]);

    const events = await collect(eventStream(streamOf([encoder.encode(body)])));

    expect(events).toEqual([
      { type: "token", text: "Caleb builds tests." },
      { type: "links", links: [{ label: "About", href: "/about/" }] },
      { type: "followups", questions: ["What's your background?"] },
      { type: "done" },
    ]);
  });

  it("US-032: an error event is yielded as it came, from a 429 and from a 503 as well as a 200", async () => {
    const error = { code: "rate_limited", fallback: "/projects/" };

    for (const status of [200, 429, 503]) {
      const body = frames([["error", error]]);
      const events = await collect(eventStream(streamOf([encoder.encode(body)]), status));

      expect(events, `status ${String(status)}`).toEqual([
        { type: "error", code: "rate_limited", fallback: "/projects/" },
      ]);
    }
  });

  it("US-032: a JSON 400, an HTML 502 and a network failure each give one upstream error", async () => {
    const json = new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
    const html = new Response("<html>Bad gateway</html>", {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });

    expect(await collect(json)).toEqual([upstream]);
    expect(await collect(html)).toEqual([upstream]);
    expect(await collect(new TypeError("Failed to fetch"))).toEqual([upstream]);
  });

  it("US-032: a stream that ends with no done or error gives an upstream error after the tokens", async () => {
    const body = frames([["token", { t: "Part of an answer" }]]);

    const events = await collect(eventStream(streamOf([encoder.encode(body)])));

    expect(events).toEqual([{ type: "token", text: "Part of an answer" }, upstream]);
  });

  it("US-032: a link whose href doesn't start with / is dropped", async () => {
    const body = frames([
      [
        "links",
        [
          { label: "About", href: "/about/" },
          { label: "Elsewhere", href: "https://example.com/placeholder" },
          { label: "Script", href: "javascript:alert(1)" },
        ],
      ],
      ["done", {}],
    ]);

    const events = await collect(eventStream(streamOf([encoder.encode(body)])));

    expect(events[0]).toEqual({ type: "links", links: [{ label: "About", href: "/about/" }] });
  });

  it("US-032: aborting the signal stops reading and yields nothing more", async () => {
    const controller = new AbortController();
    // A stream that sends one token and then never closes, as a slow answer does.
    const open = new ReadableStream<Uint8Array>({
      start(stream) {
        stream.enqueue(encoder.encode(frames([["token", { t: "Hi" }]])));
      },
    });
    const { fetchImpl } = fetchReturning(eventStream(open));

    const events: ChatEvent[] = [];
    for await (const event of streamAnswer({
      messages: [{ role: "user", content: "Hi" }],
      signal: controller.signal,
      fetchImpl,
    })) {
      events.push(event);
      controller.abort();
    }

    expect(events).toEqual([{ type: "token", text: "Hi" }]);
  });

  it("US-032: the request holds each command turn as label and intro, each exchange as question and answer, and ends with the new question", async () => {
    const about = commandOf({
      command: "/about",
      label: "About",
      answer: "/about/",
      order: 1,
      intro: "About intro",
    });
    const skills = commandOf({ command: "/skills", label: "Skills", answer: "/skills/", order: 2 });
    const exchange: Exchange = { question: "Q1", answer: "A1", links: [], followups: [] };
    const turns = ["/about", exchange, "/skills"];

    const messages = requestMessages(turns, [about, skills], "Q2");

    expect(messages).toEqual([
      { role: "user", content: "About" },
      { role: "assistant", content: "About intro" },
      { role: "user", content: "Q1" },
      { role: "assistant", content: "A1" },
      { role: "user", content: "Skills" },
      { role: "assistant", content: skills.description },
      { role: "user", content: "Q2" },
    ]);

    // The body that goes over the wire is exactly these messages.
    const { fetchImpl, asked } = fetchReturning(
      eventStream(streamOf([encoder.encode(frames([["done", {}]]))])),
    );
    for await (const event of streamAnswer({ messages, fetchImpl })) {
      expect(event).toEqual({ type: "done" });
    }
    expect(asked.url).toBe("/api/chat");
    expect(JSON.parse(asked.body ?? "")).toEqual({ messages });
  });

  it("US-032: an assistant message over 2500 characters is cut to the limit, and an empty answer is left out", () => {
    const long: Exchange = { question: "Q1", answer: "a".repeat(3000), links: [], followups: [] };
    const empty: Exchange = { question: "Q2", answer: "", links: [], followups: [] };

    const messages = requestMessages([long, empty], [], "Q3");

    expect(messages).toEqual([
      { role: "user", content: "Q1" },
      { role: "assistant", content: "a".repeat(2500) },
      { role: "user", content: "Q2" },
      { role: "user", content: "Q3" },
    ]);
  });
});
