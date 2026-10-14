---
id: US-070
title: Link the sidebar name, avatar and New chat to the home page
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-005, US-061, US-063]
spec: F0.1
---

# US-070 · Link the sidebar name, avatar and New chat to the home page

As a **visitor**, I want the sidebar's name, avatar and "New chat" to take me to the home page, so that I can always get back to the start from any page.

## Acceptance criteria

- [x] In the expanded sidebar, the identity row reads collapse button, name, avatar from left to right, with the avatar directly after the name (F0.1; replaces the order in D-021)
- [x] The name and the avatar are links to `/`, as one link: one tab stop whose accessible name is the profile name
- [x] In the collapsed rail, the avatar at the bottom is a link to `/` named with the profile name
- [x] "New chat" is a link to `/`, in the same place and size as before in both states
- [x] In the mobile drawer, following any of these links closes the drawer

## Files to touch

- `components/shell/Sidebar.tsx`: wrap name and avatar in one `Link` to `/` (name first), make the rail's bottom avatar a `Link` with `aria-label={profile.name}`, and turn "New chat" from a `<button>` into a `Link` to `/`
- `tests/e2e/shell.spec.ts`: update the two tests that look for "New chat" as a button and the row-order test; add the link tests (see Tests to add)
- `tests/e2e/drawer.spec.ts`: the focus-trap test assumed the close button was the first focusable item; the name link is now (added in the build, see the Log)
- `pm/decisions.md`: add a row to "Decisions made during the build" (see Notes)

## Out of scope

- Clearing the chat thread and bringing back the hero without a page load (US-032). Until then "New chat" is plain navigation home
- Wiring the ASK ABOUT items to the chat (US-024)
- `components/shell/Avatar.tsx`: the image itself doesn't change
- Any change to the top bar, the collapse button's position or the rail's width (D-021, D-023)

## Tests to add

- `tests/e2e/shell.spec.ts`: update `US-005 F0.1: sidebar sections appear in order` so the name comes before the avatar and "New chat" is found as a link; update `US-061 F0.3: New chat and ASK ABOUT icons do not move` to find "New chat" as a link
- `tests/e2e/shell.spec.ts`: `US-070 F0.1: the name and avatar are one link to the home page` (from `/about/`, the link named with the profile name has `href="/"` and contains the avatar; clicking it lands on `/`)
- `tests/e2e/shell.spec.ts`: `US-070 F0.1: the avatar in the rail links to the home page` (collapse, then the link named with the profile name has `href="/"`; clicking it lands on `/`)
- `tests/e2e/shell.spec.ts`: `US-070 F0.2: New chat links to the home page` (from `/about/`, the "New chat" link has `href="/"`; clicking it lands on `/`)
- `tests/e2e/shell.spec.ts` (`@mobile-only`): `US-070 F0.1: the drawer closes when the name is followed @mobile-only` (open the menu, click the name link, expect the menu dialog hidden and the URL to be `/`)

## Notes

- **Order.** D-021 put the avatar before the name. Caleb asked for the avatar to the right of the name (2026-10-13). The collapse button stays at the left, so it still doesn't move between states.
- **One link, not two.** The avatar has an empty `alt` (it is decorative beside the name), so the link's name comes from the name text. Wrapping both in one `Link` gives one tab stop and no empty-named link.
- **The rail.** The name is hidden there, so the avatar is the only thing to link. It needs `aria-label` because its `alt` is empty.
- **Drawer.** `MobileDrawer` already closes the dialog on any click that lands inside an `<a>`, so no change is needed there. Test it anyway.
- **Decision row to add** (D-027): "Sidebar identity row is collapse button, name, avatar; name and avatar link to `/`; New chat links to `/` until US-032 clears the thread. Reason: Caleb couldn't get home from the sidebar while testing."
- The story's `/` link is the home page, which today is the placeholder home page (US-019/US-020 build the hero on it).

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built it. `Sidebar.tsx`: the identity row is now collapse button, then one `Link` to `/` holding the name and then the avatar; the drawer's close button takes `ml-auto` so it still sits at the right; the rail's bottom avatar is a `Link` to `/` with `aria-label` set to the profile name; "New chat" is a `Link` to `/` (was a button) with the TODO(US-032) reworded, since US-032 still has to clear the thread. Recorded as D-027. Outside **Files to touch**: `tests/e2e/drawer.spec.ts`. `US-006 F0.3: focus is trapped in the drawer` expected Tab from the last link to land on the close button; the name link now comes first in the DOM and on screen, so it expects the first link instead. The test still checks that Tab and Shift+Tab wrap, so it is no weaker. Also changed in `Sidebar.tsx`: a comment said `ml-1` where the code has `pl-1`. `npm run verify`: pass (116 unit tests, lint with 0 warnings, typecheck, board check; the board still warns about US-019, US-022, US-028 and US-038). `npm run test:e2e`: 199 passed, 1 failed (the drawer focus-trap test above) before the fix; `drawer.spec.ts` and `shell.spec.ts` passed in full after it (46 tests). The push hook runs the full suite again. CI for US-069 (`73c6379`): pass · this commit · pass
2026-10-13 · Started: status in-progress; US-005, US-061 and US-063 are done · — · —
2026-10-13 · Created at Caleb's request: avatar to the right of the name, name and avatar link home, New chat links home · — · —
