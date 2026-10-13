---
id: US-045
title: Agent guide and coding standards
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: []
spec: Process (not in the build spec); supports every feature story
---

# US-045 · Agent guide and coding standards

As **Caleb**, I want clear, literal instructions and coding standards for the builder, so that a less capable model makes fewer mistakes when it's unsure.

## Acceptance criteria

- [x] `docs/CODING.md` sets checkable rules for stack, files, TypeScript, React, styling tokens, accessibility, content facts, secrets, tests, comments and lint
- [x] `AGENTS.md` has a step-by-step story workflow with exact commands, a "Never" list and "Stop and ask" rules
- [x] `AGENTS.md` says which document wins when they disagree, and how a finished story becomes `done` after merge
- [x] Open toolchain and branch-protection choices are added as decisions (D-007, D-008) instead of being left to the builder

## Files to touch

- `docs/CODING.md` (new), `AGENTS.md`, `pm/decisions.md`

## Out of scope

- Tooling that enforces the rules (US-002 configures ESLint, TypeScript and Prettier; US-003 adds the style-rules test)

## Tests to add

- None: documents only. Checked by review.

## Notes

- Rules that a tool can enforce are enforced by tools set up in US-002/US-003. The prose rules cover what tools can't check.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Approved by Caleb · PR #1 (merged by Caleb) · `board.mjs --check` passes
2026-10-12 · Wrote docs/CODING.md, rewrote AGENTS.md (workflow, Never, Stop and ask), added D-007 and D-008 · branch us-045-047-agent-readiness · `node pm/scripts/board.mjs --check` passes
