---
id: US-079
title: Find why one sidebar PROJECTS click test failed once in WebKit
sprint: backlog
status: in-progress
owner: Claude
points: 1
priority: P2
depends_on: [US-024]
spec: F0.2; Testing and evals
---

# US-079 · Find why one sidebar PROJECTS click test failed once in WebKit

As the **builder**, I want `US-024 F0.2: a PROJECTS item still loads its case study` to pass every time, so that the suite stays deterministic (CODING § 9).

## Acceptance criteria

- [ ] The cause of the one failure is found and written in the Log, or the test is shown to pass in 100 WebKit runs under load with a stated reason for the change
- [ ] The test passes in a full `npm run test:e2e` run

## Files to touch

- `tests/e2e/sidebar-chat.spec.ts`: only the PROJECTS test, and the "real content page" test if it has the same cause

## Out of scope

- Any app code, unless the cause is a real bug. Then set the story to `blocked` and say so
- Other specs' hydration waits: US-075

## Tests to add

- None new: the existing test is the one under investigation.

## Notes

- **What happened.** In US-024's first full run (491 passed, 1 failed) the WebKit run of this test stayed on `/` after the click (`toHaveURL` timed out at 5 s). The same test then passed 30 of 30 repeats on WebKit alone, and the whole spec passed 425 of 425 repeats with 10 workers on all three projects. The failure was not reproduced.
- **Suspect.** A client navigation to a case study can take seconds on a loaded machine in WebKit (D-038 saw 4 s for one call). If it is that, a longer `toHaveURL` timeout with that reason is the fix. Don't change it before a failure is seen again or the trace shows it.
- **It was not a one-off.** The pre-push hook's full run for US-024's commit failed the same test on WebKit again, so the push was refused. WebKit alone (159 tests, 10 workers) passed. The trace showed the click was performed, only prefetch requests followed, and the URL stayed `/`.
- **Fix tried.** Time is frozen in this test (`page.clock.install()` and `pauseAt`), as in the headline tests, because a link click is a React transition that the headline's typing timer can keep restarting on a starved machine. This is a hypothesis: it passed 20 of 20 on WebKit and Chromium, and the real check is the next full run.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · The hook refused the push of US-024/026/028 on this same test, so it was fixed in place: the PROJECTS test freezes time. Left `in-progress` until a full run passes · this commit · `sidebar-chat.spec.ts -g PROJECTS`, webkit and chromium, 10 repeats each: 20 passed. Cause is a hypothesis, see Notes
2026-10-14 · Added to backlog while building US-024 and left unsolved on Caleb's call to move on. Not reproduced in 665 reruns · this commit · —
