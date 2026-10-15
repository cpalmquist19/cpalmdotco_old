---
id: S06
name: Evals and quality gates
status: planned
start:
end:
---

# S06 · Evals and quality gates

**Goal:** The grounded-answer eval and a11y/performance checks block merging.

**Review gate:** The eval scores at least 48 of 50, with zero hallucination or injection failures.

**Decisions needed first:** none (see [decisions.md](../decisions.md))

## Stories

This list is generated from the `sprint: S06` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-034](../stories/US-034-grounded-answer-eval.md) | 50-case grounded-answer eval | ⬜ todo · ready | Claude | P0 | 5 | 0/6 | ~~US-033~~ |
| [US-035](../stories/US-035-a11y-and-lighthouse-ci.md) | axe and Lighthouse CI as required checks | ⬜ todo · ready | Claude | P0 | 3 | 0/3 | ~~US-018~~, ~~US-050~~ |
| [US-036](../stories/US-036-eval-report-and-badge.md) | Eval report, badge and /how-was-this-tested | ⬜ todo | Claude | P1 | 3 | 0/3 | US-034, US-035 |
| [US-084](../stories/US-084-eval-api-key-secret.md) | Add the eval's API key as a GitHub secret | ⬜ todo · ready | Caleb | P0 | 1 | 0/2 | — |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: The eval scores at least 48 of 50, with zero hallucination or injection failures.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
