---
id: US-007
title: Top bar: status pill, share, theme, CV
sprint: S01
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-004, US-005, US-006]
spec: F0.4; TopBar, StatusPill, ShareButton, Toast
---

# US-007 · Top bar: status pill, share, theme, CV

As a **recruiter**, I want availability, sharing and the CV one click away, so that I can act on the portfolio quickly.

## Acceptance criteria

- [ ] Status pill on the left shows `profile.status` with a green `--ok` dot; the dot pulses, and the pulse stops under reduced motion (F0.4)
- [ ] Share button copies the current page URL and shows a "Link copied" toast for 2 s with `role=status` (F0.4)
- [ ] If copying fails, the toast says "Couldn't copy the link" instead
- [ ] Theme toggle (moved here from its temporary spot) and a filled "CV" download link on the right (F0.4)
- [ ] The CV link is the only filled button on the page (F2.4)
- [ ] Below 1024 px, the menu button from US-006 sits at the left of the top bar, before the status pill
- [ ] Playwright tests cover each criterion above

## Files to touch

- `components/shell/TopBar.tsx`: server component; lays out the pill, share, toggle and CV link
- `components/shell/StatusPill.tsx`
- `components/shell/ShareButton.tsx`: client component
- `components/ui/Toast.tsx`: client component; `role="status"`, shows a message, hides after 2000 ms
- `components/shell/AppShell.tsx`: render `TopBar` at the top of the canvas, and move the menu button into it
- `app/layout.tsx`: remove the temporary toggle wrapper and its `TODO(US-007)`
- `tests/e2e/topbar.spec.ts`

## Out of scope

- The CV file itself (`public/cv.pdf`, from US-009/US-014). The link will 404 until then, which is expected
- Any other filled button style. Chips are outlined (US-023)
- Share via the Web Share API. The spec says copy the URL

## Tests to add

All in `tests/e2e/topbar.spec.ts`:

- `US-007 F0.4: status pill shows the profile status`: text matches `profile.status` from the JSON
- `US-007 F0.4: status dot stops pulsing under reduced motion`: with `test.use({ reducedMotion: "reduce" })`, the dot's computed `animation-name` is `none`; without it, it isn't
- `US-007 F0.4: share copies the URL and shows a toast`: stub `navigator.clipboard.writeText` with `page.addInitScript` to record its argument; click "Copy link to this page"; recorded value equals `page.url()`; `getByRole("status")` has "Link copied"
- `US-007 F0.4: toast hides after 2 seconds`: use `page.clock.install()` before loading, click share, `page.clock.runFor(2000)`, the toast is gone
- `US-007: failed copy shows an error toast`: stub `writeText` to reject; toast says "Couldn't copy the link"
- `US-007 F0.4: CV link downloads the CV`: link named "CV" has `href` equal to `profile.links.cv` and a `download` attribute
- `US-007 F2.4: CV is the only filled button`: among all visible `a` and `button` elements, exactly one has a computed `background-color` equal to `--cta-bg` (read the variable from `<html>`), and it's the CV link. Check in both themes
- `US-007: menu button is in the top bar on mobile @mobile-only`

## Notes

- **Layout:** a `<header>` with `flex items-center justify-between`. Left: (menu button below `lg`) + status pill. Right: share, theme toggle, CV, in that order.
- **Status pill:** an outlined pill (`rounded-pill border border-border`) with the text, and a dot `size-2 rounded-full bg-ok motion-safe:animate-pulse`. Tailwind's `motion-safe:` makes the pulse stop under reduced motion, so no JS is needed.
- **Share button:** `<button type="button" aria-label="Copy link to this page">` with the Lucide `Link` icon. Call `navigator.clipboard.writeText(window.location.href)` and handle the rejected promise (show the error toast). Don't swallow it.
- **CV link:** `<a href={profile.links.cv} download className="rounded-pill bg-cta-bg text-cta-text …">CV</a>`. It looks like a button but is a link, because it downloads a file.
- **Icon buttons** (share, toggle, menu) are outlined or plain, never filled.
- `depends_on` now includes US-006, because this story moves the menu button.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes, copy-failure and mobile criteria; depends on US-006 · — · —
