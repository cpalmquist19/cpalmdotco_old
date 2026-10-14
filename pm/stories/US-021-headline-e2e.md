---
id: US-021
title: F1 tests and CLS check
sprint: S03
status: done
owner: Claude
points: 2
priority: P0
depends_on: [US-020]
spec: F1; Testing
---

# US-021 · F1 tests and CLS check

As the **builder**, I want the headline behaviour under test, so that animation tweaks never break layout or accessibility.

## Acceptance criteria

- [x] Every F1 criterion has an e2e test whose title names it, F1.1–F1.7. US-020 wrote the tests for all but F1.3; this story audits them and adds the F1.3 test. The audit result goes in the Log. F1.4's "once a conversation has started" clause belongs to US-032
- [x] CLS is at most 0.001 on home (D-031): layout-shift entries from navigation through at least three headline changes sum to 0.001 or less, on the desktop and mobile viewports
- [x] The same CLS check passes with `prefers-reduced-motion: reduce`

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
- `US-021 F1.5: CLS is at most 0.001 across load and three headline changes @chromium-only`
- `US-021 F1.5: CLS is at most 0.001 with reduced motion @chromium-only`

## Notes

- **Where the tests stand.** `tests/e2e/headline.spec.ts` has 8 tests from US-020: F1.1, F1.2 (three), F1.4 (two), F1.5, F1.6 and F1.7. The F1.4 pause and the F1.5 position check are already there, so don't duplicate them. F1.3 has unit tests (`lib/headline.ts` timing) but no e2e test, which is the gap.
- **Measuring CLS.** An `addInitScript` starts a `PerformanceObserver` for `layout-shift` with `buffered: true` before the page runs, and adds up `entry.value` for entries where `hadRecentInput` is false. The test reads the sum at the end. Summing every shift, rather than using Chrome's session-window CLS, is the stricter bound. After `document.fonts.ready`, drive three changes with the fake clock, using the `clockUntilChanged` helper already in the file.
- **Why a tag.** WebKit has no `layout-shift` entry type, so the check can't run there. CODING § 9 says viewport-specific tests use tags, not skips. D-030 adds `@chromium-only`, which the webkit project filters out. The `chromium` and `mobile` (Pixel 7) projects both run it, so it covers a 40 px headline on a phone and a 64 px one on a desktop.
- **"Reduced-motion run included".** Read as: the CLS check runs once per motion preference. The F1.6 test (US-020) already covers the fixed set with reduced motion. A project that reran the whole suite with `reducedMotion: "reduce"` would fail the F1.4 pause tests, which need the cycle running.
- **The bound is 0.001, not 0 (D-031).** The spec says CLS 0, but the headline's caret moves as it types, which Chrome counts as a shift of about 0.0003. Caleb chose to keep the caret and allow up to 0.001. The threshold is `MAX_CLS` in the spec file. It's still a bound on real jumps, so a layout change large enough to matter fails it.
- Depends on US-020, which is done.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Done. F1 audit complete (all seven criteria have tests; F1.3 added). Headline code unchanged; the caret stays. Files outside Files to touch, each with a reason: `pm/decisions.md` (D-031), `pm/stories/US-035` (its CLS criterion now matches D-031), and `tests/e2e/headline.spec.ts` has `test.slow()` on the F1.3 typing test, because typing a fact is about fifty clock steps. · this commit · `npm run verify`: pass. `npm run test:e2e`: 359 passed, 2 failed, both WebKit top-bar toast tests (US-007 F0.4). A clean clone of `main` without this story also fails one of them in a full run (toast sits just below the copy button), so that flake predates this commit and isn't caused by it
2026-10-13 · Caleb chose option A with the bound at 0.001, recorded as D-031. Unblocked. The caret stays, so headline code is unchanged. CLS tests now assert at most 0.001, and their titles say so. Spec F1.5 and the Performance row say 0; D-031 overrides them, and US-035's CLS criterion is updated to match · uncommitted · —
2026-10-13 · Caleb answered option C (remove the headline's blinking caret). Not built yet: the spec's component table (`Caret` · "Headline, chat") and US-020's Caret criterion ("used by the headline and later by the chat") both name the headline as a user, so removing it conflicts with them. Asked Caleb whether to proceed and update those two, or choose A or B instead. My recommendation of C missed that conflict · uncommitted · —
2026-10-13 · Blocked on the CLS criterion (2 of 3 ticked). The caret is the only layout shift. Measured in Chromium: caret hidden, CLS is 0; caret absolutely positioned, CLS ≈ 0.0002; caret as an `::after` pseudo-element, CLS ≈ 0.18. The caret moves each time a character is typed, and Chrome counts that as a shift. Every fix changes the headline's caret, which is US-020 code and its F1.2 caret test, so it's a design call. · uncommitted · `npm run test:e2e`: the two CLS-with-changes tests fail, chromium 0.00026 and mobile 0.00036; all other tests pass
  **Question for Caleb:** which way for the caret? (A) Keep it, and change criterion 2 to a stated CLS threshold. CODING § 9 says don't loosen without asking, and the spec says 0. (B) Keep it and place it with a transform, which Chrome's layout-shift score ignores. Untested; needs a measured offset and a small story. (C) Remove the blinking caret from the headline. The spec's F1 items don't mention one, and it's the simplest fix. Changes US-020's F1.2 caret test. Recommendation: C.
2026-10-13 · Audit of F1.1–F1.7 against the existing tests. F1.1, F1.2 (three tests), F1.4 (two), F1.5 position, F1.6 and F1.7 already had tests named for their criteria, so no changes there. F1.3 had none: added the typing test and the fade test. Added the CLS test with three changes, and the reduced-motion CLS test, both `@chromium-only` · uncommitted · F1.3 tests pass on all four projects; reduced-motion CLS passes on chromium and mobile
2026-10-13 · Test tooling: `clockStep` polls with `intervals: [0]` and a 60 s timeout. `expect.poll`'s default backs off to a second between tries, and a fact takes about 40 clock steps, so the WebKit typing test ran past 15 s. The typing test checks that each sample is a longer prefix of the fact, not one character per sample, because a sample can skip a character when the page paints two in one step. · uncommitted · —
2026-10-13 · CODING § 9 names `@chromium-only`, and `playwright.config.ts` filters it out of the webkit project (D-030; the decision row came from US-071) · uncommitted · —
2026-10-13 · Not from this story: US-007 F0.4 "toast sits just below the copy button" failed once on WebKit in a full run and passed on two solo runs. Same toast timing family as US-066 · — · —
2026-10-13 · Started on main (working tree clean at 5201c2d) · — · —
2026-10-13 · Scoped in full by US-071: gap audit of F1.1–F1.7 (F1.3 had unit tests only), CLS check and its reduced-motion pass, files, out of scope, tests. Added D-030 · this commit · — · —
