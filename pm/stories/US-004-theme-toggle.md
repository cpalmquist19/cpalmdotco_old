---
id: US-004
title: Theme toggle with no-flash script
sprint: S01
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-003]
spec: F0.4–F0.6; ThemeToggle
---

# US-004 · Theme toggle with no-flash script

As a **visitor**, I want to switch between light and dark and have it remembered, so that the site stays the way I like it without flashing.

## Acceptance criteria

- [x] Light is the default for first-time visitors regardless of OS setting (F0.5)
- [x] Toggle writes `data-theme` on `<html>` and saves it in `localStorage` under the key `theme` (F0.5)
- [x] Inline `<head>` script applies the saved theme before first paint, with no flash (F0.5)
- [x] Moon icon shows in light, sun in dark (F0.4)
- [x] `theme-color` meta updates with the theme (F0.6)
- [x] A missing, invalid or unreadable saved value falls back to light without an error
- [x] Playwright tests cover each criterion above

## Files to touch

- `lib/theme.ts`: `type Theme = "light" | "dark"`, `THEME_STORAGE_KEY = "theme"`, `THEME_COLORS = { light: "#f5f4f0", dark: "#1a1a1c" }`, and `themeScript`, the inline script source as a string
- `components/theme/ThemeToggle.tsx`: client component, the toggle button
- `app/layout.tsx`: render `<script dangerouslySetInnerHTML={{ __html: themeScript }} />` inside `<head>`, add `suppressHydrationWarning` to `<html>`, export `viewport` with `themeColor: THEME_COLORS.light`, and render `<ThemeToggle />` temporarily (see Notes)
- `app/globals.css`: the two rules that show the right icon (see Notes)
- `tests/e2e/theme.spec.ts`, `tests/unit/lib/theme.test.ts`

## Out of scope

- The top bar. The toggle sits in a temporary spot until US-007 moves it into `TopBar`
- Following the OS colour scheme. The spec says light is always the default
- Transitions between themes

## Tests to add

- `tests/e2e/theme.spec.ts`
  - `US-004 F0.5: light is the default when the OS prefers dark`: `test.use({ colorScheme: "dark" })`; `<html>` has `data-theme="light"`
  - `US-004 F0.5: toggle sets data-theme and saves it`: click the toggle; `data-theme="dark"` and `localStorage.theme === "dark"`; click again, back to light
  - `US-004 F0.5: saved theme applies before any bundle runs`: set `localStorage.theme = "dark"` with `page.addInitScript`, block all JS bundles with `page.route("**/_next/static/**/*.js", r => r.abort())`, load the page; `data-theme` is still `dark`. Only the inline script could have set it
  - `US-004 F0.5: theme persists across reload`
  - `US-004 F0.4: moon in light, sun in dark`: check which Lucide icon is visible (`svg.lucide-moon` / `svg.lucide-sun`; CSS selector allowed because the icons are `aria-hidden`, say so in a comment)
  - `US-004 F0.6: theme-color follows the theme`: the `meta[name="theme-color"]` content is `#f5f4f0`, then `#1a1a1c` after toggling
  - `US-004: invalid saved value falls back to light`: `localStorage.theme = "purple"` → `data-theme="light"`
- `tests/unit/lib/theme.test.ts`: `US-004: THEME_COLORS match the --bg tokens in globals.css` (reads the CSS file and compares)

## Notes

- **The inline script** must be plain ES5-safe JavaScript in a string, with no imports, and wrapped in `try { … } catch { }` so a blocked `localStorage` never breaks the page. This empty `catch` is the one allowed exception to the no-swallowed-errors rule, because falling back to light *is* the handling. Comment it. In order, it:
  1. reads `localStorage.getItem("theme")`
  2. uses it only if it is exactly `"light"` or `"dark"`, otherwise `"light"`
  3. sets `document.documentElement.dataset.theme`
  4. sets the `content` of `meta[name="theme-color"]`
- **The toggle** flips `data-theme` on `<html>`, writes `localStorage` (in `try/catch`), and updates the `theme-color` meta. It reads the current theme from `document.documentElement.dataset.theme` when clicked, not from React state, so it can't disagree with the inline script.
- **Icons without a hydration mismatch.** The server always renders light, so don't choose the icon in React. Render both `<Moon>` and `<Sun>` (`aria-hidden="true"`, classes `theme-icon-moon` / `theme-icon-sun`), and hide the wrong one in `globals.css`: `[data-theme="dark"] .theme-icon-moon, [data-theme="light"] .theme-icon-sun { display: none; }`.
- **Button:** `<button type="button" aria-label="Switch theme">`. The label doesn't depend on the current theme, for the same hydration reason.
- **Temporary spot:** in `app/layout.tsx`, wrap the toggle in `<div className="fixed right-4 top-4">` with the comment `// TODO(US-007): move into TopBar`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built the theme toggle and no-flash script (`lib/theme.ts`, `ThemeToggle.tsx`, `layout.tsx`, `globals.css`). Small choices within the story: the script uses `catch (e) {}` because optional catch binding is ES2019, not ES5; `saveTheme` returns a boolean so the toggle's blocked-storage case is handled, not swallowed; added an e2e test for unreadable storage (criterion 6 says "unreadable") and unit tests that run `themeScript` in a `vm` context · this commit · `npm run verify` passed (11 unit tests); `npm run test:e2e` passed (39 tests on chromium, webkit, mobile)
2026-10-13 · Started: story is ready, US-003 is done, `main` clean and up to date · — · —
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes, storage key, colours, fallback criterion · — · —
