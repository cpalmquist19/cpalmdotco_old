---
id: US-030
title: Citation-to-link mapping and follow-ups
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-029, US-022]
spec: Chat backend › Grounding 3, API contract; F4.4
---

# US-030 · Citation-to-link mapping and follow-ups

As a **visitor**, I want every answer to end with real page links and next questions, so that I'm never at a dead end.

## Acceptance criteria

- [ ] No `[src:…]` citation reaches a `token` event, including one that arrives split across chunks, and removing it leaves no stray space before the punctuation that followed it (Grounding 3)
- [ ] After the last token, `links` holds 1–2 `{ label, href }` pairs built only from the source ids the answer cited: in the order first cited, one per page, an id that isn't in the knowledge pack ignored. The model never produces a URL (Grounding 3, D-047)
- [ ] An answer with no valid citation (a decline, or "I don't have that detail") gets the Contact page as its one link, so no answer is a dead end (F4.4, D-047)
- [ ] `followups` holds 2–3 questions taken from `commands.json`: pages the answer didn't link, questions the visitor hasn't asked yet first, then in `order` (D-046)
- [ ] The route sends `token`…, `links`, `followups`, `done` in that order, with the citations gone from the text, and the unit tests cover the stripper, the link mapping and the follow-up choice

## Files to touch

- `lib/citations.ts`: new. `createCitationStripper()`, a stateful filter: `push(chunk)` returns the text that is safe to send, `finish()` returns what is left, and `cited()` returns the ids seen so far in order, without repeats. Pure, no imports from the content loader
- `lib/answer-links.ts`: new. `linksFor(cited, { sources, commands, projects })`: the 1–2 links (see Notes). Pure
- `lib/followups.ts`: new. `followupsFor({ links, commands, asked })`: the 2–3 questions. Pure
- `lib/chat.ts`: the handler pipes each chunk through the stripper, then sends `links` and `followups` from the two functions. `Options` gains `knowledge` and `content` (see Notes), with defaults that read the real content, so the route file doesn't change
- `lib/content-schemas.ts`: `question: text.optional()` on `commandSchema` (D-046)
- `content/commands.json`: a `question` on each of the five entries. Navigation copy, not facts; they stay `placeholder: true`
- `tests/unit/fixtures/content/commands.json`: the same `question` field on its entries, only if a test below needs it
- `tests/unit/lib/citations.test.ts`: new
- `tests/unit/lib/answer-links.test.ts`: new
- `tests/unit/lib/followups.test.ts`: new
- `tests/unit/lib/chat.test.ts`: the handler tests below. One US-029 test is rewritten, see Notes
- `tests/unit/lib/content-schemas.test.ts`: the new optional field

## Out of scope

- Rate limit, the character caps, the timeout, logging, the kill switch and a `fallback` page that depends on the question: US-031. This story keeps the constant `FALLBACK_PAGE`
- Showing links, follow-up chips or sanitized Markdown in the browser, and what a click on a follow-up does: US-032
- A `related` field in `commands.json`. With five commands, "every other page" is the related set. Add the field when the list outgrows that (D-046)
- Changing the system prompt. It already tells the model to cite as `[src:<id>]` (US-029, word for word from the spec)
- Changing how `lib/knowledge.ts` builds ids or hrefs (US-028, D-035, D-042)
- Any call to the Claude API. Every test uses a fake provider

## Tests to add

`tests/unit/lib/citations.test.ts`:

- `US-030: a citation inside one chunk is removed with the space before it`
- `US-030: a citation split across chunks, even one character at a time, is removed and nothing of it is sent`
- `US-030: text that only looks like the start of a citation is released unchanged once it can't be one`
- `US-030: "[ src : about ]" and "[SRC:about]" are removed like "[src:about]"`
- `US-030: an id list "[src:a, b]" and back-to-back citations give every id, once, in order`
- `US-030: a citation that never closes is dropped when the answer ends, and the other held text is released`
- `US-030: finish returns the held text without trailing whitespace`

`tests/unit/lib/answer-links.test.ts`:

- `US-030: one cited source becomes one link with its page's label and href`
- `US-030: a project source is labelled with the project's title`
- `US-030: two sources on one page (two experience entries) give one link`
- `US-030: more than two pages give the first two cited`
- `US-030: an id that isn't in the pack is ignored`
- `US-030: no valid citation gives the Contact page`
- `US-030: a page with no commands.json entry is left out, not shown with an invented label`

