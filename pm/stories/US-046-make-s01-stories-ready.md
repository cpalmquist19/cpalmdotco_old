---
id: US-046
title: Make the S01 stories ready for handoff
sprint: backlog
status: review
owner: Claude
points: 3
priority: P1
depends_on: []
spec: Phase 1; F0
---

# US-046 · Make the S01 stories ready for handoff

As **Caleb**, I want every S01 story to say exactly what to touch, what not to, and what to test, so that a less capable model doesn't have to guess.

## Acceptance criteria

- [x] The story template has required **Files to touch**, **Out of scope** and **Tests to add** sections
- [x] `board.mjs` warns when a startable Claude story is missing any of those sections (definition of ready), and the README describes it
- [x] US-002 to US-008 have all three sections filled in, with exact values where the spec leaves a gap (storage keys, colours, scripts, config, accessible names)
- [x] Gaps that would block S01 are fixed: Playwright setup moves to US-002 and the e2e CI job to US-008 (from US-018); the sidebar/icon data shape is recorded as D-009

## Files to touch

- `pm/templates/story.md`, `pm/scripts/board.mjs`, `pm/README.md`
- `pm/stories/US-002` to `US-008`, `US-011`, `US-018`, `US-022`, `pm/decisions.md`, `docs/CODING.md` (test tags)

## Out of scope

- Refining S02–S07 stories. Do that before each sprint starts (the board warning will flag them)

## Tests to add

- None: documents and a script warning. The warning was checked by hand (see Log).

## Notes

- Design details the spec doesn't give (64 px rail, rail contents, drawer styling) are written into the stories as defaults. Caleb can change them at the S01 gate.
- US-002 went from 3 to 5 points and US-008 from 2 to 3. US-007 now depends on US-006.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-12 · Template sections, ready-check warning, S01 stories refined, US-018 hand-off, D-009 · branch us-045-047-agent-readiness · on a scratch copy with US-001 done, the script warned "US-002 can start but isn't ready"; with the refined stories it no longer warns
