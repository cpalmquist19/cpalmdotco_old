---
id: US-063
title: Show the avatar in the collapsed rail
sprint: S01
status: done
owner: Claude
points: 1
priority: P1
depends_on: [US-061, US-062]
spec: F0.1, F0.3; Sidebar
---

# US-063 · Show the avatar in the collapsed rail

As the **site owner**, I want my avatar to show when the sidebar is collapsed too, so that the site still feels personal in the rail.

## Acceptance criteria

- [x] The avatar is visible in the collapsed 64 px rail, inside its bounds (F0.3)
- [x] It sits at the bottom of the rail, so nothing above it moves (F0.3, D-021)

## Files to touch

- `components/shell/Sidebar.tsx`: render the avatar at the bottom of the rail
- `tests/e2e/shell.spec.ts`: the test below
- `pm/decisions.md`: record D-023, which changes D-021's "the rail shows only the button"

## Out of scope

- Moving the avatar in the expanded sidebar, or the rail's width
- The social row in the rail. It stays hidden there

## Tests to add

In `tests/e2e/shell.spec.ts`, tagged `@desktop-only`:

- `US-063 F0.3: avatar shows in the rail, pinned to the bottom`: collapse; the `avatar` test id has loaded, sits inside the 64 px rail, and its bottom edge is within 32 px of the sidebar's bottom edge (the same rule as the social row)

## Notes

- The avatar can't sit beside the collapse button: 64 px holds one 40 px item. Above the button or under it would push "New chat" and the icons down, which D-021 exists to prevent. The bottom is free in the rail, because the social row is hidden there.
- It is inset `ml-1` (4 px) so its centre lines up with the menu icons: 12 + 4 + 16 = 32 px.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built: the avatar renders at the bottom of the rail (`mt-auto pt-6 pl-1`); recorded as D-023. CI for 698f9d4 (US-062) passed, run 38451000890. Checked by screenshot · this commit · `npm run verify` passes; `npm run test:e2e`: 78 passed (chromium, webkit, mobile)
2026-10-13 · Started. Caleb: "my avatar should show in both states" · — · —
