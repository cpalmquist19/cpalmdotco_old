---
id: US-022
title: commands.json as the single source
sprint: S04
status: done
owner: Claude
points: 1
priority: P0
depends_on: [US-011]
spec: Content schemas › commands.json
---

# US-022 · commands.json as the single source

As the **site owner**, I want chips, the palette and the sidebar to read from one file, so that adding a command is one entry.

## Acceptance criteria

- [x] An entry with `chip: true` must have a page `answer` (a path), not `"model"`, because a chip is a link to its page (F2.2)
- [x] `order` is unique across the entries, so the chip and palette order is never a tie (F2.1)
- [x] Each rule's failure names the entry's index and the field to change, in the loader's usual `content/commands.json: <index>.<field>: <message>` line

## Files to touch

- `lib/content-schemas.ts`: `commandSchema` refuses a chip whose `answer` is `"model"`; `commandsSchema` refuses a repeated `order`
- `tests/unit/lib/content-schemas.test.ts`: the new tests, and the `chip: false` fixture change described in Notes

## Out of scope

- Chips, the palette and any other UI: US-023 and US-025
- Sidebar wiring: US-024. That story also adds the loader check that every `askAbout` command has a page `answer`, because it needs `profile.json` and `lib/content.ts`, which US-067 and US-029 also change
- A `related` field for follow-ups: the schema has none, and US-030 decides it
- Changing, adding or removing entries in `content/commands.json`, or any field's name (D-009, D-016)
- Entries with `answer: "model"`: none exist until S05, so this story adds none

## Tests to add

`tests/unit/lib/content-schemas.test.ts`:

- `US-022 F2.2: a chip with answer "model" is rejected, and a non-chip with answer "model" is accepted`
- `US-022 F2.2: a chip with a page answer is accepted`
- `US-022 F2.1: two entries with the same order are rejected, and the issue points at the second one's order`
- `US-022 F2.1: entries with different orders are accepted`
- `US-022: a rejected chip answer points at the answer field`

## Notes

- **What exists.** `content/commands.json` has five entries, all `chip: true` with page answers. `commandSchema` and `commandsSchema` are in `lib/content-schemas.ts`. `lib/content.ts` sorts by `order`, rejects a repeated `command`, and checks every `profile.sidebar.askAbout` name. The real file is loaded by the existing `content.test.ts`, so it also proves the real content passes both new rules.
- **Existing test to adjust.** `US-011: command answer accepts "model"` spreads the `command` fixture, which has `chip: true`, so it fails once the rule exists. Change that one test to `{ ...command, chip: false, answer: "model" }`. This is the rule working, not a weakened test: a chip answering with `"model"` is exactly what's now refused. Say so in the Log.
- **Zod 4.** Use `.refine` on `commandSchema` with `path: ["answer"]`, and `.superRefine` (or `.check`) on the array with `path: [index, "order"]`. `commandSchema` is used with `z.infer` and `safeParse`; keep both working. No `as`.
- **Why `order` is unique across all entries, not only chips.** The palette lists every command by `order`, so a tie there is as unstable as one among chips.
- **Where chips and the palette read it.** Not here. The sidebar already reads it (US-005). US-023 and US-025 each include a test that proves their component reads `commands.json`, so don't tick "chips and palette read it" in this story.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Done. The share-toast WebKit flake that blocked this story was fixed in US-074 (the tests clicked before the page hydrated, and one measured against the 2 s toast timer in real time). On the combined tree, `npm run test:e2e` passed all 361 tests. A second full run had 5 WebKit "Page crashed" failures in unrelated specs (about-cv, content-pages, experience, headline), the crash US-066's Log already records; none of them touch this story's code. No test was skipped or weakened · this commit · `npm run verify` passes (126/126 unit tests); `npm run test:e2e`: 361 passed
2026-10-14 · Port 3000 is free, so `test:e2e` ran. Run 1: 360 passed, 1 failed: [webkit] US-007 F0.4 "share copies the URL and shows a toast" (no "Link copied" in the status region). That file then passed 3 times in a row. Run 2: 359 passed, 2 failed, both [webkit]: US-007 F0.4 share toast again, and US-005 F0.3 "collapsed state survives reload" (the flake US-073 covers). This story changes only `lib/content-schemas.ts` and its unit tests, so neither failing test touches its code. CODING § 9 counts a test that sometimes fails as failing, so the story can't be marked done. No test was skipped or weakened. Question for Caleb: should I do US-073 next, and what about the share toast: a new story, or fold it into US-073? The work is uncommitted · — · `npm run test:e2e`: run 1 1 failed / 360 passed; run 2 2 failed / 359 passed (both WebKit)
2026-10-14 · Blocked at the e2e gate. `npm run test:e2e` stops before any test runs: port 3000 is held by PID 35628, a `next start` from `C:\Code\CalebFromMaine\sproki`, not started in this session, so I left it running (AGENTS.md, Servers and processes). `playwright.config.ts` hardcodes port 3000 in `baseURL` and `webServer`, and `reuseExistingServer` is false (D-015), so the suite can't run on another port without a config change, which this story doesn't allow. **Question for Caleb:** stop that server, or tell me it's fine to, and I'll run `test:e2e`, commit and push. The work is uncommitted in the working tree · — · `npm run test:e2e`: failed to start, "http://localhost:3000 is already used" (run twice, same result)
2026-10-14 · Built the two rules: `commandSchema` refuses a chip whose `answer` is "model" (path `answer`), and `commandsSchema` refuses a repeated `order` (path `[index, "order"]`). Changed the US-011 test "command answer accepts model" to `chip: false`, as Notes say: the rule working, not a weakened test. Added the five US-022 tests. Checked the loader lines: `content/commands.json: 1.order: must be unique, but entry 0 already has order 1` and `content/commands.json: 1.answer: a chip links to its page, so answer must be a page path, not "model"` · — · `vitest content-schemas.test.ts` 40/40; `npm run verify` passes (126/126 unit tests, lint, typecheck, format, board check)
2026-10-14 · Started. Read the story, the spec's commands.json section, CODING.md and D-009, D-016 · — · —
2026-10-14 · Scoped in US-072. Most of the original story was built by US-011 and US-012, so the criteria are now the two rules that were missing, and the estimate drops from 2 points to 1 · — · —
