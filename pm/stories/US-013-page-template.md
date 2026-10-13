---
id: US-013
title: Content-page template, footer and Contact page
sprint: S02
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-005, US-011, US-012]
spec: F5.1, F5.5, F5.6; Breadcrumb, PageIntro
---

# US-013 · Content-page template, footer and Contact page

As a **visitor**, I want every page laid out the same way, so that I always know where I am.

## Acceptance criteria

- [ ] One template: breadcrumb (`Home / /page`), eyebrow, H1, intro, body, cross-links, footer (F5.1). The header is the top bar, which `AppShell` already renders
- [ ] `Breadcrumb` is a `nav`; `PageIntro` renders eyebrow, H1, intro
- [ ] Footer has "Ask me in the chat" and "CV (PDF)" links styled as outlined buttons, the nav, and LinkedIn and GitHub links (F5.6)
- [ ] Footer buttons are outlined, so the top-bar CV stays the only filled button (F2.4)
- [ ] `/contact/` uses the template and shows the email (as a `mailto:` link), location, status, LinkedIn and GitHub from `profile.json`
- [ ] Every content page exports `dynamic = "error"`, so the build fails if one can't be prerendered (F5.5)
- [ ] Tests cover each criterion above

## Files to touch

- `components/shell/ContentPage.tsx`: server component, the template. Renders `<main>` (breadcrumb, `PageIntro`, children, `CrossLinks`) and then `SiteFooter`
- `components/shell/Breadcrumb.tsx`, `components/shell/PageIntro.tsx`, `components/shell/CrossLinks.tsx`, `components/shell/SiteFooter.tsx`
- `lib/pages.ts`: `getPageIntro`, `crossLinks`, `footerNav` (see **Notes**)
- `lib/dates.ts`: `formatMonth` and `formatRange` for US-015 and US-016
- `app/contact/page.tsx`
- `tests/unit/lib/pages.test.ts`, `tests/unit/lib/dates.test.ts`, `tests/unit/static-pages.test.ts`
- `tests/e2e/content-template.spec.ts`, `tests/e2e/contact.spec.ts`

## Out of scope

- The other pages (US-014 to US-017), and any component only one of them uses
- A contact form. The spec offers it as an option for Caleb, and it needs a backend. If he wants one, it's a new story
- Per-page `<title>` and Open Graph tags (US-038)
- The top bar (US-007) and the shell (US-005, US-006)
- Testing every page with JavaScript off (US-018)

## Tests to add

- `tests/unit/lib/pages.test.ts`
  - `US-013: getPageIntro reads eyebrow, title and intro from the command`
  - `US-013: getPageIntro throws for an unknown command or one without an intro`
  - `US-013: crossLinks are the next two ASK ABOUT pages, wrapping at the end`
  - `US-013: crossLinks for a page not in ASK ABOUT are the first two`
  - `US-013: footerNav lists the ASK ABOUT pages in order`
- `tests/unit/lib/dates.test.ts`
  - `US-013: formatMonth gives "Mar 2021"`, `US-013: formatRange gives "Mar 2021 – Present" for "present"`, `US-013: formatRange gives "Mar 2021 – Jun 2023"`
- `tests/unit/static-pages.test.ts`
  - `US-013 F5.5: every content page exports dynamic = "error"`: reads every `app/**/page.tsx` except `app/page.tsx`
  - `US-013: finds the content pages`: the list contains `app/contact/page.tsx`
- `tests/e2e/content-template.spec.ts`, on `/contact/`:
  - `US-013 F5.1: breadcrumb is a nav with Home and the current page`: `getByRole("navigation", { name: "Breadcrumb" })`; "Home" links to `/`; the last item has `aria-current="page"` and the text `/contact`
  - `US-013 F5.1: template parts appear in order`: breadcrumb, eyebrow, the one `h1`, intro, body, cross-links, footer, by vertical position
  - `US-013 F5.1: cross-links are the next two ASK ABOUT pages`: compare with `profile.sidebar.askAbout` and `commands.json`, imported in the test
  - `US-013 F5.6: footer has the chat and CV buttons, the nav and the social links`: inside `getByRole("contentinfo")`
  - `US-013 F2.4: footer buttons are outlined`: neither footer button's computed `background-color` equals `--cta-bg`
- `tests/e2e/contact.spec.ts`
  - `US-013: contact shows email, location, status and social links from profile.json`: the email link's `href` is `mailto:` + `profile.email`

## Notes

**Where the page text comes from (D-018).** For a page in ASK ABOUT, `getPageIntro(command)` reads its `commands.json` entry: the eyebrow is `label`, the H1 is `description`, and the intro is the new `intro` field. It throws if the command is missing or has no `intro`, so the build fails. US-012 writes the intros; don't edit `content/`.

**Helpers in `lib/pages.ts`** are pure functions that take the data as arguments, so the unit tests don't read `content/`. The pages pass in what `getProfile()` and `getCommands()` return.

- `getPageIntro(commands, command)` → `{ eyebrow, title, intro }`
- `crossLinks(askAbout, commands, current)` → the two ASK ABOUT pages after `current`, wrapping round. If `current` isn't in ASK ABOUT, the first two. Each is `{ label, href }`, with `href` from the command's `answer`
- `footerNav(askAbout, commands)` → every ASK ABOUT page as `{ label, href }`

**Dates.** `formatMonth("2021-03")` → `"Mar 2021"`. Use `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })` on `Date.UTC(year, month - 1)`, so the time zone can't shift the month. `formatRange(start, end)` joins them with `" – "` (spaces round an en dash), and `"present"` becomes `"Present"`.

**`ContentPage` props:** `{ breadcrumb: { label: string; href?: string }[]; eyebrow: string; title: string; intro: string; current: string; children: ReactNode }`. `breadcrumb` is what comes after "Home": `[{ label: "/contact" }]` here, `[{ label: "/projects", href: "/projects/" }, { label: title }]` for a case study. `current` is the command name used for cross-links.

**Landmarks.** Each page renders its own `<main>`; the home page already does. `ContentPage` renders `<main>` and then `<footer>` as siblings, so the footer is a `contentinfo` landmark. One `<h1>` per page, in `PageIntro`.

**Markup.**

- Breadcrumb: `<nav aria-label="Breadcrumb"><ol>`. Separators are `aria-hidden` spans holding `/`. The current item is text with `aria-current="page"`, not a link.
- Eyebrow: a `<p>`, `text-sm uppercase tracking-wide text-text-muted`.
- Cross-links: a `<nav aria-label="Related pages">`.
- Footer: a `<nav aria-label="Footer">` for the page list. "Ask me in the chat" is `<a href="/">` (works with JavaScript off). "CV (PDF)" is `<a href={profile.links.cv} download>`. Both are `rounded-pill border border-border`, never `bg-cta-bg`. LinkedIn and GitHub are text links to `profile.links.linkedin` and `.github`.

**Contact page:** `getPageIntro(commands, "/contact")`, then a `<dl>` with Email, Location and Status, then the LinkedIn and GitHub links. Every value comes from `profile.json`.

**Static pages:** every content page starts with `export const dynamic = "error";`. With Cache Components off (D-012), this makes `next build` fail if the page can't be prerendered. See `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; took in the Contact page so the template is tested on a real page; owns `lib/pages.ts` and `lib/dates.ts`; now depends on US-011 (the footer needs `links.linkedin` and `.github`) and US-012 (which writes the page intros); points 3 → 5 · — · —
