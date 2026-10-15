// A stand-in for the Claude Messages API, for the e2e run only (D-061). The app's SDK is pointed here with
// ANTHROPIC_BASE_URL, so the route, the provider and the SDK's stream parsing are the real ones. Plain Node with
// no packages, so Playwright can start it with `node`.
//
// It answers POST /v1/messages and picks the answer from a marker in the last message:
//   no marker        two text deltas about 200 ms apart, citing the first source in the system prompt
//   [fake:short]     one text delta at once, with the same citation
//   [fake:upstream]  400, which the SDK doesn't retry
//   [fake:rate-limited]  429 with x-should-retry: false, so the SDK doesn't retry and sleep
import { createServer } from "node:http";

const PORT = 3101;
// The gap between the two deltas. It is what makes "tokens arrive before the answer ends" a real check: a proxy
// that buffered the stream would deliver both deltas in one read.
const DELTA_GAP_MS = 200;

// A real source id only: the system prompt also holds the literal "[src:<id>]" as an instruction, which must not match.
const CITATION = /\[src:([a-z0-9/-]+)\]/;

function citationFor(system) {
  return CITATION.exec(system)?.[0] ?? "";
}

function sendJson(response, status, headers, body) {
  response.writeHead(status, { "Content-Type": "application/json", ...headers });
  response.end(JSON.stringify(body));
}

function fail(response, status, type, message, headers = {}) {
  sendJson(response, status, headers, { type: "error", error: { type, message } });
}

// Writes a Messages API event stream, one text block with the given deltas. The first delta goes out at once.
function stream(response, deltas, gapMs) {
  response.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8" });
  let closed = false;
  response.on("close", () => {
    closed = true;
  });

  const send = (event, data) => {
    if (!closed) response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("message_start", {
    type: "message_start",
    message: {
      id: "msg_fake",
      type: "message",
      role: "assistant",
      model: "claude-haiku-5-5",
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    },
  });
  send("content_block_start", {
    type: "content_block_start",
    index: 0,
    content_block: { type: "text", text: "" },
  });

  const finish = async () => {
    for (const [index, text] of deltas.entries()) {
      if (index > 0) await new Promise((resolve) => setTimeout(resolve, gapMs));
      if (closed) return;
      send("content_block_delta", {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text },
      });
    }
    send("content_block_stop", { type: "content_block_stop", index: 0 });
    send("message_delta", {
      type: "message_delta",
      delta: { stop_reason: "end_turn", stop_sequence: null },
      usage: { output_tokens: 10 },
    });
    send("message_stop", { type: "message_stop" });
    response.end();
  };
  void finish();
}

function answer(body, response) {
  const last = JSON.stringify(body.messages?.at(-1)?.content ?? "");
  const cite = citationFor(body.system?.[0]?.text ?? "");

  if (last.includes("[fake:upstream]")) {
    fail(response, 400, "invalid_request_error", "fake upstream failure");
  } else if (last.includes("[fake:rate-limited]")) {
    fail(response, 429, "rate_limit_error", "fake rate limit", { "x-should-retry": "false" });
  } else if (last.includes("[fake:short]")) {
    stream(response, [`Here is what I built. ${cite}`], 0);
  } else {
    stream(response, ["Here is what I built. ", `It is on the page ${cite}.`], DELTA_GAP_MS);
  }
}

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/messages") {
    response.writeHead(404).end();
    return;
  }
  let raw = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    raw += chunk;
  });
  request.on("end", () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      fail(response, 400, "invalid_request_error", "the body is not JSON");
      return;
    }
    answer(body, response);
  });
});

server.listen(PORT);
