---
id: US-052
title: Apply Caleb's answers to the US-002 review
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: []
spec: Process (AGENTS.md, pm/decisions.md); Testing and evals › Test suites
---

# US-052 · Apply Caleb's answers to the US-002 review

As **Caleb**, I want the rest of the US-002 review findings fixed in the rules, the stories and the e2e config, so that the next builder can't repeat them.

## Acceptance criteria

- [x] AGENTS.md: choices a story doesn't specify, and settings not in a story's Notes, are recorded (decisions table for behaviour changes, a reason in the Log for the rest), and `pm/decisions.md` may always be edited
- [x] The four choices made in US-002 are rows in the "made during the build" table
- [x] The e2e tests never reuse a server that's already running, so the pre-push hook always tests a fresh build
- [x] AGENTS.md and `pm/README.md` say the finishing commit's Log entry reads `this commit`, since a commit can't contain its own hash
- [x] AGENTS.md forbids commands that throw away uncommitted work in the repo, and says how to test a clean checkout
- [x] Caleb's stories need no Claude work to close: the OG image approval moves from US-037 to US-038 (which US-039 now depends on), and US-010 asks only for Caleb's choice and file

## Files to touch

- `AGENTS.md`, `pm/README.md`, `pm/decisions.md`
- `playwright.config.ts`: `reuseExistingServer: false`
- `pm/stories/`: US-010, US-037, US-038, US-039, this story, and the generated pm files

## Out of scope

- Any other code change
- Refining S02–S07 stories beyond the changes above

## Tests to add

- None new. `npm run verify` and `npm run test:e2e` pass. By hand: with a server already on port 3000, `npm run test:e2e` must fail instead of reusing it

## Notes

- Caleb's answers to the review are in the 2026-10-13 session that produced US-051.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Rules, decisions D-011 to D-015, story splits and `reuseExistingServer: false` applied. By hand: with a stray server on port 3000, `npm run test:e2e` failed with "http://localhost:3000 is already used" instead of reusing it; that server was then stopped by its PID · this commit · `npm run verify` ✔, `npm run test:e2e` ✔ in the pre-push hook
2026-10-13 · Started at Caleb's request · — · —
