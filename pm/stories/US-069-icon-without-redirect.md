---
id: US-069
title: Serve the site icon without a redirect
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-050]
spec: Design tokens and components; Inputs needed from you › Assets
---

# US-069 · Serve the site icon without a redirect

As a **visitor**, I want the browser to fetch the site icon in one request, so that every first load doesn't pay for a redirect.

## Acceptance criteria

- [x] The icon URL that the home page links returns the image directly: no redirect on the way (a request with `maxRedirects: 0` gets a 200)
- [x] The icon is still a PNG monogram whose initials come from `name` in `content/profile.json`, on the same colours as before (US-050 criterion 2 still holds)
- [x] `trailingSlash: true` stays on in `next.config.ts`, and pages still redirect to the slash form (US-002)

## Files to touch

- `app/site-icon.png/route.tsx`: `GET` handler that returns the `ImageResponse` that `app/icon.tsx` builds today, with `export const dynamic = "force-static"` so it is built once
- `app/icon.tsx`: delete. Its dynamic route (`/icon`) has no file extension, so `trailingSlash: true` redirects it (308 to `/icon/?<hash>`)
- `app/layout.tsx`: add `icons: { icon: [{ url: "/site-icon.png", type: "image/png", sizes: "32x32" }] }` to `metadata`, so Next.js links the new route
- `tests/e2e/icon.spec.ts`: extend the US-050 test (see Tests to add)
- `pm/decisions.md`: add a row to "Decisions made during the build" (see Notes)

## Out of scope

- `next.config.ts`. Dropping `trailingSlash` or setting `skipTrailingSlashRedirect` would change every page URL (US-002)
- `apple-icon`, web manifest and Open Graph image (US-038)
- Changing the icon's look, size or colours
- `lib/initials.ts` and its unit tests (US-050)

## Tests to add

- `tests/e2e/icon.spec.ts`: `US-069: the linked icon is served in one request, with no redirect`: get the `href` from `link[rel="icon"]`, request it with `maxRedirects: 0`, and expect a 200 PNG
- `tests/e2e/icon.spec.ts`: keep `US-050: home page links an icon that loads as an image` (criterion 2 for the PNG and its content type)
- `tests/e2e/icon.spec.ts`: `US-069: /about still redirects to /about/`, which checks criterion 3 without touching `next.config.ts`. Request `/about` with `maxRedirects: 0` and expect a 308 whose `location` ends in `/about/`

## Notes

- **Why `/icon` redirects.** Next.js appends a trailing slash to every URL unless it is a file URL (has an extension) or sits under `.well-known/` (`trailingSlash` docs, and `isFilePattern` in `next/dist/lib/metadata/resolvers/resolve-url.js`). A dynamic `icon.tsx` is always served at `/icon`, with no extension.
- **Why a route handler.** A route folder named `site-icon.png` gives the URL `/site-icon.png`, which is a file URL, so it is left alone. The folder is not named `icon.png`, so it can't be mistaken for the static `icon.png` metadata file.
- Reuse `getProfile`, `getInitials` and `THEME_COLORS` exactly as `app/icon.tsx` does. Move the JSX across, don't rewrite it.
- The link no longer carries a `?<hash>` cache-buster. The route is static, so the response is the same until the next deploy; leave caching to the host's defaults.
- **Decision row to add** (D-026): "Site icon is served from `/site-icon.png`, not the `icon.tsx` convention. Reason: the convention's URL has no extension, so `trailingSlash: true` made every first load follow a 308."
- Written after the US-050 review. US-050 recorded the redirect in its Log and left it because `next.config.ts` was outside its Files to touch. This story fixes it without touching `next.config.ts`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built the fix. Added `app/site-icon.png/route.tsx` (a static `GET` that returns the same `ImageResponse` that `app/icon.tsx` built, with the same `THEME_COLORS` and `getInitials(getProfile().name)`), deleted `app/icon.tsx`, and added `icons` to `metadata` in `app/layout.tsx`. The home page now links `/site-icon.png`; the build prerenders it as a 32 × 32 PNG. Choices the story left open: the route file is `route.tsx`, not `route.ts` as CODING § 2 names it, because the icon is JSX (Prettier and TypeScript reject JSX in `.ts`), and Next.js accepts `.tsx` route handlers. The `getIconHref` helper in `icon.spec.ts` is shared by the two icon tests. Recorded as D-026. `next.config.ts` is unchanged. Criterion 2 is covered by the US-050 e2e test (PNG, `image/png`) and the `getInitials` unit tests. `npm run verify`: pass (116 unit tests, lint with 0 warnings, typecheck, board check; the board still warns about US-019, US-022, US-028 and US-038). `npm run test:e2e`: 193 passed (187 before, plus the 2 new tests on each of the 3 projects). Port 3000 is free afterwards. Outside **Files to touch**: none · this commit · pass
2026-10-13 · Started: status in-progress; US-050 is done · — · —
2026-10-13 · Created at Caleb's request, from the redirect recorded in the US-050 Log · — · —
