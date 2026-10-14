---
id: US-074
title: Wait for hydration before clicking in the share-toast e2e tests
sprint: backlog
status: done
owner: Claude
points: 1
priority: P1
depends_on: [US-066]
spec: F0.4; Testing and evals
---

# US-074 · Wait for hydration before clicking in the share-toast e2e tests

As the **builder**, I want the share-button tests to click only once the page is interactive, and not to race the toast's 2 s timer, so that an intermittent WebKit failure can't block a push or a CI run.

## Acceptance criteria

- [x] Each of the four `topbar.spec.ts` tests that click the share button waits until the button is hydrated before it clicks (F0.4)
- [x] `npx playwright test tests/e2e/topbar.spec.ts -g "share|toast" --repeat-each=15 --workers=8` passes: 180 runs on chromium, webkit and mobile
- [x] `US-007 F0.4: toast sits just below the copy button` measures the toast on a paused clock, so the 2 s auto-hide can't expire while it is measured
- [x] No existing assertion is weakened and no existing timeout is raised. The one new limit, the hydration wait's 15 s, has its reason in a comment
- [x] The Log gives the causes and the measured numbers

## Files to touch

- `tests/e2e/topbar.spec.ts`: a `waitForHydration` helper, called before the click in the four share-button tests, and a paused clock in the "sits just below" test
- `pm/decisions.md`: one row recording how the tests detect hydration
- `pm/stories/US-075-wait-for-hydration-in-other-e2e-tests.md`: new backlog story for the same race in other specs

## Out of scope

- The app: no `data-hydrated` attribute, no disabled-until-hydrated button, no change to `ShareButton.tsx` or `Toast.tsx`
- The toast's 2 s duration (spec F0.4, `Toast` row)
- Other spec files with a click right after `page.goto`: US-075
- `US-005 F0.3: collapsed state survives reload`: US-073, which has a different cause
- WebKit's "Page crashed" failures, which hit unrelated specs (see the Log)

## Tests to add

No new tests. The four existing tests are made reliable:

- `US-007 F0.4: share copies the URL and shows a toast`
- `US-007 F0.4: toast hides after 2 seconds`
- `US-007 F0.4: toast sits just below the copy button`
- `US-007: failed copy shows an error toast`

## Notes

- **Seen twice in two full `npm run test:e2e` runs on 2026-10-14**, both on WebKit: `expect(getByRole("status")).toHaveText("Link copied")` received `""` for the whole 5 s. Eight polls all saw an empty region, so the toast never appeared. The same test passed in 180 repeated runs on its own, so it needs the load of the whole suite.
- **Cause 1: a click before hydration.** `page.goto` resolves on the `load` event, and on WebKit React hasn't finished hydrating by then. A click in that gap reaches the server-rendered button, which has no handler yet, and is dropped with no error. Measured with a throwaway spec (60 loads per project, 8 workers): the share button was not hydrated when `goto` returned in 54 of 60 WebKit loads (up to 191 ms to hydrate), 6 of 60 on the mobile project (up to 17 ms), 0 of 60 on Chromium. With the app's scripts held back at the network, a click before hydration left the clipboard untouched and the toast empty on both Chromium and WebKit, and waiting for hydration first showed the toast on both.
- **Cause 2: the toast's 2 s timer.** Once the first race was gone, `toast sits just below the copy button` failed in WebKit on both full runs: the toast was found, then gone by the next call. In that trace every WebKit call took 0.7 to 3 s, and `boundingBox` ran about 2.6 s after the toast showed. The test measured in real time against a timer that is 2 s long. A paused fake clock, as `toast hides after 2 seconds` already uses, removes the race.
- **Cause 3: the wait's own limit.** In a 180-run repeat at 8 workers, the hydration wait timed out once: one `evaluate` took 3.9 s, so the default 5 s poll got two attempts. The wait now has a 15 s limit, which costs nothing when the page is ready.
- **How to detect hydration.** React sets a `__reactProps$<id>` key on every DOM element it has hydrated. The helper polls the share button for a key that starts with `__reactProps$`. That is a React internal, so the helper's comment says so, and a React change makes the wait time out loudly rather than pass quietly (D-038). The wait polls from Node, so it also works under the fake clock, where in-page timers are paused.
- **Why not the app.** A `data-hydrated` attribute or a disabled button adds production code for the tests' sake, and the 190 ms gap is not something a visitor can notice.
- **The toast's length.** Caleb said the toast felt slow to disappear. The code removes it at exactly 2000 ms with no fade (`TOAST_MS` in `ShareButton.tsx`), as F0.4 says, and `toast hides after 2 seconds` checks 1999 ms and 2000 ms on a fake clock. If 2 s feels long, that's a spec change for Caleb to decide, not part of this story.
- **A failed attempt at proof, for the record.** A 20× CPU throttle in Chromium made the old and the fixed spec both fail on timeouts, so it proved nothing. Holding the scripts back at the network, above, is the proof that stands.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Done. Fix: `waitForHydration` before each share click, a paused clock in "sits just below", and a 15 s limit on the wait. After the fix, `-g "share|toast" --repeat-each=15 --workers=8` passed 180/180 (it was 179/180 before the 15 s limit). Full `npm run test:e2e`: 361 passed, then in a second run 356 passed and 5 failed, all WebKit "Page crashed" or "Target closed" in about-cv, content-pages, experience and headline specs, none of them share tests and none touched here. US-066's Log recorded the same crash on 2026-10-13. A different WebKit failure, US-073's reload test, also reappeared once in an earlier run · this commit · `npm run verify` passes (126/126 unit tests); `npm run test:e2e`: 361 passed in the clean run
2026-10-14 · Created and started. Caleb asked for the recurring WebKit share-toast failure to be resolved, and it blocked US-022's push. The cause is in Notes · — · —
