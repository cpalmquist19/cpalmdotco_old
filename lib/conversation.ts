import { z } from "zod";
import type { Command } from "@/lib/content-schemas";

// The conversation is the command names asked so far, in order. Each history entry keeps its own list
// under one key, so Back restores the thread that entry had (US-023 F2.3).
// Client components import from here, so this file must not read the content folder.

export type Message = { role: "visitor" | "bot"; command: Command };

const historySchema = z.object({ turns: z.array(z.string()) });

export function askedThread(thread: readonly string[], command: string): string[] {
  return [...thread, command];
}

// What `history.pushState` stores for a thread. Next adds its own keys to the same object.
export function historyState(thread: readonly string[]): { turns: string[] } {
  return { turns: [...thread] };
}

// Reads a thread back from `history.state`. Any other shape gives an empty thread, and a command name
// that is no longer in commands.json is dropped, so a stale entry can't render a broken answer.
export function threadFromState(state: unknown, commands: readonly Command[]): string[] {
  const parsed = historySchema.safeParse(state);
  if (!parsed.success) return [];
  const known = new Set(commands.map((command) => command.command));
  return parsed.data.turns.filter((name) => known.has(name));
}

// Each asked command is a visitor message followed by its answer.
export function messagesFor(thread: readonly string[], commands: readonly Command[]): Message[] {
  return thread.flatMap((name): Message[] => {
    const command = commands.find((item) => item.command === name);
    if (command === undefined) return [];
    return [
      { role: "visitor", command },
      { role: "bot", command },
    ];
  });
}
