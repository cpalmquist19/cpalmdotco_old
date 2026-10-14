---
id: US-033
title: Chat contract and F4 tests
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-031, US-032, US-081]
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
2026-10-14 · Added US-081 to `depends_on` (US-080): F4.5's pinned input, F4.6 and F4.9's counter moved there from US-032, and this story tests F4.1–F4.9. Still not scoped. Two things to settle when it is: how an e2e run swaps in a mock provider for the real route (US-031's limiter counts every caller from one bucket without an IP header, and refuses the 11th request a minute), and whether it re-tests what US-032's `thread.spec.ts` already covers, or audits it as US-026 did · — · —
