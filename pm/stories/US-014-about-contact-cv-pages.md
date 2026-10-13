---
id: US-014
title: About and CV pages
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-012, US-013]
spec: F5.1, F5.5; Repo layout › app/; Thread / Message (Markdown renderer)
---

# US-014 · About and CV pages

As a **recruiter**, I want About and CV pages, so that I can learn the story and take the CV with me.

## Acceptance criteria

- [ ] `/about/` renders `content/about.md` in the shared template
- [ ] `about.md` is validated like the other content: strict frontmatter (only `placeholder`) and a non-empty body
- [ ] Markdown renders through one shared `Markdown` component that allows only paragraphs, `h2`/`h3`, lists, links, bold, italic and inline code, and never raw HTML
- [ ] `/cv/` uses the template and has a "Download CV (PDF)" link to `profile.links.cv`
- [ ] `public/cv.pdf` exists as a clearly marked one-page placeholder (D-019), so the CV links stop 404ing
- [ ] Both pages are statically generated (F5.5)
- [ ] Tests cover each criterion above

## Files to touch

- `package.json`, `package-lock.json`: add `react-markdown` (`npm install react-markdown`), per decision D-017. If Caleb chose differently, use his choice
- `components/ui/Markdown.tsx`: server component wrapping `react-markdown` (see **Notes**)
- `lib/content-schemas.ts`: `aboutFrontmatterSchema`
- `lib/content.ts`: load `about.md` in `loadContent()`, and add `getAbout()` → `{ placeholder?, body }`
- `tests/unit/fixtures/content/about.md`, `tests/unit/lib/content.test.ts`: extend for `about.md`
- `app/about/page.tsx`, `app/cv/page.tsx`
- `public/cv.pdf`: the placeholder
- `tests/unit/components/ui/Markdown.test.tsx`, `tests/e2e/about-cv.spec.ts`

## Out of scope

- Contact (moved to US-013)
- Using the `Markdown` component for case studies (US-016) or chat answers (US-032). Build it so they can reuse it as is
- `remark-gfm`, `rehype-raw` or any other plugin. Tables, task lists and raw HTML aren't needed
- A summary of roles on the CV page. The page is the download, plus links to the rest
- The real CV (US-009, US-049)

## Tests to add

- `tests/unit/lib/content.test.ts` (extend): `US-014: about.md loads with its body`, `US-014: about.md with an unknown frontmatter key fails`, `US-014: an empty about.md body fails`
- `tests/unit/components/ui/Markdown.test.tsx`: render with `renderToStaticMarkup` from `react-dom/server`
  - `US-014: renders paragraphs, h2, lists, links, bold and inline code`
  - `US-014: drops raw HTML`: `<script>alert(1)</script>` and `<img src=x onerror=…>` don't appear in the output
  - `US-014: a # heading renders as text, not a second h1`
- `tests/e2e/about-cv.spec.ts`
  - `US-014 F5.1: about uses the template and shows the about.md text`: the first sentence of the body (read the file in the test) is visible inside `main`
  - `US-014 F5.1: cv uses the template`
  - `US-014: the CV link downloads the PDF`: the link "Download CV (PDF)" has `href` = `profile.links.cv` and `download`; `request.get(href)` returns 200 and `content-type: application/pdf`
- Criterion 6 is covered by US-013's `static-pages.test.ts`, which picks up the two new pages

## Notes

**The `Markdown` component.** `<Markdown>{source}</Markdown>`, a server component. Pass `react-markdown` `allowedElements={["p", "h2", "h3", "ul", "ol", "li", "a", "strong", "em", "code"]}`, `unwrapDisallowed` and `skipHtml`. Style each element through the `components` prop with token classes only (CODING § 5). Links: `href` as given, and `rel="noopener noreferrer"` on `http` links. US-032 reuses this for chat answers, where F4.3 allows "headings, lists, links and inline code, and nothing else".

If `react-markdown` won't render in a server component, or Vitest can't render it, stop and ask. Don't switch packages on your own.

**Vitest and TSX.** `vitest.config.ts` already includes `*.test.tsx`. If the test can't compile JSX, the fix belongs in `vitest.config.ts` (for example `esbuild: { jsx: "automatic" }`). That's a small, obvious fix; note it in the Log.

**About page:** `getPageIntro(commands, "/about")` from US-013, then `<Markdown>{about.body}</Markdown>`.

**CV page:** `/cv` isn't an ASK ABOUT command, so its intro is fixed site copy, not a fact (D-018): eyebrow "CV", H1 "Résumé", intro "My CV as a one-page PDF." Then an outlined `<a href={profile.links.cv} download>Download CV (PDF)</a>`. Cross-links fall back to the first two ASK ABOUT pages (US-013's rule). Breadcrumb: `/cv`.

**The placeholder PDF (D-019).** Generate it once with Playwright, from a script in your scratch folder (not committed): `page.setContent()` with a page that says "Placeholder CV. Not Caleb Palmquist's real résumé. Replaced before launch (US-049).", then `page.pdf({ path: "public/cv.pdf", format: "Letter" })`. Record the file's SHA-256 in the Log, so US-049's launch check can tell it's still the placeholder.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; Contact moved to US-013; owns the shared `Markdown` component (D-017), the `about.md` schema and the placeholder `cv.pdf` (D-019); points 2 → 3 · — · —
