---
id: US-062
title: Show Caleb's headshot in the avatar
sprint: S01
status: done
owner: Claude
points: 1
priority: P1
depends_on: [US-005, US-061]
spec: F0.1; Avatar; Repo layout and content model
---

# US-062 · Show Caleb's headshot in the avatar

As the **site owner**, I want my own photo as the avatar, so that the site feels personal (US-010).

## Acceptance criteria

- [x] `public/avatar.webp` exists, is square and at least 400 px (US-010)
- [x] The sidebar avatar shows that image, not the initials (F0.1)
- [x] The original photo is kept in the repo, uncropped

## Files to touch

- `public/avatar.webp`: the 400 × 400 face crop, made once from the original with `sharp` (already installed by Next.js, not added to `package.json`)
- `public/avatar-original.jpg`: the original 800 × 800 photo, kept uncropped for later uses (an Open Graph image, a case-study page)
- `components/shell/Avatar.tsx`: render `next/image` of `/avatar.webp`; drop the initials and the `name` prop
- `components/shell/Sidebar.tsx`: stop passing `name` to `Avatar`
- `tests/e2e/shell.spec.ts`: the two tests below
- `pm/decisions.md`: record the crop and the kept original as D-022

## Out of scope

- The chat avatar beside bot answers (US-032 reuses `Avatar`)
- Marking US-010 done. It is Caleb's story
- A fallback monogram. The file is part of the repo, so it can't be missing

## Tests to add

In `tests/e2e/shell.spec.ts`, tagged `@desktop-only`:

- `US-062: avatar file is a square of at least 400 px`: load `/avatar.webp` in the page; `naturalWidth` equals `naturalHeight` and is at least 400
- `US-062 F0.1: sidebar avatar shows the headshot`: the `avatar` test id is an `img` that has loaded (`naturalWidth > 0`), and the monogram text "CP" is gone

## Notes

- **Crop:** `extract({ left: 400, top: 0, width: 400, height: 400 })` on the 800 × 800 original, then WebP at quality 85. The photo has a dog on the left and the top of the head is at the frame's edge, so the crop is the face and shoulders from the right half. 400 px is the spec's minimum and 12 times the 32 px it shows at.
- `alt=""`: the name sits next to the avatar, so the image is decorative (same reason the monogram was `aria-hidden`). `data-testid="avatar"` stays, with the same reason as before: an empty-alt image has no role to query.
- `next/image` resizes it for the 32 px slot, so visitors download a few KB, not the 400 px file.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built: `public/avatar.webp` (400 × 400 crop) and `public/avatar-original.jpg` (800 × 800, uncropped); `Avatar` renders it with `next/image` and no longer takes `name`; recorded as D-022. US-011 now depends on this story, and `Avatar.tsx` left US-050's Files to touch. Checked by screenshot in both sidebar states · this commit · `npm run verify` passes; `npm run test:e2e`: 76 passed (chromium, webkit, mobile)
2026-10-13 · Started. Caleb shared `Downloads/1771375939322 (1).jpg` (800 × 800) as the avatar and asked for a crop, keeping the original · — · —
