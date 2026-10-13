---
id: US-061
title: Sidebar rail: fix the scrollbar and pin the collapse button
sprint: S01
status: done
owner: Claude
points: 2
priority: P1
depends_on: [US-005]
spec: F0.1, F0.3; Sidebar
---

# US-061 · Sidebar rail: fix the scrollbar and pin the collapse button

As a **visitor**, I want the collapse button and the menu icons to stay where they are when I collapse or expand the sidebar, and no scrollbar in the rail, so that the sidebar doesn't jump under my cursor.

## Acceptance criteria

- [x] The collapsed 64 px rail has no horizontal overflow (no scrollbar), and neither does the expanded sidebar (F0.3)
- [x] The collapse/expand button is in the same place, at the same size, in both states (F0.3)
- [x] "New chat" and the ASK ABOUT icons keep the same vertical position when the sidebar collapses or expands (F0.3)
- [x] In the expanded sidebar the identity row reads, left to right: collapse button, avatar, name (F0.1; replaces the order in US-005)
- [x] Playwright tests cover each criterion above

## Files to touch

- `components/shell/Sidebar.tsx`: header row order, rail padding and alignment, keep the ASK ABOUT heading's space in the rail
- `tests/e2e/shell.spec.ts`: change the identity-row order assertion; add the three tests below
- `pm/decisions.md`: record the layout choice as D-021

## Out of scope

- Showing a headshot in the avatar (US-062)
- The top bar and the menu button's move into it (US-007)
- The drawer's layout. Its close button stays at the right of the identity row, because the drawer has no rail
- Changing the rail's width (`--rail-w`) or what the rail holds

## Tests to add

All in `tests/e2e/shell.spec.ts`, tagged `@desktop-only`:

- `US-061 F0.3: no horizontal overflow, expanded or collapsed`: `scrollWidth <= clientWidth` on the sidebar in both states
- `US-061 F0.3: collapse button stays in the same place`: its bounding box is identical before collapsing and after
- `US-061 F0.3: New chat and ASK ABOUT icons do not move`: same `y` for "New chat" and the first ASK ABOUT link in both states, and the same `x`
- Changed: `US-005 F0.1: sidebar sections appear in order` now expects collapse button, then avatar, then name

## Notes

- **Cause of the scrollbar:** the rail is 64 px, minus a 1 px border and 12 px padding each side, which leaves 39 px. Each icon link is 40 px (12 + 16 + 12). The 1 px overflow shows a horizontal scrollbar because the sidebar has `overflow-y-auto`.
- **Layout:** in the rail the content is left-aligned from the same 12 px padding as the expanded sidebar, with no right padding, so the collapse button's left edge doesn't move. The collapse button is `size-10`, the same 40 px as a menu item, so its icon centre lines up with the menu icons.
- **Rail header row:** only the collapse button. The avatar is hidden there (its name is already visually hidden). If Caleb wants the avatar in the rail, pin it to the bottom where the social row is.
- **Item height:** "New chat" and the ASK ABOUT links are fixed at `h-10` (40 px). They were 32 px in the rail, because the label's line height drops out when it is visually hidden, which pulled every icon up.
- **ASK ABOUT heading in the rail:** stays in the layout but is invisible, so the icons below it don't jump up by the heading's height. It stays in the accessibility tree.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · CI for 1d22ca2 passed (run 38450503074, 1m49s) · this commit · —
2026-10-13 · Built: header row is collapse button, avatar, name; rail keeps the left padding and drops the right (fixes the 1 px overflow); New chat and ASK ABOUT items fixed at `h-10`; the ASK ABOUT heading keeps its space in the rail. Recorded as D-021; US-011 now depends on this story (shared `components/shell/*.tsx`). The new overflow test fails with 1 px when the padding fix is removed · this commit · `npm run verify` passes; `npm run test:e2e`: 72 passed (chromium, webkit, mobile)
2026-10-13 · Started. Created from Caleb's review of the S01 preview: a horizontal scrollbar in the rail, and the collapse button and menu icons moving between states · — · —
