---
id: US-008
title: CI pipeline: lint, typecheck, unit
sprint: S01
status: todo
owner: Claude
points: 2
priority: P0
depends_on: [US-001, US-002]
spec: Phase 1; Deployment › Pipeline step 1
---

# US-008 · CI pipeline: lint, typecheck, unit

As the **builder**, I want CI on every pull request, so that broken code never reaches `main`.

## Acceptance criteria

- [ ] GitHub Actions workflow runs lint, typecheck and unit jobs on every PR
- [ ] Vercel preview builds on every PR
- [ ] A deliberately failing test blocks the PR

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
