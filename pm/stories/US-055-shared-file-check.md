---
id: US-055
title: Warn when two stories touch the same file out of order
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: []
spec: —
---

# US-055 · Warn when two stories touch the same file out of order

As **Caleb**, I want the board to catch two stories that change the same file with no order between them, so that a builder never finds another story's half of the work missing or already done.

## Acceptance criteria

- [x] `board.mjs` warns when two unfinished stories name the same file in **Files to touch** and neither depends on the other, directly or through other stories
- [x] A glob in **Files to touch** (`components/shell/*.tsx`, `tests/unit/fixtures/content/**`) matches the files under it
- [x] Only the paths before a line's description count, and `pm/` files are ignored (every story touches the board)
- [x] `npm run verify` fails if the committed stories have such a pair
- [x] Vitest tests cover each criterion above

## Files to touch

- `pm/scripts/board.mjs`: the check
- `pm/README.md`: describe the warning under *Validation*
- `tests/unit/pm/scripts/board.test.ts`

## Out of scope

- Making `board.mjs --check` fail on warnings. The unit test is the gate, for this warning only
- Comparing what two stories do to a file. Any shared file without an order is flagged
- Earlier refinement of stories (US-056)

## Tests to add

All in `tests/unit/pm/scripts/board.test.ts`. Each test writes a small `pm/` folder to a temp directory, copies `board.mjs` into it, runs it with Node and reads its warnings:

- `US-055: warns when two open stories touch the same file and neither depends on the other`
- `US-055: no warning when one depends on the other, directly or through another story`
- `US-055: a glob matches the files under it`
- `US-055: done stories and pm/ files are ignored`
- `US-055: only paths before the description count`
- `US-055: the committed stories have no unordered shared files`: runs the real script and expects no such warning

## Notes

- A path is a backticked token with a `/` or `.` and no spaces, before the first `: ` on the line (the description). `npm install zod yaml` and `zod` don't count.
- `board.mjs` finds `pm/` from its own location, so copying it into a temp `pm/scripts/` folder runs it on test data without any change to the script.
- First found while scoping S02 in US-054, where a scratch version of this check found four unordered pairs.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Added the check to `board.mjs`, the README line and 6 unit tests. On the committed stories it finds no unordered pairs, matching the scratch check in US-054 · this commit · `npm run verify` passed (17 unit tests); e2e in the pre-push hook
2026-10-13 · Started: Caleb asked for the shared-file check from US-054's follow-ups · — · —
