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

- [ ] Light and dark tokens from *Design tokens and components* live in `app/globals.css` and are mapped into Tailwind with the class names in [docs/CODING.md § 5](../../docs/CODING.md#5-styling-and-design-tokens)
- [ ] Dark theme redefines the same variable names under `[data-theme="dark"]`; no component checks which theme is on
- [ ] Geist Sans (all text) and Geist Mono load via `next/font` with no layout shift
- [ ] Base palette matches decision D-003
- [ ] A unit test fails if any `.tsx` file under `app/` or `components/` uses a colour value or Tailwind's `dark:` variant

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
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes and the style-rules unit test · — · —
