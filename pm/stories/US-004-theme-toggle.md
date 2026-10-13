---
id: US-004
title: Theme toggle with no-flash script
sprint: S01
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-003]
spec: F0.4–F0.6; ThemeToggle
---

# US-004 · Theme toggle with no-flash script

As a **visitor**, I want to switch between light and dark and have it remembered, so that the site stays the way I like it without flashing.

## Acceptance criteria

- [ ] Light is the default for first-time visitors regardless of OS setting (F0.5)
- [ ] Toggle writes `data-theme` on `<html>` and saves it in `localStorage` (F0.5)
- [ ] Inline `<head>` script applies the saved theme before first paint, with no flash (F0.5)
- [ ] Moon icon shows in light, sun in dark (F0.4)
- [ ] `theme-color` meta updates with the theme (F0.6)
- [ ] Playwright tests cover each criterion above

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
