---
id: US-025
title: Slash command palette
sprint: S04
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-022]
spec: F3.1–F3.5; CommandPalette
---

# US-025 · Slash command palette

As a **power user**, I want a `/` palette, so that I can jump to any topic from the keyboard.

## Acceptance criteria

- [ ] `/` in an empty input opens the palette above the input; bottom sheet under 640 px (F3.1)
- [ ] Text after `/` fuzzy-filters by command and description (F3.2)
- [ ] ↑/↓ move and wrap; Enter or Tab runs; Esc closes and keeps the typed text (F3.3)
- [ ] Input is `role=combobox` with `aria-expanded` and `aria-activedescendant`; list is a `listbox` of `option`s (F3.4)
- [ ] The "More" chip opens the same palette (F3.5)

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
