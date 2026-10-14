import type { Command } from "@/lib/content-schemas";

// The page an error points to when no page matches the question, and the default for every error (F4.8).
export const FALLBACK_PAGE = "/about/";

// A label matches its word in any case, with or without a trailing "s": "Projects" matches "project" and "PROJECTS".
function wordPattern(label: string): RegExp {
  const stem = label
    .toLowerCase()
    .replace(/s$/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${stem}s?\\b`, "gi");
}

// The static page that matches the question (F4.8). The first-listed command whose label is a whole word in the
// question wins, unless several match, and then the one whose word comes last in the question wins: "what do you
// know about projects" gives Projects, not About. A question with no label gives FALLBACK_PAGE. It is a
// heuristic, and the tests pin it. A command that answers with "model" names no page, so it can't match.
export function fallbackFor(question: string, commands: readonly Command[]): string {
  let best: { page: string; at: number } | undefined;
  for (const command of commands) {
    if (!command.answer.startsWith("/")) continue;
    for (const match of question.matchAll(wordPattern(command.label))) {
      if (best === undefined || match.index > best.at) {
        best = { page: command.answer, at: match.index };
      }
    }
  }
  return best?.page ?? FALLBACK_PAGE;
}
