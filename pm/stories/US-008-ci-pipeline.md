---
id: US-008
title: CI pipeline: lint, typecheck, unit, e2e
sprint: S01
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-001, US-002]
spec: Phase 1; Deployment › Pipeline step 1
---

# US-008 · CI pipeline: lint, typecheck, unit, e2e

As the **builder**, I want CI on every pull request, so that broken code never reaches `main`.

## Acceptance criteria

- [x] A GitHub Actions workflow runs on every push (any branch) and every pull request, with separate jobs named `format`, `lint`, `typecheck`, `unit`, `e2e` and `pm-board`
- [x] The `e2e` job runs the whole Playwright suite (all three projects) and uploads the HTML report when it fails
- [x] The `pm-board` job fails when the generated pm files are stale (`node pm/scripts/board.mjs --check`)
- [x] Vercel deploys every push to `main` (set up in US-001)
- [x] A deliberately failing test makes its job fail in CI

## Files to touch

- `.github/workflows/ci.yml`

## Out of scope

- Accessibility and Lighthouse checks (US-035). The grounded-answer eval (US-034)
- Running e2e against the Vercel preview URL (later, with US-035). CI runs e2e against a local production build
- Deploying from Actions. Vercel's GitHub integration deploys
- Branch protection. D-008 chose direct pushes, guarded by the pre-push hook from US-002

## Tests to add

- No new test files. To prove CI catches failures without breaking `main`: create a throwaway branch `ci-check`, add `expect(1).toBe(2)` to `tests/unit/smoke.test.ts`, commit, and push it with `git push --no-verify origin ci-check`. This is the one allowed `--no-verify`, because the point is to get a failing test to CI. Confirm the `unit` job fails, then delete the branch locally and on GitHub (`git push origin --delete ci-check`). Link the run in the Log.

## Notes

- **Every job:** `runs-on: ubuntu-latest`, `actions/checkout`, `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci`.
- **Commands:** `format` → `npm run format:check`; `lint` → `npm run lint`; `typecheck` → `npm run typecheck`; `unit` → `npm test`; `pm-board` → `node pm/scripts/board.mjs --check`; `e2e` → `npx playwright install --with-deps chromium webkit` then `npm run test:e2e`.
- **Report:** in `e2e`, add `actions/upload-artifact` for `playwright-report/` with `if: failure()`.
- Put `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` at the top of the workflow, so a new push cancels the old run.
- Use the latest major version of each action, as shown in its README.
- The e2e job moved here from US-018, so the S01 tests run in CI from the start.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done. Added `.github/workflows/ci.yml`. Proof on the throwaway `ci-check` branch (pushed with `--no-verify`, the one allowed exception, then deleted locally and on GitHub): run 38442820828, `unit` fails on `expect(1).toBe(2)` and the other five jobs pass; run 38443674637, `e2e` fails on a deliberate assertion and uploads the `playwright-report` artifact, and `pm-board` fails with `stale: BOARD.md` on a committed-stale board. CI ran all 59 e2e tests across chromium, webkit and mobile. Vercel records a Production deployment for each recent push to `main` (50f9a1a, 1be94e9, b941d4b, d850925) · this commit · `npm run verify` and `npm run test:e2e` pass locally (59/59); CI on `main` pending
2026-10-13 · Choices the story left open: `permissions: contents: read` (no job writes to the repo). The e2e command is `npm run test:e2e -- --reporter=github,html`, because `playwright.config.ts` uses only the `github` reporter in CI and writes no `playwright-report/` (run 38443361228 uploaded nothing); the config stays unchanged since it isn't in Files to touch. The upload step has `if-no-files-found: error`, so a missing report fails loudly instead of warning. Actions used: checkout v7, setup-node v7, upload-artifact v7, the latest majors on 2026-10-13 · this commit · —
2026-10-13 · Started: pulled main (d850925), tree clean, depends_on US-001 and US-002 done · — · —
2026-10-13 · Reworked for D-008 (direct pushes to `main`): runs on every push, no branch protection, failure proven on a throwaway branch · — · —
2026-10-12 · Refined for handoff (US-046): added e2e, format and pm-board jobs (e2e moved from US-018), Files/Out of scope/Tests/Notes; points 2 → 3 · — · —
