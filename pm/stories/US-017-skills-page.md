---
id: US-017
title: Skills page
sprint: S02
status: done
owner: Claude
points: 2
priority: P1
depends_on: [US-012, US-013, US-014]
spec: F5.4, F5.5
---

# US-017 · Skills page

As a **recruiter**, I want skills grouped by category with real usage, so that I can match them to a role.

## Acceptance criteria

- [x] `/skills/` uses the shared template, with category headings and flat lists and no proficiency bars (F5.4)
- [x] "In practice" section from `skills.json` `inPractice` pairs, shown only when there are any (F5.4)
- [x] The page is statically generated (F5.5)
- [x] Tests cover each criterion above

## Files to touch

- `app/skills/page.tsx`
- `components/ui/InPractice.tsx`: the "In practice" section; renders nothing for an empty or missing list. A component rather than a helper in the page file, because Next.js rejects extra exports from `page.tsx`
- `tests/e2e/skills.spec.ts`, `tests/unit/components/ui/InPractice.test.tsx`

## Out of scope

- Proficiency levels of any kind: bars, stars, percentages, "expert" labels
- `TagList`. The spec asks for flat lists, not tags
- Linking an "in practice" project to its case study. `inPractice.project` is free text
- Any other new component. The category lists are used by this page only, so they live in the page file

## Tests to add

All in `tests/e2e/skills.spec.ts`, with expected values from `loadContent()`:

- `US-017 F5.1: skills uses the template`
- `US-017 F5.4: one heading and flat list per category`: each category name is an `h2`, followed by a `ul` with its items, in file order
- `US-017 F5.4: no proficiency bars`: no `progressbar` or `meter` role on the page
- `US-017 F5.4: in practice lists every pair`: an `h2` "In practice", then one item per pair with the tool and the project
- `tests/unit/components/ui/InPractice.test.tsx`: `US-017: InPractice renders nothing without pairs`, `US-017: InPractice renders one item per pair`. With US-012's content the page always has pairs, so the empty case is tested here with `renderToStaticMarkup`, as US-014 does for `Markdown`
- Criterion 3 is covered by US-013's `static-pages.test.ts`

## Notes

- **Markup:** `getPageIntro(commands, "/skills")`, then each category as `<section aria-labelledby>` with an `<h2>` and a `<ul>`. Items wrap inline (`flex flex-wrap gap-x-3`), plain text.
- **In practice:** `<h2>In practice</h2>` and a `<ul>` of `<li>` "**tool** in project". The word "in" is site copy, not a fact.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built the skills page. Added `app/skills/page.tsx` (each category is a labelled `section` with an `h2` and a flat `ul`, then `InPractice`), `components/ui/InPractice.tsx`, 2 unit tests and 4 e2e tests. Choices the story left open: the In practice list is a bulleted list with the tool in bold (the story gives no style); category items wrap with `gap-y-2` as well as `gap-x-3`, so wrapped lines don't touch; the sections sit in a `space-y-10` wrapper; category ids are `skills-<index>`. Criterion 3 (static) rests on `static-pages.test.ts` (`dynamic = "error"`) and on the build succeeding. Outside **Files to touch**: none. `npm run verify`: pass (format, lint with 0 warnings, typecheck, 114 unit tests, board check; the board still warns about US-019, US-022, US-028 and US-038, which were already there). `npm run test:e2e`: 184 passed, on two runs. The build prints the Turbopack tracing warning for `isPlaceholder` in `lib/content.ts` (US-011; US-067 covers it). The new page is one more importer in its import trace, so the trace now also lists `app/skills/page.tsx`. The warning itself is not new, and this story doesn't change `lib/content.ts` · this commit · pass
2026-10-13 · Started: status in-progress; all dependencies done · — · —
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; depends on US-014, which sets up component tests in Vitest · — · —
