---
id: US-028
title: Knowledge-pack builder
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-012]
spec: Chat backend › Grounding
---

# US-028 · Knowledge-pack builder

As the **builder**, I want all content compiled into one tagged knowledge pack, so that the model can only answer from real facts.

## Acceptance criteria

- [ ] `lib/knowledge.ts` turns every content file into a section tagged `[src:<id>]` (Grounding 1)
- [ ] Writes `knowledge.txt` at build time
- [ ] Vitest unit tests cover the builder

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
