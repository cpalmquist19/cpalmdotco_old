---
id: US-058
title: Set the CI report reporter in the Playwright config
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-008]
spec: —
---

# US-058 · Set the CI report reporter in the Playwright config

As the **builder**, I want the e2e reporters chosen in one place, so that CI and a local `CI=true` run write the same HTML report and nobody has to remember a command-line flag.

## Acceptance criteria

- [x] With `CI` set, `playwright.config.ts` uses the `github` and `html` reporters, and `html` never opens a browser or serves the report. Without `CI`, it uses `list` only, as before
- [x] `.github/workflows/ci.yml` runs `npm run test:e2e` with no `--reporter` flag, and its upload step still names `playwright-report/` and fails when the folder is missing
- [x] Vitest tests cover each criterion above

## Files to touch

- `playwright.config.ts`: the CI `reporter` becomes `[["github"], ["html", { open: "never" }]]`
- `.github/workflows/ci.yml`: remove `-- --reporter=github,html` from the e2e step, and the comment above it
- `tests/unit/playwright.config.test.ts`: new

## Out of scope

- Traces, screenshots and video (US-059)
- Writing the HTML report on local runs. They keep `list` only, so the pre-push hook's output doesn't change
- Changing the projects, `webServer` or timeouts. US-018 adds the `no-js` project
- Proving the failure-path upload again. US-008 proved it (run 38443674637) and this story doesn't touch the upload step. The `--no-verify` exception was US-008's alone, so there is no throwaway branch here

## Tests to add

All in `tests/unit/playwright.config.test.ts`:

- `US-058: CI uses the github and html reporters, and html never opens`
- `US-058: a local run uses the list reporter only`
- `US-058: the workflow runs test:e2e with no --reporter flag`
- `US-058: the workflow uploads playwright-report and fails if it is missing`

## Notes

- **Why.** US-008's first proof run (38443361228) uploaded nothing, because the config's CI reporter was `github`, which writes no report. US-008 fixed it with a flag in `ci.yml` and left the config alone, as it wasn't in that story's files. This story removes the second place.
- **Reading the config in a test.** Vitest can import it. Set the environment with `vi.stubEnv("CI", "true")` (or `vi.stubEnv("CI", "")` for local, since an empty string is falsy), call `vi.resetModules()`, then `await import("@/playwright.config")` and check `default.reporter`. Stub `CI` in every test: GitHub Actions sets it, and the tests must give the same result there and locally.
- **Reading the workflow.** `yaml` isn't installed until US-011, so read `.github/workflows/ci.yml` as text and assert on the lines. Don't add a package for this.
- **Check by hand.** Run `CI=true npm run test:e2e` once (in PowerShell, `$env:CI = "true"` first) and confirm `playwright-report/index.html` exists after a passing run. `playwright-report/` is git-ignored. Record the result in the Log.
- **Shared file.** US-018 also edits `playwright.config.ts`, so it now depends on this story and on US-059 in `depends_on`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Moved the CI reporters into `playwright.config.ts` as `[["github"], ["html", { open: "never" }]]` and dropped `-- --reporter=github,html` and its comment from the e2e step in `ci.yml`. Four unit tests added in `tests/unit/playwright.config.test.ts`. `npm run verify` passes (34 unit tests). `CI=true npm run test:e2e`: 78 passed, `playwright-report/index.html` written. Plain `npm run test:e2e`: 78 passed, no report written. Port 3000 free afterwards · this commit · local checks pass; CI run to be noted in the next commit
2026-10-13 · Created from the US-008 review: the reporter lived in both `playwright.config.ts` and a flag in `ci.yml`. Added US-058 to US-018's `depends_on`, because both edit `playwright.config.ts` · this commit · `board.mjs --check` passes
