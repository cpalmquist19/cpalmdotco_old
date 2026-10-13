---
id: US-003
title: Design tokens and fonts
sprint: S01
status: todo
owner: Claude
points: 2
priority: P0
depends_on: [US-002]
spec: Design tokens and components
---

# US-003 · Design tokens and fonts

As a **visitor**, I want a consistent warm-monochrome look in light and dark, so that the site feels deliberate in either theme.

## Acceptance criteria

- [ ] Light and dark tokens from *Design tokens and components* live in `app/globals.css` and are mapped into Tailwind
- [ ] Dark theme redefines the same variable names; no component checks which theme is on
- [ ] Geist Sans and Geist Mono load via `next/font` with no layout shift
- [ ] Base palette matches decision D-003

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
