---
id: US-079
title: Find why a hydrated sidebar link click is sometimes dropped in WebKit
sprint: backlog
status: todo
owner: Claude
points: 1
priority: P2
depends_on: [US-024]
spec: F0.2; Testing and evals
---

# US-079 · Find why a hydrated sidebar link click is sometimes dropped in WebKit

As the **builder**, I want `US-024 F0.2: a PROJECTS item still loads its case study` to pass every time, so that the suite stays deterministic (CODING § 9).

## Acceptance criteria

- [ ] The cause of the dropped click is found and written in the Log, and the retry in `clickUntilAt` is removed or justified by it
- [ ] The test passes in a full `npm run test:e2e` run

## Files to touch

- `tests/e2e/sidebar-chat.spec.ts`: `clickUntilAt` and the two tests that use it (PROJECTS and "real content page")

## Out of scope

- Any app code, unless the cause is a real bug. Then set the story to `blocked` and say so
- Other specs' hydration waits: US-075

## Tests to add

- None new: the existing test is the one under investigation.

## Notes

- **What happened.** In US-024's first full run (491 passed, 1 failed) the WebKit run of this test stayed on `/` after the click (`toHaveURL` timed out at 5 s). The same test then passed 30 of 30 repeats on WebKit alone, and the whole spec passed 425 of 425 repeats with 10 workers on all three projects. The failure was not reproduced.
- **Suspect.** A client navigation to a case study can take seconds on a loaded machine in WebKit (D-038 saw 4 s for one call). If it is that, a longer `toHaveURL` timeout with that reason is the fix. Don't change it before a failure is seen again or the trace shows it.
- **It was not a one-off.** The pre-push hook's full run for US-024's commit failed the same test on WebKit again, so the push was refused. WebKit alone (159 tests, 10 workers) passed. The trace showed the click was performed, only prefetch requests followed, and the URL stayed `/`.
- **A second test failed the same way.** The next hook run refused the push on `US-024 F0.2: on a real content page an item loads its page and shows no thread`, also WebKit, starting from `/about/`, where there is no headline timer. So the frozen-clock theory was wrong and was removed. In both traces the link was hydrated, the click was performed, and only prefetch requests followed: no navigation and no error. The existing `New chat` test passes because it clicks before hydration, which falls back to a normal page load.
- **Fix in place.** `clickUntilAt` repeats the click until the URL changes (up to 20 s), the D-038 treatment for a silently dropped click. It hides the symptom and doesn't explain it. The open question is whether a visitor can hit the same dropped click on a slow machine, which needs a real WebKit device to settle.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Parked on Caleb's call: he will come back to it after more of the app is built. Back to `todo`. Nothing is uncommitted, and the `clickUntilAt` retry from fe9bb40 stays in place meanwhile. Both acceptance criteria are still open · this commit · `node pm/scripts/board.mjs --check` passes
2026-10-14 · The hook refused a second push, on the "real content page" test. Replaced the frozen clock with a retried click (`clickUntilAt`) in both tests. Still `in-progress`: the cause isn't known · this commit · see the next push's run
2026-10-14 · The hook refused the push of US-024/026/028 on this same test, so it was fixed in place: the PROJECTS test froze time. Left `in-progress` until a full run passes · 8e92015 · `sidebar-chat.spec.ts -g PROJECTS`, webkit and chromium, 10 repeats each: 20 passed. Cause is a hypothesis, see Notes
2026-10-14 · Added to backlog while building US-024 and left unsolved on Caleb's call to move on. Not reproduced in 665 reruns · this commit · —
