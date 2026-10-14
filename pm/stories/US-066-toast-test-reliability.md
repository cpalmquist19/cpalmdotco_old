---
id: US-066
title: Make the toast-hides e2e test reliable in WebKit
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-011]
spec: Testing and evals
---

# US-066 · Make the toast-hides e2e test reliable in WebKit

As the **builder**, I want the US-007 toast test to pass on every run, so that an intermittent failure can't block a push or a CI run.

## Acceptance criteria

- [x] `US-007 F0.4: toast hides after 2 seconds` passes in 10 repeated WebKit runs: `npx playwright test -g "toast hides" --project=webkit --repeat-each=10`
- [x] The test still checks that the toast is still shown at 1999 ms and gone at 2000 ms, with no weakened assertion
- [x] The Log names the cause of the intermittent failure

## Files to touch

- `tests/e2e/topbar.spec.ts`: the one test, only if the cause is in the test
- `components/shell/ShareButton.tsx`: the toast timer (`setTimeout` on `TOAST_MS`), only if the cause is in the component

## Out of scope

- Changing the toast's duration (the 2 s in F0.4)
- Other tests in `topbar.spec.ts`

## Tests to add

- The existing test, made reliable. No new test, and no timeout raised or `waitForTimeout` added (CODING § 9)

## Notes

- Seen once in two full runs of `npm run test:e2e` on 2026-10-13, during US-011. The first run failed on WebKit at `expect(page.getByRole("status")).toBeEmpty()` (line 105), after `page.clock.runFor(1)` followed `runFor(1999)`. The second run passed all 112 tests.
- Check first: the fake clock is installed before `page.goto`, and the timer starts on the click. Find out whether the click handler's `setTimeout` is registered before or after `page.clock.pauseAt`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Started. Ready: US-011 is done, and Files/Out of scope/Tests are filled in. Also seen on 2026-10-13 (US-018's pre-push hook, first run): WebKit workers crashed (exit 3221226505) in the US-014 about-cv and US-015 experience tests. The second run passed all 324 tests. Those tests aren't touched here, so this is a separate WebKit flake to watch · — · —
2026-10-13 · **Cause:** `ShareButton` started the 2 s timer in a `useEffect`, after the render that showed "Link copied". React can run an effect in a later task than that render, once the render has used its time slice. Under load the test's `runFor(1999)` could then run before the timer existed, so the timer fired 1 ms too late and the toast was still up at 2000 ms. A diagnostic showed the timer registered before the text in 6 of 6 unloaded runs, so the late case is inferred from how React schedules effects, not seen in a failing run. **Fix:** `components/shell/ShareButton.tsx` starts and clears the timer in `showToast`, in the same step as `setToast`. The unmount cleanup stays. The test is unchanged · this commit · toast test ×10 on WebKit: 10 passed. Topbar, drawer and theme ×5 on WebKit: 100 passed. Toast tests ×5 on chromium and mobile: 40 passed. `npm run verify` passes. `npm run test:e2e`: 324 passed. The failure didn't reproduce before or after the fix
2026-10-13 · Created from US-011's build: the US-007 toast test failed once on WebKit in two full e2e runs, and passed on the rerun · — · —
