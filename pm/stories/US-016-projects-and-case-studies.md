---
id: US-016
title: Projects feed and case studies
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-012, US-013, US-014, US-015]
spec: F5.3, F5.5; ProjectCard
---

# US-016 · Projects feed and case studies

As an **engineer**, I want project write-ups with numbers and stack, so that I can judge the depth of the work.

## Acceptance criteria

- [ ] `/projects/` feed shows a meta line, linked title, pitch and stats line per project, newest first (F5.3)
- [ ] `/projects/[slug]/` shows Problem, What I built, Numbers and Stack (F5.3), in the shared template
- [ ] All slugs are generated statically, and an unknown slug is a 404 (F5.5)
- [ ] Uses `ProjectCard`
- [ ] Every `sidebar.projects` link in `profile.json` points to a real project, or the build fails
- [ ] Tests cover each criterion above

## Files to touch

- `components/ui/ProjectCard.tsx`
- `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`
- `lib/content.ts`: the sidebar-link check in `loadContent()` (see **Notes**)
- `tests/unit/lib/content.test.ts`: extend for that check
- `tests/e2e/projects.spec.ts`

## Out of scope

- A new Markdown component. Use US-014's `Markdown`
- A new tag component. Use US-015's `TagList` for the stack
- Filtering by category
- Per-project Open Graph images and `<title>` (US-038)
- Changing the sidebar (US-005) or adding commands

## Tests to add

- `tests/unit/lib/content.test.ts` (extend): `US-016: a sidebar project link to an unknown slug fails`, `US-016: sidebar project links to real slugs pass`
- `tests/e2e/projects.spec.ts`, with expected values built from `loadContent()`:
  - `US-016 F5.3: feed shows one card per project, newest first`
  - `US-016 F5.3: each card has a meta line, linked title, pitch and stats line`: the title links to `/projects/<slug>/`; the meta line contains the category and `formatRange`; the stats line contains every stat's value and label
  - `US-016 F5.3: case study shows the four sections`: for each project, `h2`s "Problem", "What I built", "Numbers", "Stack" in that order, each followed by its text
  - `US-016 F5.3: case study shows the stack as tags and the repo link when there is one`
  - `US-016 F5.1: case study breadcrumb is Home / /projects / title`: `/projects` links to `/projects/`
  - `US-016 F5.5: an unknown slug is a 404`: `page.goto("/projects/no-such-project/")` returns status 404
- Static generation is also covered by US-013's `static-pages.test.ts`

## Notes

- **Feed order:** sort by `dates.start` descending, then title. `getProjects()` returns them by file name (US-011), so sort in the page.
- **Feed page:** `getPageIntro(commands, "/projects")`, then an `<ol aria-label="Projects">` of `ProjectCard`s.
- **ProjectCard:** an `<article>`. Meta line: `<p>` "category · formatRange(start, end)". Title: `<h2><Link href="/projects/<slug>/">`. Pitch: `<p>`. Stats line: `<p>` of each stat as "value label", joined with " · ".
- **Case study:** `export const dynamic = "error"`, `export const dynamicParams = false`, and `generateStaticParams()` returning every slug. `ContentPage` with eyebrow = `category`, title = `title`, intro = `pitch`, `current: "/projects"`. Then the meta line and stats line, then the four sections, each an `<h2>` plus `<Markdown>` of its text. Under Stack, `<TagList tags={stack} label="Stack" />`. If `repo` is set, an outlined "View the code" link.
- **Sidebar check:** each `sidebar.projects[].href` must be `/projects/<slug>/` for a loaded project. Report a failure like the other cross-file checks: `content/profile.json: sidebar.projects.<i>.href: no project with slug "<slug>"`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; reuses `Markdown` (US-014) and `TagList` (US-015), so depends on both; takes the sidebar-link check US-011 left out; 404 for unknown slugs · — · —
