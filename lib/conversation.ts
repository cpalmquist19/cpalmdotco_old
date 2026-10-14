import { z } from "zod";
import type { AnswerLink } from "@/lib/answer-links";
import { CHAT_ERROR_CODES, type ChatErrorCode } from "@/lib/chat-client";
import type { Command } from "@/lib/content-schemas";

// The conversation is what the visitor has asked so far, in order. Each history entry keeps its own list
// under one key, so Back restores the thread that entry had (US-023 F2.3). A turn is either a command name
// (a chip, palette or sidebar ask) or a free-text exchange (US-032, D-053).
// Client components import from here, so this file must not read the content folder.

// A free-text question and its answer. `error` is set when the answer ended in a failure, with the page to
// link to (F4.8). A stopped answer has its text and no links, follow-ups or error.
export type Exchange = {
  question: string;
  answer: string;
  links: AnswerLink[];
  followups: string[];
  error?: { code: ChatErrorCode; fallback: string };
};

export type Turn = string | Exchange;

// What the thread renders: a command's two messages, or a free-text question and its answer.
export type ThreadMessage =
  | { role: "visitor"; command: Command }
  | { role: "bot"; command: Command }
  | { role: "visitor"; text: string }
  | { role: "bot"; exchange: Exchange };

const linkSchema = z.strictObject({ label: z.string(), href: z.string().startsWith("/") });

// An exchange read from history. An unknown key or a missing question makes it invalid, and it is dropped.
const exchangeSchema = z.strictObject({
  question: z.string().min(1),
  answer: z.string(),
  links: z.array(linkSchema),
  followups: z.array(z.string()),
  error: z
    .strictObject({ code: z.enum(CHAT_ERROR_CODES), fallback: z.string().startsWith("/") })
    .optional(),
});

const historySchema = z.object({ turns: z.array(z.unknown()) });

export function askedThread(thread: readonly Turn[], command: string): Turn[] {
  return [...thread, command];
}

// What `history.pushState` stores for a thread. Next adds its own keys to the same object.
export function historyState(thread: readonly Turn[]): { turns: Turn[] } {
  return { turns: [...thread] };
}

// Reads a thread back from `history.state`. Any other shape gives an empty thread. A command name that is no
// longer in commands.json is dropped, so a stale entry can't render a broken answer, and so is an exchange
// that doesn't match its schema.
export function threadFromState(state: unknown, commands: readonly Command[]): Turn[] {
  const parsed = historySchema.safeParse(state);
  if (!parsed.success) return [];
  const known = new Set(commands.map((command) => command.command));
  return parsed.data.turns.flatMap((turn): Turn[] => {
    if (typeof turn === "string") return known.has(turn) ? [turn] : [];
    const exchange = exchangeSchema.safeParse(turn);
    return exchange.success ? [exchange.data] : [];
  });
}

// A command is a visitor message followed by its answer. An exchange is the question followed by its answer.
export function messagesFor(
  thread: readonly Turn[],
  commands: readonly Command[],
): ThreadMessage[] {
  return thread.flatMap((turn): ThreadMessage[] => {
    if (typeof turn !== "string") {
      return [
        { role: "visitor", text: turn.question },
        { role: "bot", exchange: turn },
      ];
    }
    const command = commands.find((item) => item.command === turn);
    if (command === undefined) return [];
    return [
      { role: "visitor", command },
      { role: "bot", command },
    ];
  });
}
