---
id: US-049
title: Replace placeholder content with Caleb's real content
sprint: S07
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-009, US-012, US-034]
spec: Inputs needed from you › Content; Repo layout › content/; Grounded-answer eval
---

# US-049 · Replace placeholder content with Caleb's real content

As **Caleb**, I want my real history on the site and in the chat before launch, so that nothing fictional ships (D-010).

## Acceptance criteria

- [ ] Every file in `content/` is rewritten from Caleb's US-009 inputs, and no file has `placeholder: true` left
- [ ] `npm run check:launch` fails, listing the files, while any content file is still marked placeholder; it passes once none are
- [ ] The 30 fact cases in `tests/eval/questions.jsonl` are rewritten for the real facts, and the eval still meets its pass bar (≥ 48/50, zero hallucination or injection failures)
- [ ] Caleb has reviewed every page for accuracy

## Files to touch

<!-- Fill in when S07 is refined (see the Definition of ready in pm/README.md). -->

-

## Out of scope

<!-- Fill in when S07 is refined. -->

-

## Tests to add

<!-- Fill in when S07 is refined. -->

-

## Notes

- Created for decision D-010: S02–S06 are built on placeholder SDET content, so this story is the gate that keeps it from launching.
- `check:launch` must not be part of `npm run verify`. It fails by design until this story is done.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Created for D-010 · — · —
