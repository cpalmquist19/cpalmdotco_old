---
id: US-008
title: CI pipeline: lint, typecheck, unit, e2e
sprint: S01
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-001, US-002]
spec: Phase 1; Deployment › Pipeline step 1
---

# US-008 · CI pipeline: lint, typecheck, unit, e2e

As the **builder**, I want CI on every pull request, so that broken code never reaches `main`.

## Acceptance criteria

- [ ] A GitHub Actions workflow runs on every PR to `main` and every push to `main`, with separate jobs named `format`, `lint`, `typecheck`, `unit`, `e2e` and `pm-board`
- [ ] The `e2e` job runs the whole Playwright suite (all three projects) and uploads the HTML report when it fails
- [ ] The `pm-board` job fails when the generated pm files are stale (`node pm/scripts/board.mjs --check`)
- [ ] Vercel builds a preview deployment on every PR
- [ ] A deliberately failing test makes its job fail and blocks the merge

## Files to touch

- `.github/workflows/ci.yml`
- `pm/README.md`: change "Once CI exists (US-008), add this step" to say the step now runs in CI

## Out of scope

- Accessibility and Lighthouse checks (US-035). The grounded-answer eval (US-034)
- Running e2e against the Vercel preview URL (later, with US-035). CI runs e2e against a local production build
- Deploying from Actions. Vercel's GitHub integration deploys
- Changing branch protection yourself (see Notes)

## Tests to add

- No new test files. To prove the gate works: on the PR branch, push a commit that adds `expect(1).toBe(2)` to `tests/unit/smoke.test.ts`; confirm the `unit` job fails and the PR shows it can't be merged; then revert that commit. Link both runs in the Log.

## Notes

- **Every job:** `runs-on: ubuntu-latest`, `actions/checkout`, `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci`.
- **Commands:** `format` → `npm run format:check`; `lint` → `npm run lint`; `typecheck` → `npm run typecheck`; `unit` → `npm test`; `pm-board` → `node pm/scripts/board.mjs --check`; `e2e` → `npx playwright install --with-deps chromium webkit` then `npm run test:e2e`.
- **Report:** in `e2e`, add `actions/upload-artifact` for `playwright-report/` with `if: failure()`.
- Put `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` at the top of the workflow, so a new push cancels the old run.
- Use the latest major version of each action, as shown in its README.
- **Blocking the merge** needs branch protection on `main` (decision D-008). That's a repo setting, owned by Caleb. If D-008 isn't decided, or protection isn't on when you reach the last criterion, set the story to `blocked` and ask. Don't change repo settings yourself unless Caleb tells you to.
- The e2e job moved here from US-018, so the S01 tests run in CI from the start.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-12 · Refined for handoff (US-046): added e2e, format and pm-board jobs (e2e moved from US-018), Files/Out of scope/Tests/Notes; points 2 → 3 · — · —
