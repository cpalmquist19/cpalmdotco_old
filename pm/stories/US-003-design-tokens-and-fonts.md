---
id: US-003
title: Design tokens and fonts
sprint: S01
status: done
owner: Claude
points: 2
priority: P0
depends_on: [US-002]
spec: Design tokens and components
---

# US-003 · Design tokens and fonts

As a **visitor**, I want a consistent warm-monochrome look in light and dark, so that the site feels deliberate in either theme.

## Acceptance criteria

- [x] Light and dark tokens from *Design tokens and components* live in `app/globals.css` and are mapped into Tailwind with the class names in [docs/CODING.md § 5](../../docs/CODING.md#5-styling-and-design-tokens)
- [x] Dark theme redefines the same variable names under `[data-theme="dark"]`; no component checks which theme is on
- [x] Geist Sans (all text) and Geist Mono load via `next/font` with no layout shift
- [x] Base palette matches decision D-003
- [x] A unit test fails if any `.tsx` file under `app/` or `components/` uses a colour value or Tailwind's `dark:` variant

## Files to touch

- `app/globals.css`: the token blocks, the `@theme inline` mapping, and `body` using `bg-bg text-text font-sans`
- `app/layout.tsx`: load the fonts and put their CSS variables on `<html>`. Render `<html lang="en" data-theme="light">`
- `tests/e2e/tokens.spec.ts`, `tests/unit/style-rules.test.ts`

## Out of scope

- The theme toggle, the no-flash script and `localStorage` (US-004). This story only sets the default `data-theme="light"`
- Any component (US-005 and later)
- Swapping fonts. The spec allows Inter Tight instead, but only if Caleb asks

## Tests to add

- `tests/e2e/tokens.spec.ts`
  - `US-003: light tokens apply by default`: the `body` background is `rgb(245, 244, 240)` (`#f5f4f0`)
  - `US-003: dark tokens apply when data-theme is dark`: set `data-theme="dark"` on `<html>` with `page.evaluate`, then the `body` background is `rgb(26, 26, 28)` (`#1a1a1c`)
  - `US-003: body text uses Geist`: the computed `font-family` of `body` contains `Geist`
- `tests/unit/style-rules.test.ts`
  - `US-003: no colour values in components`: reads every `.tsx` file under `app/` and `components/` and fails, naming the file, on `#rgb`/`#rrggbb` hex colours, `rgb(`/`hsl(`, or Tailwind palette colours (e.g. `bg-white`, `text-gray-500`)
  - `US-003: no dark: variant`: same files; fails on `dark:`

## Notes

- Copy the token values from the spec exactly. If D-003 is `decided` with a different palette, change only the values, not the variable names.
- The mapping goes in `globals.css` after `@import "tailwindcss";`. For example: `@theme inline { --color-bg: var(--bg); --color-text-muted: var(--text-muted); --radius-pill: var(--radius-pill); --font-sans: var(--font-geist-sans); --font-mono: var(--font-geist-mono); }`. Cover every row of the CODING.md table.
- Fonts: `import { Geist, Geist_Mono } from "next/font/google"` with `variable: "--font-geist-sans"` / `"--font-geist-mono"` and `subsets: ["latin"]`.
- `next/font` prevents font layout shift by itself, and no test is needed for it. Don't add `<link>` tags.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done. `npm run verify` ✔ (5 unit tests), `npm run test:e2e` ✔ (15 tests across chromium, webkit, mobile). Tokens, `@theme inline` mapping and `body` are in `app/globals.css`; Geist and Geist Mono load in `app/layout.tsx`; `<html>` has `data-theme="light"` · this commit · verify ✔ e2e ✔
2026-10-13 · Two tests beyond **Tests to add**, both in the listed files: (1) `US-003: the detectors catch what they are meant to catch` in `style-rules.test.ts`, so the colour and `dark:` regexes can't silently stop matching; (2) `US-003: radius tokens resolve to lengths` in `tokens.spec.ts`. Reason for (2): with `--radius-pill: var(--radius-pill)` in `@theme inline` (as the Notes suggest), Tailwind also emits that self-reference in its theme layer. It's harmless because the unlayered `:root` values win, and the test guards it · — · e2e ✔
2026-10-13 · Checked by hand with a throwaway file that the 14 token and font classes in CODING.md § 5 each generate a rule (for example `rounded-pill` → `border-radius: var(--radius-pill)`). The throwaway file was removed and isn't a permanent test · — · —
2026-10-13 · Known: the first `npm run test:e2e` after the CSS change failed all 9 token tests, because `.next/static` held only Tailwind's defaults and the font faces, with none of `globals.css`. After `rm -rf .next` (build output, ignored by git) everything passed. I could not reproduce it: editing `globals.css` and rebuilding without clearing `.next`, and switching from the old one-line `globals.css` to the new one, both gave the right CSS. If it happens again, clear `.next` and note it here · — · e2e ✘ once, then ✔
2026-10-13 · Started. Tree was clean at b97ae52 · — · —
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes and the style-rules unit test · — · —
