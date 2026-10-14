import type { Command } from "@/lib/content-schemas";
import type { AnswerLink } from "@/lib/answer-links";

// How many follow-up questions an answer ends with (F4.4). Fewer are offered only when fewer can be chosen.
const MAX_FOLLOWUPS = 3;

// Questions compare without case or surrounding spaces, so a question sent twice counts as asked once.
function normalise(question: string): string {
  return question.trim().toLowerCase();
}

// The 2–3 follow-up questions (D-046). A command is a candidate when it has a question and its page isn't one
// the answer links to. A link that starts with the command's answer is that page too, so "/projects/quark/"
// rules out "/projects". Questions the visitor has already asked come after the unasked ones, and each group
// keeps the commands.json order.
export function followupsFor({
  links,
  commands,
  asked,
}: {
  links: readonly AnswerLink[];
  commands: readonly Command[];
  asked: readonly string[];
}): string[] {
  const askedSet = new Set(asked.map(normalise));
  const candidates = [...commands]
    .sort((a, b) => a.order - b.order)
    .filter(
      (command): command is Command & { question: string } =>
        command.question !== undefined &&
        !links.some((link) => link.href.startsWith(command.answer)),
    );
  const unasked = candidates.filter((command) => !askedSet.has(normalise(command.question)));
  const repeated = candidates.filter((command) => askedSet.has(normalise(command.question)));
  return [...unasked, ...repeated].slice(0, MAX_FOLLOWUPS).map((command) => command.question);
}
