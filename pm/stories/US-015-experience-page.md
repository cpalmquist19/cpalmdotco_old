---
id: US-015
title: Experience page
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-012, US-013]
spec: F5.2, F5.5; RoleEntry, TagList
---

# US-015 · Experience page

As a **recruiter**, I want a clear timeline of roles, so that I can judge experience quickly.

## Acceptance criteria

- [ ] `/experience/` uses the shared template and lists numbered roles with dates, location, bullets and mono tech tags (F5.2)
- [ ] Uses `RoleEntry` and `TagList`
- [ ] Ordered by `order` frontmatter, with `order: 1` first
- [ ] The page is statically generated (F5.5)
- [ ] Tests cover each criterion above

## Files to touch

- `components/ui/RoleEntry.tsx`: one role
- `components/ui/TagList.tsx`: a list of mono tags. US-016 reuses it, so it takes only `tags: string[]` and an `aria-label`
- `app/experience/page.tsx`
- `tests/e2e/experience.spec.ts`

## Out of scope

- Markdown inside bullets. US-012 writes them as plain text; render them as text
- Case studies and `ProjectCard` (US-016)
- Linking a role to its projects
- Filtering or sorting controls

## Tests to add

All in `tests/e2e/experience.spec.ts`. Build the expected values in the test from the files in `content/experience/` (read them with `loadContent()` from `lib/content.ts`):

- `US-015 F5.1: experience uses the template`: breadcrumb `/experience` and one `h1`
- `US-015 F5.2: one numbered entry per role`: the list has as many items as there are files; each shows its number (`01`, `02`, …)
- `US-015 F5.2: each role shows title, company, dates, location, bullets and tags`: for each role, the date text equals `formatRange(start, end)`
- `US-015 F5.2: tags use the mono font`: a tag's computed `font-family` includes "Geist Mono"
- `US-015: roles appear in order`: `h2` texts match the titles sorted by `order`
- Criterion 4 is covered by US-013's `static-pages.test.ts`

## Notes

- **Markup:** `<ol aria-label="Roles">`, one `<li>` per role. Inside: the number as `aria-hidden` text (`String(index + 1).padStart(2, "0")`), an `<h2>` with the title, a line with the company, a line with `formatRange(start, end)` (US-013's `lib/dates.ts`) and the location, a `<ul>` of bullets, then `TagList`.
- **TagList:** `<ul aria-label={label}>` with `font-mono text-sm`, each tag an outlined pill (`rounded-pill border border-border`). Never filled (F2.4).
- **Intro:** `getPageIntro(commands, "/experience")` from US-013.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; owns `TagList` for US-016; points 2 → 3 · — · —
