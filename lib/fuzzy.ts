import type { Command } from "@/lib/content-schemas";

// How well a command matches the query. A lower tier ranks higher (F3.2): a name prefix, then a match that
// starts at a word in the name, then any match in the name, then a match in the description (D-034).
const NAME_PREFIX = 0;
const WORD_START = 1;
const NAME = 2;
const DESCRIPTION = 3;

// Whether the characters of `query` appear in `text` in the same order, with anything between them.
function inOrder(query: string, text: string): boolean {
  let matched = 0;
  for (const char of text) {
    if (char === query[matched]) matched += 1;
  }
  return matched === query.length;
}

// Whether the query matches from the start of a word inside the name, such as "form" in "contact-form".
function startsAWord(query: string, name: string): boolean {
  for (let index = 1; index < name.length; index += 1) {
    const before = name[index - 1] ?? "";
    if (!/[a-z0-9]/.test(before) && name[index] === query[0] && inOrder(query, name.slice(index))) {
      return true;
    }
  }
  return false;
}

// Both arguments are lower case. The name is the command without its leading slash.
function tierOf(command: Command, query: string): number | null {
  const name = command.command.slice(1).toLowerCase();
  if (name.startsWith(query)) return NAME_PREFIX;
  if (startsAWord(query, name)) return WORD_START;
  if (inOrder(query, name)) return NAME;
  if (inOrder(query, command.description.toLowerCase())) return DESCRIPTION;
  return null;
}

// The commands that match the query, best match first. Within a tier the order in commands.json decides,
// so an empty query lists every command in order. Case is ignored.
export function rankCommands(commands: readonly Command[], query: string): Command[] {
  const needle = query.toLowerCase();
  return commands
    .flatMap((command) => {
      const tier = tierOf(command, needle);
      return tier === null ? [] : [{ command, tier }];
    })
    .sort((a, b) => a.tier - b.tier || a.command.order - b.command.order)
    .map(({ command }) => command);
}
