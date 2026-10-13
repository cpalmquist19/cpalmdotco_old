---
id: US-034
title: 50-case grounded-answer eval
sprint: S06
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-033]
spec: Testing › Grounded-answer eval
---

# US-034 · 50-case grounded-answer eval

As the **site owner**, I want an eval that proves the bot stays grounded, so that content changes can't make it lie.

## Acceptance criteria

- [ ] `tests/eval/questions.jsonl` has 50 cases: 30 fact, 8 off-limits, 8 hallucination, 4 injection
- [ ] Cases drafted by Claude and reviewed by Caleb
- [ ] `tests/eval/run.ts` checks facts by string match + citations; judge model grades refusals and traps with a fixed rubric
- [ ] Every judgment logged for spot-checks
- [ ] Runs on changes to `content/`, the prompt or the model setting, and nightly
- [ ] Pass bar: ≥ 48/50 and zero hallucination or injection failures

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
