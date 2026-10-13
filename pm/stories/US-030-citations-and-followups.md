---
id: US-030
title: Citation-to-link mapping and follow-ups
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-029, US-022]
spec: Chat backend › Grounding; F4.4
---

# US-030 · Citation-to-link mapping and follow-ups

As a **visitor**, I want every answer to end with real page links and next questions, so that I'm never at a dead end.

## Acceptance criteria

- [ ] Server strips `[src:...]` citations from visible text (Grounding 3)
- [ ] Citations map to 1–2 page links; the model never produces a URL
- [ ] 2–3 follow-ups chosen from related `commands.json` entries
- [ ] Vitest unit tests for the mapping

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
