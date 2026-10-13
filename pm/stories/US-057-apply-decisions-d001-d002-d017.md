---
id: US-057
title: Apply Caleb's decisions D-001, D-002 and D-017
sprint: backlog
status: done
owner: Claude
points: 1
priority: P1
depends_on: []
spec: Process (pm/decisions.md)
---

# US-057 · Apply Caleb's decisions D-001, D-002 and D-017

As **Caleb**, I want my answers on the waiting list reflected in the decisions log and the stories, so that the builder follows what I decided.

## Acceptance criteria

- [x] D-001 (Next.js route for the MVP), D-002 (Claude API, Haiku 5.5 to start) and D-017 (`react-markdown`, no plugins) recorded as `decided` with ISO dates
- [x] US-014 keeps `react-markdown`'s default URL handling and tests that a `javascript:` link is neutralised; US-032 is told chat answers must do the same
- [x] D-004 and D-005 left `open` at Caleb's request; their recommended defaults apply if their sprint starts first

## Files to touch

- `pm/decisions.md`
- `pm/stories/US-014-about-contact-cv-pages.md`, `pm/stories/US-029-chat-route.md`, `pm/stories/US-032-chat-thread-ui.md`

## Out of scope

- D-004 and D-005: Caleb postponed both
- Building anything from these decisions (US-014, US-029, US-032)

## Tests to add

- None: documents only. `node pm/scripts/board.mjs --check` passes.

## Notes

- **Why a separate story.** The decisions were Caleb's uncommitted edits to `pm/decisions.md`. Per AGENTS.md, one story per commit, so they are applied here and not inside US-005.
- **Link safety (D-017).** Raw HTML is already dropped by `react-markdown`, and the visitor's own text is rendered as plain text, so the remaining route is a Markdown link such as `[x](javascript:alert(1))`. `react-markdown`'s default `urlTransform` removes those. The risk is overriding it, so US-014 now says not to.
- **Model (D-002).** The model id is `claude-haiku-5-5`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Decisions applied. Caleb's D-001 and D-002 dates changed from `10/13/26` to ISO; D-017 decided · this commit · `board.mjs --check` passes