`tests/unit/lib/followups.test.ts`:

- `US-030: follow-ups skip the page the answer linked, including a project under /projects/`
- `US-030: questions the visitor already asked come last`
- `US-030: at most three, in order, and every one is a question from commands.json`
- `US-030: a command with no question is never offered`

`tests/unit/lib/chat.test.ts`:

- `US-030: the streamed text has no citation, and links and followups follow the last token`
- `US-030: a citation split across provider chunks is still removed from the tokens`
- `US-030: the text held back at the end is sent as a token before links`
- `US-030: an answer with no citation gets the Contact link`
- `US-030: a provider failure after a held chunk sends the error and no links` (the held text is dropped with the stream)

`tests/unit/lib/content-schemas.test.ts`:

- `US-030: a command may carry a question, and an empty one is rejected`

## Notes

- **Streaming is the hard part.** The model writes `[src:projects/quark]` token by token, so a chunk can end inside one. Hold back the longest tail that could still become a citation: a `[` that is followed only by a prefix of `[src:<id>]`, plus the whitespace in front of it. Release it when the next chunk shows it isn't one, or after 120 characters (ids are short; a `[` that never closes must not stall the answer for good). The pattern is as tolerant as `neutralise()` in `lib/knowledge.ts` (`[ src :`, any case), so what the pack can't contain is exactly what the stripper accepts.
- **Spacing.** The prompt asks for the citation "at the end of the sentence it supports". Remove the citation together with the whitespace before it: `years [src:about].` becomes `years.`, and `years. [src:about] Next` becomes `years. Next`. `finish()` trims trailing whitespace.
- **Several ids.** Accept `[src:a, b]` and `[src:a][src:b]`. Split on commas, trim, and drop a leading `src:` on a part. Match ids exactly (case-sensitive) against `getKnowledge().sources`.
- **Labels, not a change to the pack.** `KnowledgeSource` has `id` and `href`. For `projects/<slug>` the label is that project's `title`. For every other source it's the `label` of the `commands.json` entry whose `answer` equals the source's `href` (About, Experience, Skills, Contact). The mapper takes `{ sources, commands, projects }`, so `lib/knowledge.ts` stays as US-028 left it.
- **Links.** Walk the cited ids in order, skip unknown ones, skip a page already linked, stop at two. If nothing valid was cited, behave as if `profile` had been (its page is `/contact/`). A source whose page has no command is left out, and if that leaves nothing, `links` is `[]`: a missing label is a content problem, not a reason to make one up (CODING § 7).
- **Follow-ups (D-046).** A command is a candidate when it has a `question` and its `answer` isn't the page of a link (a link's `href` that starts with the command's `answer` counts, so `/projects/quark/` rules out `/projects`). Questions the visitor has already sent (compare trimmed, case-insensitively with the user messages in the request) sort after the unasked ones. Take three.
- **`asked`.** It's the `content` of every `user` message in the request after `lastMessages`. The handler already has them.
- **Handler options.** `knowledge?: () => Knowledge` (default `getKnowledge`) and `content?: () => { commands: Command[]; projects: Project[] }` (default reads `loadContent()` per request, like `getOffLimits()` does). Tests pass fixed ones, from `loadContent(FIXTURE_DIR)`.
- **What a held error means.** If the provider throws, the visitor-facing stream ends with the `error` event as in US-029. Whatever the stripper still holds is dropped, not flushed: an incomplete tail is not worth showing before an error line.
- **The US-029 test that has to change.** `US-029: links and followups are empty arrays for now` states what this story replaces. Rewrite it so it tests what is now true (it keeps its place and its US-029 id) and say so in the Log. It is not deleted or loosened. Every other US-029 test must pass unchanged.
- **The question wording** goes in `commands.json`, not in code, and carries no fact: "What's your background?", "Where have you worked?", "What have you built?", "What do you work with?", "How can I reach you?". US-049 replaces the placeholder content and may reword them.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Scoped in US-080. Added the `question` field and the three pure modules; recorded D-046 (follow-ups) and D-047 (links). The 4 acceptance criteria became 5: the route's event order is now its own criterion. Estimate stays 3 · — · —
