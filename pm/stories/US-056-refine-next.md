---
id: US-056
title: Scope stories as they come up, not when their sprint starts
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: []
spec: —
---

# US-056 · Scope stories as they come up, not when their sprint starts

As **Caleb**, I want stories scoped while their last dependency is being built, so that none becomes startable unscoped, the way US-011 did.

## Acceptance criteria

- [x] `BOARD.md` has a **Refine next** section listing Claude stories that aren't scoped yet and are one story away from starting: every dependency is done, in progress, in review, or itself ready
- [x] It's a list, not a warning, so it doesn't add to the warnings agents report
- [x] `pm/README.md` (Definition of ready) and `AGENTS.md` say to scope stories from that list, rather than only before a sprint starts
- [x] Vitest tests cover the list

## Files to touch

- `pm/scripts/board.mjs`: the **Refine next** section
- `pm/README.md`: Definition of ready
- `AGENTS.md`: step 11 of *How to work a story*
- `tests/unit/pm/scripts/board.test.ts`: extend

## Out of scope

- Scoping the stories the list shows. Each pass is its own story, when Caleb says
- Changing the existing "can start but isn't ready" warning. It stays as the last line of defence
- Looking further ahead than one story

## Tests to add

In `tests/unit/pm/scripts/board.test.ts`, reading the generated `BOARD.md` from the temp folder:

- `US-056: an unscoped story whose dependency is ready is listed`
- `US-056: an unscoped story whose dependency is in progress is listed`
- `US-056: scoped, startable, Caleb-owned and two-steps-away stories aren't listed`
- `US-056: the list says None when there's nothing to scope`

## Notes

- "Ready" here is the board's existing meaning: `todo` with every dependency done. A startable unscoped story isn't listed, because the warning already covers it.
- Today the list is empty. With the S02 stories scoped in US-054, it first fills while US-011 is being built (US-022 depends only on US-011).

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Added **Refine next** to the board, the README and AGENTS.md rules, and 4 unit tests. The list is empty today; it first fills while US-011 is built. Fixed a test-helper bug on the way: a scoped test story with no files counted as unscoped · this commit · `npm run verify` passed (21 unit tests); e2e in the pre-push hook
2026-10-13 · Started: Caleb asked for the second follow-up from US-054 · — · —
