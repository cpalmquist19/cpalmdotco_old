---
id: US-022
title: commands.json as the single source
sprint: S04
status: todo
owner: Claude
points: 1
priority: P0
depends_on: [US-011]
spec: Content schemas › commands.json
---

# US-022 · commands.json as the single source

As the **site owner**, I want chips, the palette and the sidebar to read from one file, so that adding a command is one entry.

## Acceptance criteria

- [ ] An entry with `chip: true` must have a page `answer` (a path), not `"model"`, because a chip is a link to its page (F2.2)
- [ ] `order` is unique across the entries, so the chip and palette order is never a tie (F2.1)
- [ ] Each rule's failure names the entry's index and the field to change, in the loader's usual `content/commands.json: <index>.<field>: <message>` line

## Files to touch

- `lib/content-schemas.ts`: `commandSchema` refuses a chip whose `answer` is `"model"`; `commandsSchema` refuses a repeated `order`
- `tests/unit/lib/content-schemas.test.ts`: the new tests, and the `chip: false` fixture change described in Notes

## Out of scope

- Chips, the palette and any other UI: US-023 and US-025
- Sidebar wiring and "Surprise me": US-024. That story also adds the loader check that every `askAbout` command has a page `answer`, because it needs `profile.json` and `lib/content.ts`, which US-067 and US-029 also change
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
2026-10-14 · Scoped in US-072. Most of the original story was built by US-011 and US-012, so the criteria are now the two rules that were missing, and the estimate drops from 2 points to 1 · — · —
