---
id: US-033
title: Chat contract and F4 tests
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-031, US-032]
spec: Testing › Chat contract, End to end
---

# US-033 · Chat contract and F4 tests

As the **builder**, I want the chat tested against a mocked provider, so that UI and contract regressions are caught without spending tokens.

## Acceptance criteria

- [ ] Contract tests with a mocked provider: SSE event order, error events, fallback links, 500-char cap
- [ ] Playwright tests for F4.1–F4.9
- [ ] Kill-switch behaviour tested

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
