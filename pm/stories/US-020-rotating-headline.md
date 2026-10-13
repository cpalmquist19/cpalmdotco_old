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

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
