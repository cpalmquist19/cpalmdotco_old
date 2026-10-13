---
id: US-006
title: Mobile off-canvas drawer
sprint: S01
status: todo
owner: Claude
points: 3
priority: P1
depends_on: [US-005]
spec: F0.3; AppShell
---

# US-006 · Mobile off-canvas drawer

As a **phone visitor**, I want the sidebar in a drawer behind a menu button, so that the content has room on a small screen.

## Acceptance criteria

- [ ] Under 1024 px the sidebar is hidden and a menu button opens it as an off-canvas drawer from the left (F0.3)
- [ ] Drawer traps focus while open: Tab from the last item goes to the first, Shift+Tab from the first goes to the last (F0.3)
- [ ] Esc closes the drawer (F0.3)
- [ ] Focus returns to the menu button on close
- [ ] Following a link in the drawer closes it
- [ ] At 1024 px and wider, the menu button isn't shown
- [ ] Playwright tests run on the mobile viewport

## Files to touch

- `components/shell/MobileDrawer.tsx`: client component; menu button plus a native `<dialog>` that renders the same `Sidebar`
- `components/shell/Sidebar.tsx`: add a `variant: "inline" | "drawer"` prop. In the drawer, hide the collapse button and show a "Close menu" button instead
- `components/shell/AppShell.tsx`: render `MobileDrawer` (visible below `lg`) above the canvas
- `tests/e2e/drawer.spec.ts`

## Out of scope

- The top bar (US-007). The menu button sits at the top-left of the canvas for now. US-007 places it inside `TopBar`
- Swipe gestures and slide animations. Opening and closing instantly is fine
- Any change to the desktop sidebar's behaviour

## Tests to add

All in `tests/e2e/drawer.spec.ts`. Tag the mobile tests `@mobile-only` and the desktop test `@desktop-only`:

- `US-006 F0.3: menu button opens the drawer @mobile-only`: the sidebar isn't visible; click "Open menu"; the dialog is visible and contains the ASK ABOUT links
- `US-006 F0.3: focus is trapped in the drawer @mobile-only`: focus the last focusable element, press Tab, focus is on the first; press Shift+Tab, focus is on the last
- `US-006 F0.3: Esc closes the drawer @mobile-only`
- `US-006: focus returns to the menu button @mobile-only`: after Esc, and after "Close menu"
- `US-006: following a link closes the drawer @mobile-only`
- `US-006: no menu button on desktop @desktop-only`

## Notes

- **Use the native `<dialog>` element** with `showModal()` and `close()`. It gives you the dark backdrop, makes the rest of the page inert, and fires `cancel` on Esc. Don't add a focus-trap or modal library.
- **The focus trap:** native dialogs let Tab escape to the browser's own UI, so add a `keydown` handler on the dialog that wraps Tab and Shift+Tab between the first and last focusable elements.
- **Returning focus:** in the dialog's `close` event, call `menuButtonRef.current?.focus()`. Don't rely on the browser to do it.
- **Closing on navigation:** close on any click on an `<a>` inside the dialog. App Router keeps the layout mounted, so the dialog would otherwise stay open on the new page.
- **Accessible names:** the menu button is `<button aria-label="Open menu" aria-haspopup="dialog">` with the Lucide `Menu` icon. The dialog has `aria-label="Menu"`.
- **Styling:** the dialog is full height, `w-[var(--sidebar-w)]` with `max-w-[85vw]`, pinned left (`m-0 h-dvh max-h-dvh`), `bg-sidebar`. Style the backdrop with `backdrop:bg-black/40`. This is the one allowed non-token colour, because the spec has no overlay token. Add `backdrop:` to the allowlist in `tests/unit/style-rules.test.ts` with a comment.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes, native dialog approach, close-on-navigate and desktop criteria · — · —
