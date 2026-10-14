---
id: US-018
title: F5 tests and a JavaScript-off project
sprint: S02
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-007, US-014, US-015, US-016, US-017, US-059]
spec: F5; Testing › End to end
---

# US-018 · F5 tests and a JavaScript-off project

As the **builder**, I want end-to-end tests for every content page, so that F5 stays done.

## Acceptance criteria

- [x] Tests cover F5.1 and F5.6 on every content page, not just the one each page story tested
- [x] Every page is tested with JavaScript turned off (F5.5), using a `no-js` Playwright project (`javaScriptEnabled: false`)
- [x] With JavaScript off, following a cross-link, a footer link and a project title loads the next page
- [x] The top-bar CV is the only filled button on every content page (F2.4)

## Files to touch

- `playwright.config.ts`: add the `no-js` project (see **Notes**)
- `tests/e2e/content-pages.spec.ts`

## Out of scope

- Re-testing what each page story already covers (F5.2 to F5.4 details)
- axe and Lighthouse (US-035)
- Changing any page. If a page fails with JavaScript off, fix it only if the fix is small and obvious, and note it in the Log; otherwise stop and ask
- Changing the existing three projects, apart from what **Notes** says

## Tests to add

All in `tests/e2e/content-pages.spec.ts`. Build the route list from `loadContent()`: every ASK ABOUT page's `answer`, `/cv/`, and `/projects/<slug>/` for each project. Use one `for` loop over routes to make one test per route:

- `US-018 F5.1: <route> has the template`: Breadcrumb nav with "Home", exactly one `h1`, the `main` landmark, and the `contentinfo` footer
- `US-018 F5.6: <route> footer has the chat and CV buttons, the nav and the social links`
- `US-018 F2.4: <route> has one filled button, the top-bar CV`: the same check as US-007's, in light only (US-007 covers both themes on the home page)
- `US-018 F5.5: links work with JavaScript off`: from `/about/` follow the first cross-link; from `/skills/` follow a footer nav link; from `/projects/` follow the first project title. Each lands on the right URL with its `h1`

The `no-js` project runs this file only. The other three projects run it too, so every page is checked with and without JavaScript.

## Notes

- **The project:**
  ```ts
  {
    name: "no-js",
    use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
    testMatch: /content-pages\.spec\.ts/,
  },
  ```
  `testMatch` keeps it to this file: the S01 tests (theme toggle, drawer, share) need JavaScript and must not run here. No tags needed.
- With JavaScript off the theme script doesn't run, so pages render in light. That's expected.
- The pre-push hook runs every project, so pushes get a little slower. That's fine.
- Depends on US-007 because criterion 4 needs the top bar.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Added the `no-js` project to `playwright.config.ts` (only `content-pages.spec.ts`), and `tests/e2e/content-pages.spec.ts`: F5.1, F5.6 and F2.4 for each of the 10 content routes (5 ASK ABOUT, /cv/, 4 case studies), plus the F5.5 link test. The F2.4 tests run in light only. JavaScript-off was checked with a separate context: a script ran with `javaScriptEnabled: true` and didn't with `false` · this commit · `npm run verify` passes. `npm run test:e2e`: 324 passed (chromium, webkit, mobile, no-js). The build still prints the two Turbopack warnings from `lib/content.ts` (US-067, not changed here)
2026-10-13 · Replaced US-058 with US-059 in `depends_on`: US-059 also edits `playwright.config.ts` and depends on US-058, so it covers both · this commit · `board.mjs --check` passes
2026-10-13 · Added US-058 to `depends_on`: both stories edit `playwright.config.ts`, so US-058's reporter change lands first · this commit · `board.mjs --check` passes
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes, link-following and filled-button criteria; depends on US-007 · — · —
2026-10-12 · Playwright setup moved to US-002 and the CI e2e job to US-008 (US-046), so S01's tests run from the start · — · —
