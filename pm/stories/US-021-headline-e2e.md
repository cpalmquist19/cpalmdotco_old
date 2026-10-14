---
id: US-021
title: F1 tests and CLS check
sprint: S03
status: todo
owner: Claude
points: 2
priority: P0
depends_on: [US-020]
spec: F1; Testing
---

# US-021 · F1 tests and CLS check

As the **builder**, I want the headline behaviour under test, so that animation tweaks never break layout or accessibility.

## Acceptance criteria

- [ ] Every F1 criterion has an e2e test whose title names it, F1.1–F1.7. US-020 wrote the tests for all but F1.3; this story audits them and adds the F1.3 test. The audit result goes in the Log. F1.4's "once a conversation has started" clause belongs to US-032
- [ ] CLS is 0 on home: layout-shift entries from navigation through at least three headline changes sum to 0, on the desktop and mobile viewports
- [ ] The same CLS check passes with `prefers-reduced-motion: reduce`

## Files to touch

- `tests/e2e/headline.spec.ts`: the F1.3 e2e test and the CLS checks, next to the fake-clock helpers they reuse
- `playwright.config.ts`: the webkit project's `grepInvert` also skips tests tagged `@chromium-only` (D-030)
- `docs/CODING.md`: § 9, one clause naming the new tag
- `pm/decisions.md`: row D-030

## Out of scope

- The pause once a conversation has started (F1.4's last clause). The chat doesn't exist yet; US-032 owns it and its test
- Lighthouse CI and its CLS threshold, in light and dark (US-035)
- Changing the headline code (`RotatingHeadline`, `HomeHero`, `lib/headline.ts`) or the tests US-020 wrote. If CLS isn't 0, that's a bug in US-020's work: a small, obvious fix goes in with a Log entry; anything bigger sets this story to `blocked`
- A reduced-motion Playwright project that reruns the whole suite (see Notes)
- A CLS check on any page other than `/`

## Tests to add

In `tests/e2e/headline.spec.ts`:

- `US-021 F1.3: a new fact types in one character at a time, then replaces the oldest`. Fake clock. The newest line grows over successive clock steps, ends equal to the next fact in the pool, and the three lines shown are then facts 2–4 of the pool
- `US-021 F1.3: a fact fades to --text-faint once the next one starts`. Fake clock. After a change, the previous newest line's colour is `--text-faint`
- `US-021 F1.5: CLS is 0 across load and three headline changes @chromium-only`
- `US-021 F1.5: CLS is 0 with reduced motion @chromium-only`

## Notes

- **Where the tests stand.** `tests/e2e/headline.spec.ts` has 8 tests from US-020: F1.1, F1.2 (three), F1.4 (two), F1.5, F1.6 and F1.7. The F1.4 pause and the F1.5 position check are already there, so don't duplicate them. F1.3 has unit tests (`lib/headline.ts` timing) but no e2e test, which is the gap.
- **Measuring CLS.** An `addInitScript` starts a `PerformanceObserver` for `layout-shift` with `buffered: true` before the page runs, and adds up `entry.value` for entries where `hadRecentInput` is false. The test reads the sum at the end. Summing every shift, rather than using Chrome's session-window CLS, is the stricter bound. After `document.fonts.ready`, drive three changes with the fake clock, using the `clockUntilChanged` helper already in the file.
- **Why a tag.** WebKit has no `layout-shift` entry type, so the check can't run there. CODING § 9 says viewport-specific tests use tags, not skips. D-030 adds `@chromium-only`, which the webkit project filters out. The `chromium` and `mobile` (Pixel 7) projects both run it, so it covers a 40 px headline on a phone and a 64 px one on a desktop.
- **"Reduced-motion run included".** Read as: the CLS check runs once per motion preference. The F1.6 test (US-020) already covers the fixed set with reduced motion. A project that reran the whole suite with `reducedMotion: "reduce"` would fail the F1.4 pause tests, which need the cycle running.
- If CLS isn't exactly 0, don't loosen the threshold (CODING § 9). The spec says 0.
- Depends on US-020, which is done.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Scoped in full by US-071: gap audit of F1.1–F1.7 (F1.3 had unit tests only), CLS check and its reduced-motion pass, files, out of scope, tests. Added D-030 · this commit · — · —
