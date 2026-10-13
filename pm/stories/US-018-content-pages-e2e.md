---
id: US-018
title: F5 tests and a JavaScript-off project
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-014, US-015, US-016, US-017]
spec: F5; Testing › End to end
---

# US-018 · F5 tests and a JavaScript-off project

As the **builder**, I want end-to-end tests for every content page, so that F5 stays done.

## Acceptance criteria

- [ ] Tests cover F5.1–F5.6
- [ ] Every page is tested with JavaScript turned off (F5.5), using a `no-js` Playwright project (`javaScriptEnabled: false`)

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-12 · Playwright setup moved to US-002 and the CI e2e job to US-008 (US-046), so S01's tests run from the start · — · —
