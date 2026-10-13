---
id: US-050
title: Site icon (favicon)
sprint: S02
status: todo
owner: Claude
points: 2
priority: P1
depends_on: [US-003, US-012]
spec: Design tokens and components; Inputs needed from you › Assets
---

# US-050 · Site icon (favicon)

As a **visitor**, I want the site to show its own icon in the browser tab and bookmarks, so that it's easy to find among my tabs.

## Acceptance criteria

- [ ] Every page links a site icon, and the icon's URL returns an image (no 404 for the browser to log, which would cost Lighthouse Best Practices points in US-035)
- [ ] The icon is a monogram: the initials come from `name` in `content/profile.json`, not hard-coded (CODING § 7), on the D-003 palette

## Files to touch

- `app/icon.tsx`: generates the icon with `ImageResponse` from `next/og` (part of Next.js, no new package). See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`
- `lib/initials.ts`: `getInitials(name)`, the first letter of the first and last word, upper case
- `components/shell/Avatar.tsx`: if it works out the initials itself (US-005), switch it to `getInitials`, so the sidebar avatar and the icon can't disagree
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
2026-10-13 · Added `Avatar.tsx` to Files to touch (US-054), so the initials are worked out in one place · — · —
2026-10-13 · Created in US-051 at Caleb's request · — · —
