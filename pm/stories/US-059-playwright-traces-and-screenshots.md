---
id: US-059
title: Keep a trace and screenshot of every failing e2e test
sprint: backlog
status: todo
owner: Claude
points: 1
priority: P2
depends_on: [US-058]
spec: —
---

# US-059 · Keep a trace and screenshot of every failing e2e test

As the **builder**, I want a failing e2e test to leave a screenshot and a replayable trace in the report, so that I can see what the page looked like and what the browser did without re-running the test.

## Acceptance criteria

- [ ] `playwright.config.ts` sets `trace` to `retain-on-failure` and `screenshot` to `only-on-failure` in the top-level `use`, and no project overrides either
- [ ] The config sets no `retries`, so a test that passes only on a second try still fails
- [ ] Vitest tests cover each criterion above

## Files to touch

- `playwright.config.ts`: add `trace` and `screenshot` to the top-level `use`
- `tests/unit/playwright.config.test.ts`: extend the file US-058 creates

## Out of scope

- Video (`video`). The files are large and a trace already shows every step
- The reporter and the workflow upload step (US-058, US-008). The HTML report embeds traces and screenshots, so the artifact CI already uploads contains them
- Retries. See **Notes**
- Retention of the CI artifact (`retention-days`). Leave GitHub's default

## Tests to add

All in `tests/unit/playwright.config.test.ts`:

- `US-059: traces are kept only for failing tests`
- `US-059: screenshots are taken only for failing tests`
- `US-059: no project overrides trace or screenshot`
- `US-059: no retries are configured`

## Notes

- **Why `retain-on-failure`, not `on-first-retry`.** `on-first-retry` is Playwright's usual advice, but it records nothing unless retries are on, and retries are off on purpose: a test that passes on retry hides a flake, and CODING § 9 counts a test that passes only sometimes as failing. `retain-on-failure` records every run and keeps the trace only for tests that fail.
- **Cost.** A green run keeps nothing extra, so the pre-push hook and passing CI runs are unchanged. A failing run adds one `trace.zip` and one `.png` per failed test.
- **Where they land.** `test-results/<test>/` while the run is in progress. The HTML reporter copies them into `playwright-report/data/`. Open them with `npx playwright show-report`, or `npx playwright show-trace <trace.zip>`.
- **Check by hand.** Temporarily add `expect(1).toBe(2)` to a test in `tests/e2e/smoke.spec.ts` and run `CI=true npm run test:e2e` (in PowerShell, `$env:CI = "true"` first). Confirm a `trace.zip` and a `.png` exist under `test-results/` and under `playwright-report/data/`. Then remove the assertion and run `git diff --stat tests/e2e` to confirm nothing is left. The pre-push hook is never bypassed. Record the result in the Log.
- **US-018.** It adds a `no-js` project to the same file. It depends on this story, so it builds on these settings and a project that sets its own `use` must not repeat `trace` or `screenshot`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Created from the US-008 review: the report CI uploads shows failures and assertion errors but no trace or screenshot. Added US-059 to US-018's `depends_on` (replacing US-058, which it covers through this story), because both edit `playwright.config.ts` · this commit · `board.mjs --check` passes
