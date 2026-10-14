---
id: US-020
title: Rotating headline and caret
sprint: S03
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-019]
spec: F1.1–F1.6; RotatingHeadline, Caret
---

# US-020 · Rotating headline and caret

As a **visitor**, I want a lively headline of facts, so that I get a feel for Caleb before I ask anything.

## Acceptance criteria

- [ ] `<h1>` holds the greeting and full pool as `sr-only` text plus an `aria-hidden` animated copy (F1.1)
- [ ] Greeting plus 3 facts at ~64 px, bold, −0.03em; newest `--text`, others `--text-faint` (F1.2)
- [ ] Types at 30–45 ms/char (±15 ms jitter), holds 2.5–3 s, fades over 400 ms, replaces the oldest (F1.3)
- [ ] Pauses while the input has focus, the tab is hidden, or a conversation has started (F1.4)
- [ ] Reserves 3 lines so the input never moves (F1.5)
- [ ] `prefers-reduced-motion: reduce` shows a fixed set with no typing or fading (F1.6)
- [ ] `Caret` component is shared with the chat
- [ ] Skip link appears on the first Tab press and moves focus to the input (F1.7). The pill input is built here, above which the headline sits. Moved from US-019 on 2026-10-13

## Notes

- The pill input is the first thing this story builds on the home page. Until US-023, US-025 and US-032 add to it, it's a plain input. Render the skip link as the first Tab stop on the page, before the sidebar. Per the spec, it targets only the home page's input.
- Depends on US-019, so this story waits for Caleb's review of the headline pool.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Added the skip link (F1.7) as criterion 7, moved from US-019 on Caleb's choice. The story isn't scoped yet: its Files to touch, Out of scope and Tests to add are still to be written, and it should be scoped before it starts · — · —
