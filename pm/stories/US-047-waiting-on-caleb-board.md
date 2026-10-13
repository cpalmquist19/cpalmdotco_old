---
id: US-047
title: Waiting-on-Caleb board
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: []
spec: Process (not in the build spec)
---

# US-047 · Waiting-on-Caleb board

As **Caleb**, I want one list of everything waiting for my decision, input or approval, in the order to handle it, so that I never hold up the build without knowing.

## Acceptance criteria

- [x] `node pm/scripts/board.mjs` writes `pm/WAITING-ON-CALEB.md` from open decisions, Caleb's stories, stories in `review` or `blocked`, and sprints at their gate
- [x] Order: blocked, then review, then sprint gates; then decisions and Caleb's stories by the sprint that needs them, decisions first, then by how much work each unblocks
- [x] Each row says what to do, when (now / next sprint / later), which sprint needs it, and how many stories it unblocks
- [x] `--check` fails when the file is stale; malformed decision rows fail with a clear error
- [x] `BOARD.md` links to it instead of keeping its own list; `AGENTS.md`, `pm/README.md` and `decisions.md` explain how items get on and off it

## Files to touch

- `pm/scripts/board.mjs`, `pm/decisions.md`, `pm/README.md`, `AGENTS.md`

## Out of scope

- Notifications (email, GitHub issues). The file is the board

## Tests to add

- None: `pm/` has no test runner. Checked by hand (see Log).

## Notes

- Decisions are read from the first table in `decisions.md` ("Decisions for Caleb"). Each row's **Blocks** column must name a sprint.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Approved by Caleb · PR #1 (merged by Caleb) · `board.mjs --check` passes
2026-10-12 · Caleb's answers recorded in decisions.md: D-003/D-006/D-007 default; D-008 push to main when tests pass; D-010 placeholder SDET content. Still to apply: AGENTS/README workflow for D-008 (plus a pre-push hook in US-002), US-001/US-008 criteria, moving US-009 to S07, US-012 without the US-009 dependency, a new backfill story, and the S02 gate text. Approved: US-044 to US-047 (✅) · applied in US-048 · —
2026-10-12 · "Unblocks" now names the stories that wait on the item directly, with the knock-on total in brackets, after Caleb found "38 stories" confusing · committed with US-048 · regenerated, output checked
2026-10-12 · Generator, docs and decisions format · branch us-045-047-agent-readiness · manual on a scratch copy: a blocked story, a review story and a sprint at its gate sorted in that order at the top; a bad decision status and a Blocks value with no sprint each gave one clear error; `--check` passes on the real files
