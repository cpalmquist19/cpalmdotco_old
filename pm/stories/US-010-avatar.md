---
id: US-010
title: Headshot or monogram avatar
sprint: S02
status: todo
owner: Caleb
points: 1
priority: P2
depends_on: []
spec: Inputs needed from you › Assets
---

# US-010 · Headshot or monogram avatar

As the **site owner**, I want my own avatar in the sidebar and chat, so that the site feels personal.

## Acceptance criteria

- [ ] Square headshot ≥ 400 px supplied, **or** monogram avatar approved
- [ ] If a headshot: the image file is shared with Claude (in chat as a file path, or committed anywhere in the repo)

## Notes

- A monogram needs nothing more from Caleb: US-005 already builds `Avatar.tsx` from the initials in `profile.json`.
- If Caleb supplies a headshot, the builder adds a story to save it as `public/avatar.webp` and show it in `Avatar.tsx`. Caleb's part ends when the file is shared.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Saving `public/avatar.webp` moved out of this story, so it closes without Claude's work (US-052) · — · —
