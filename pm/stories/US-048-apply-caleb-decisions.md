---
id: US-048
title: Apply Caleb's decisions D-003 and D-006 to D-010
sprint: backlog
status: done
owner: Claude
points: 2
priority: P0
depends_on: []
spec: Process (pm/decisions.md)
---

# US-048 · Apply Caleb's decisions D-003 and D-006 to D-010

As **Caleb**, I want my answers on the waiting list reflected in the instructions and stories, so that the builder follows what I decided.

## Acceptance criteria

- [x] D-003, D-006 and D-007 recorded as decided with the defaults
- [x] D-008 (push straight to `main` when all tests pass) applied: AGENTS.md workflow, README, CODING.md, the board's Review wording, US-001 and US-008 criteria, and a pre-push hook added to US-002
- [x] D-010 (placeholder SDET content now, real content later) applied: placeholder rules in CODING.md, US-009 moved to S07, US-012 reworked without the US-009 dependency, US-011/US-034 notes, new US-049 gating launch (US-039 depends on it), S02 gate text
- [x] The project's `.claude/settings.json` (from Caleb) committed, so builder sessions may push to `main`

## Files to touch

- `AGENTS.md`, `docs/CODING.md`, `pm/README.md`, `pm/decisions.md`, `pm/scripts/board.mjs`, `pm/sprints/S02-content-pages.md`
- `pm/stories/`: US-001, US-002, US-008, US-009, US-011, US-012, US-034, US-039, new US-049
- `.claude/settings.json` (written by Caleb)

## Out of scope

- Refining S02–S07 stories beyond what these decisions change

## Tests to add

- None: documents only. `node pm/scripts/board.mjs --check` passes.

## Notes

- Caleb wrote his answers into the generated WAITING-ON-CALEB.md on 2026-10-12, and they were moved into decisions.md. The script overwrites that file, so answers belong in chat or in decisions.md.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Decisions applied and pushed straight to `main` (first push under D-008) · see git log · `board.mjs --check` passes
