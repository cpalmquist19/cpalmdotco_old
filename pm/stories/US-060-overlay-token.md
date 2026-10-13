---
id: US-060
title: Overlay colour token for the drawer backdrop
sprint: backlog
status: todo
owner: Claude
points: 1
priority: P3
depends_on: [US-006, US-011]
spec: Design tokens and components
---

# US-060 · Overlay colour token for the drawer backdrop

As a **phone visitor**, I want the page behind the open menu to dim in both themes, so that the menu reads as a layer on top.

## Acceptance criteria

- [ ] The spec's token list has an overlay token, with a value for light and dark themes
- [ ] `app/globals.css` maps it to a Tailwind colour name, in `:root` and `[data-theme="dark"]`
- [ ] The drawer backdrop uses that token class, not `bg-text/40` (D-020)

## Files to touch

- `docs/Chat-First Portfolio — Build Spec.md`: add the overlay token to the token list
- `app/globals.css`: define the variable in both themes and map it in `@theme inline`
- `components/shell/MobileDrawer.tsx`: swap the backdrop class to the overlay token
- `tests/e2e/drawer.spec.ts`: add the backdrop test

## Out of scope

- Other overlays or modals. None exist yet
- Changing the drawer's layout or behaviour

## Tests to add

All in `tests/e2e/drawer.spec.ts`, tagged `@mobile-only`:

- `US-060: drawer backdrop uses the overlay token in light and dark @mobile-only`: read the computed background of the dialog's `::backdrop` in each theme and compare with the token's value

## Notes

- The colour value is a design choice for Caleb, so confirm it before this story starts
- Once the token exists, `backdrop:bg-text/40` from US-006 is replaced. D-020 is then closed out in the Log

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Added to backlog as the follow-up to D-020. Depends on US-011 too: its **Files to touch** change the shell components' types, and `MobileDrawer.tsx` is one of them (`board.mjs` shared-file check) · — · —
