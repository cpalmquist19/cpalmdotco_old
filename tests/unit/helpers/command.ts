import type { Command } from "@/lib/content-schemas";

// A commands.json entry with the fields a test doesn't set filled in. The test names the fields it reads.
export function commandOf(
  fields: Pick<Command, "command" | "label" | "answer" | "order"> & Partial<Command>,
): Command {
  return { description: `${fields.label} page`, chip: true, icon: "user", ...fields };
}
