// A citation the model writes after a sentence, such as [src:projects/quark] or [src:about, skills] (Grounding 3).
// The answer streams in chunks, so a citation can arrive split across them. Nothing that could still become
// one is sent until it is known not to be.

// A bracket that could still become a citation is held for at most this many characters. Ids are short, so a
// longer run is a bracket that will never close, and it must not stall the answer.
const MAX_CITATION_CHARS = 120;

// The same tolerance as `neutralise()` in lib/knowledge.ts: any case, and spaces around the parts.
const CITATION = /^\[\s*src\s*:([^\]\n]{0,120})\]/i;
// What a citation can still be while it arrives: "[", "[ s", "[sr", "[src".
const OPENING = /^\[\s*(?:s(?:\s*r(?:\s*c)?)?)?\s*$/i;
// "[src", then the colon and the ids so far.
const OPEN_CITATION = /^\[\s*src\s*(?::[^\]\n]*)?$/i;

export type CitationStripper = {
  // Returns the text that is safe to send now. Text that might still become a citation is kept.
  push: (chunk: string) => string;
  // Returns what is left at the end of the answer. Trailing whitespace is trimmed, and a citation that
  // never closed is dropped.
  finish: () => string;
  // The source ids seen so far, in the order first cited, with no repeats.
  cited: () => string[];
};

function idsIn(list: string): string[] {
  return list
    .split(",")
    .map((part) =>
      part
        .trim()
        .replace(/^src\s*:\s*/i, "")
        .trim(),
    )
    .filter((id) => id !== "");
}

// A stateful filter. A citation is removed together with the whitespace before it, so
// "years [src:about]." becomes "years.", and "years. [src:about] Next" becomes "years. Next".
export function createCitationStripper(): CitationStripper {
  // What has not been sent: whitespace that might sit before a citation, or a "[" that might start one.
  let held = "";
  const ids: string[] = [];

  function drain(chunk: string, final: boolean): string {
    let pending = held + chunk;
    let out = "";
    held = "";
    for (;;) {
      const at = pending.indexOf("[");
      if (at === -1) {
        // Whitespace-only text is held, since it can sit before a "[" that arrives next.
        if (!final && pending.trim() === "") {
          held = pending;
          return out;
        }
        return out + (final ? pending.trimEnd() : pending);
      }

      const before = pending.slice(0, at).trimEnd();
      const gap = pending.slice(before.length, at);
      const rest = pending.slice(at);

      const citation = CITATION.exec(rest);
      if (citation !== null) {
        ids.push(...idsIn(citation[1] ?? ""));
        out += before;
        pending = rest.slice(citation[0].length);
        continue;
      }

      const open =
        rest.length <= MAX_CITATION_CHARS && (OPENING.test(rest) || OPEN_CITATION.test(rest));
      if (open) {
        // Only the whitespace in front of the bracket and the bracket are held back.
        if (!final) held = gap + rest;
        return out + before;
      }

      // Not a citation: the bracket is ordinary text, and the scan goes on after it.
      out += before + gap + "[";
      pending = rest.slice(1);
    }
  }

  return {
    push: (chunk) => drain(chunk, false),
    finish: () => drain("", true),
    cited: () => [...new Set(ids)],
  };
}
