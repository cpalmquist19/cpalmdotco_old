---
id: US-023
title: Link-first suggested chips
sprint: S04
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-022, US-020]
spec: F2.1–F2.5; ChipRow, Chip
---

# US-023 · Link-first suggested chips

As a **visitor**, I want suggested questions under the input, so that I can explore without typing.

## Acceptance criteria

- [ ] Chips come from `commands.json` where `chip: true`, in `order` (F2.1)
- [ ] Each chip is an `<a href>` to its page and works with JS off (F2.2)
- [ ] With JS, a click posts the label as a visitor message, renders the answer inline and calls `pushState`; Back restores the previous state (F2.3)
- [ ] Centered under the input, one outlined fully-rounded style, Lucide icon before each label (F2.4)
- [ ] Fade and rise in with a 40 ms stagger after the hero finishes typing (F2.5)

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
