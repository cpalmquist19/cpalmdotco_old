---
id: US-035
title: axe and Lighthouse CI as required checks
sprint: S06
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-018, US-050]
spec: Testing › Test suites; F0.6
---

# US-035 · axe and Lighthouse CI as required checks

As the **builder**, I want accessibility and performance gated in CI, so that quality can't regress silently.

## Acceptance criteria

- [ ] `@axe-core/playwright`: zero serious/critical violations on every route in both themes
- [ ] Lighthouse CI ≥ 95 on Performance, Accessibility, Best Practices, SEO in light and dark; CLS at most 0.001 on home (D-031)
- [ ] Unit, E2E, a11y/perf and eval are required status checks on `main`

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · CLS criterion changed from 0 to at most 0.001, per D-031 (the headline caret's shift). Set the Lighthouse CLS assertion to 0.001 to match · uncommitted · —
