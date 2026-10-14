import type { Page } from "@playwright/test";

// The test's side of a stubbed /api/chat. The page's fetch is replaced before any script runs, so the test decides
// each event and when it arrives. A real stream would deliver a whole answer at once, which can't show a
// half-streamed one (US-032 Notes). Every other request goes to the real server.
export type ChatStub = {
  // The body of the last /api/chat request, or undefined before one.
  body: string | undefined;
  // Answers the pending request with an event stream that the test feeds with `send` and `close`.
  open: (status: number) => void;
  // Sends one server-sent event on the open stream.
  send: (event: string, data: unknown) => void;
  // Ends the open stream.
  close: () => void;
  // Answers the pending request with a body that is not an event stream, such as an HTML error page.
  reply: (status: number, contentType: string, body: string) => void;
};

declare global {
  interface Window {
    __chat: ChatStub;
  }
}

// Installs the stub before the page loads. Call it before `page.goto`.
export async function stubChat(page: Page) {
  await page.addInitScript(() => {
    const encoder = new TextEncoder();
    const realFetch = window.fetch.bind(window);
    // The request waits for the test's answer. An answer made before the request is held for it.
    let waiting: ((response: Response) => void) | undefined;
    let held: Response | undefined;
    let controller: ReadableStreamDefaultController<Uint8Array> | undefined;

    const answer = (response: Response) => {
      if (waiting !== undefined) {
        waiting(response);
        waiting = undefined;
      } else {
        held = response;
      }
    };

    window.__chat = {
      body: undefined,
      open(status) {
        const stream = new ReadableStream<Uint8Array>({
          start(stream) {
            controller = stream;
          },
        });
        answer(
          new Response(stream, {
            status,
            headers: { "Content-Type": "text/event-stream; charset=utf-8" },
          }),
        );
      },
      send(event, data) {
        try {
          controller?.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // The visitor stopped the answer, which cancels its stream. Nothing reads what is sent now.
        }
      },
      close() {
        try {
          controller?.close();
        } catch {
          // Already cancelled by a stop, as in `send`.
        }
      },
      reply(status, contentType, body) {
        answer(new Response(body, { status, headers: { "Content-Type": contentType } }));
      },
    };

    window.fetch = (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (!new URL(url, window.location.href).pathname.endsWith("/api/chat")) {
        return realFetch(input, init);
      }
      window.__chat.body = typeof init?.body === "string" ? init.body : undefined;
      if (held !== undefined) {
        const response = held;
        held = undefined;
        return Promise.resolve(response);
      }
      return new Promise<Response>((resolve) => {
        waiting = resolve;
      });
    };
  });
}

// Reads the stub's last request body, for a test to check what was sent.
export function chatBody(page: Page): Promise<string | undefined> {
  return page.evaluate(() => window.__chat.body);
}

// The stub's controls, each run in the page.
export function chat(page: Page) {
  return {
    open: (status = 200) => page.evaluate((code) => window.__chat.open(code), status),
    send: (event: string, data: unknown) =>
      page.evaluate(({ name, payload }) => window.__chat.send(name, payload), {
        name: event,
        payload: data,
      }),
    close: () => page.evaluate(() => window.__chat.close()),
    reply: (status: number, contentType: string, body: string) =>
      page.evaluate(({ code, type, text }) => window.__chat.reply(code, type, text), {
        code: status,
        type: contentType,
        text: body,
      }),
  };
}
