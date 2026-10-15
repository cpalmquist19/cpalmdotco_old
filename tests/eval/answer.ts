import { createChatHandler } from "@/lib/chat";
import type { ChatProvider } from "@/lib/chat-provider";
import { createCitationStripper } from "@/lib/citations";
import type { Answer } from "./grade";

export type Answerer = (question: string) => Promise<Answer>;

type Event = { event: string; data: unknown };

// The route's stream: blocks of `event:` and `data:` lines, separated by a blank line.
export function parseEvents(body: string): Event[] {
  return body
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => block !== "")
    .flatMap((block) => {
      const event = /^event: (.+)$/m.exec(block)?.[1];
      const data = /^data: (.+)$/m.exec(block)?.[1];
      if (event === undefined || data === undefined) return [];
      const parsed: unknown = JSON.parse(data);
      return [{ event, data: parsed }];
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Sends one question through the same handler `/api/chat` uses: its prompt, knowledge pack, provider and
// citation stripper (D-062). The limiter and kill switch are left out, so 50 questions in a minute are
// answered, and an environment with `CHAT_ENABLED=false` still runs.
export function createAnswerer(provider: ChatProvider): Answerer {
  return async (question) => {
    const raw: string[] = [];
    const reasons: string[] = [];
    const recording: ChatProvider = async function* (input) {
      for await (const chunk of provider(input)) {
        raw.push(chunk);
        yield chunk;
      }
    };
    const handle = createChatHandler(recording, {
      enabled: () => true,
      onLog: () => undefined,
      onError: (error) => {
        reasons.push(error instanceof Error ? error.message : "unknown error");
      },
    });
    const response = await handle(
      new Request("http://eval.invalid/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
      }),
    );
    const events = parseEvents(await response.text());

    // The model's raw text still has its citations, which the events don't carry.
    const stripper = createCitationStripper();
    stripper.push(raw.join(""));
    stripper.finish();

    const text = events
      .flatMap(({ event, data }) =>
        event === "token" && isRecord(data) && typeof data.t === "string" ? [data.t] : [],
      )
      .join("");
    const linksData = events.find(({ event }) => event === "links")?.data;
    const links = Array.isArray(linksData)
      ? linksData.flatMap((link: unknown) =>
          isRecord(link) && typeof link.label === "string" && typeof link.href === "string"
            ? [{ label: link.label, href: link.href }]
            : [],
        )
      : [];
    const failure = events.find(({ event }) => event === "error")?.data;
    const error =
      isRecord(failure) && typeof failure.code === "string"
        ? {
            code: failure.code,
            fallback: typeof failure.fallback === "string" ? failure.fallback : "",
          }
        : undefined;
    // A 400 is JSON, not a stream, so there are no events: report it as a failure too.
    const rejected = response.status === 400 ? { code: "invalid_body", fallback: "" } : undefined;
    const failed = error ?? rejected;

    return {
      text,
      cited: stripper.cited(),
      links,
      ...(failed === undefined ? {} : { error: failed }),
      ...(reasons.length === 0 ? {} : { detail: reasons.join("; ") }),
    };
  };
}
