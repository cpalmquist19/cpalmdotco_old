---
id: US-050
title: Site icon (favicon)
sprint: S02
status: done
owner: Claude
points: 2
priority: P1
depends_on: [US-003, US-012]
spec: Design tokens and components; Inputs needed from you › Assets
---

# US-050 · Site icon (favicon)

As a **visitor**, I want the site to show its own icon in the browser tab and bookmarks, so that it's easy to find among my tabs.

## Acceptance criteria

- [x] Every page links a site icon, and the icon's URL returns an image (no 404 for the browser to log, which would cost Lighthouse Best Practices points in US-035)
- [x] The icon is a monogram: the initials come from `name` in `content/profile.json`, not hard-coded (CODING § 7), on the D-003 palette

## Files to touch

- `app/icon.tsx`: generates the icon with `ImageResponse` from `next/og` (part of Next.js, no new package). See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`
- `lib/initials.ts`: `getInitials(name)`, the first letter of the first and last word, upper case
- `tests/unit/lib/initials.test.ts`, `tests/e2e/icon.spec.ts`

## Out of scope

- `apple-icon`, web manifest and Open Graph image (US-038)
- Using Caleb's headshot as the icon (US-010 supplies the avatar; a photo doesn't read at 32 px)

## Tests to add

- `tests/unit/lib/initials.test.ts`: `US-050: initials are the first letters of the first and last name`, `US-050: a one-word name gives one initial`
- `tests/e2e/icon.spec.ts`: `US-050: home page links an icon that loads as an image`

## Notes

- `ImageResponse` can't read CSS variables. If US-003 doesn't already export the token values from `lib/` for reuse, stop and ask before writing colour values into `app/icon.tsx` (CODING § 5).
- Once `app/icon.tsx` exists, Next.js adds the `<link rel="icon">` tag itself, so browsers stop requesting `/favicon.ico`.
- Added after the US-002 review: US-002 dropped the create-next-app `favicon.ico` as boilerplate.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built the site icon. Added `app/icon.tsx` (a 32 × 32 PNG from `ImageResponse`, which Next.js links from every page), `lib/initials.ts`, 2 unit tests and 1 e2e test. Choices the story left open: `ImageResponse` can't read CSS variables, so the icon takes its colours from `THEME_COLORS` in `lib/theme.ts` (the `--bg` values from US-003 and US-004): the dark background is the tile and the light one the letters. The file has no colour literals, so the story's stop-and-ask didn't apply. The `style` objects are needed because `ImageResponse` uses Satori, not CSS classes. Every prerendered page has the link (checked in `.next` for `/about`, `/skills`, `/projects/atlas-api` and `/contact`), and the e2e test checks the home page. The link is `/icon?<hash>`, and `trailingSlash: true` (`next.config.ts`) makes it a 308 to `/icon/?<hash>`. The e2e test follows the redirect and gets a 200 PNG, but every first load pays one extra request. Not changed here: `next.config.ts` is outside Files to touch. Checked by eye: `next start` on port 3100, the icon reads "CP" in the expected colours; that server is stopped and the port is free. Criterion 2 is covered by the `getInitials` unit tests. No test checks that the icon reads `profile.json`'s name, so that wiring is checked by the build and by the PNG. Outside **Files to touch**: none. `npm run verify`: pass (116 unit tests, lint with 0 warnings, typecheck, board check; the board still warns about US-019, US-022, US-028 and US-038). `npm run test:e2e`: 187 passed. The build's Turbopack tracing warning for `isPlaceholder` in `lib/content.ts` is unchanged (US-067) · this commit · pass
2026-10-13 · Started: status in-progress; all dependencies done · — · —
2026-10-13 · Removed `Avatar.tsx` from Files to touch: US-062 replaces its initials with the headshot, so the icon is the only place that works out initials · — · —
2026-10-13 · Added `Avatar.tsx` to Files to touch (US-054), so the initials are worked out in one place · — · —
2026-10-13 · Created in US-051 at Caleb's request · — · —
