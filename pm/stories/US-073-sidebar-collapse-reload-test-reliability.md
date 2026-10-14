---
id: US-073
title: Make the sidebar collapsed-state reload e2e test reliable in WebKit
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-005, US-061, US-074]
spec: F0.3; Testing and evals
---

# US-073 · Make the sidebar collapsed-state reload e2e test reliable in WebKit

As the **builder**, I want the US-005 collapsed-state test to pass on every run, so that an intermittent failure can't block a push or a CI run.

## Acceptance criteria

- [x] `US-005 F0.3: collapsed state survives reload` passes in 3 full `npm run test:e2e` runs in a row, on all four projects
- [x] The test still checks that the rail is 64 px wide after a reload, with no weakened assertion. The width check keeps its default 5 s, and the only added limit is the 15 s wait for the restore, with its reason in a comment
- [x] The Log names the cause of the intermittent failure, and says whether it was in the test or in the component

## Files to touch

- `tests/e2e/shell.spec.ts`: the one test, only if the cause is in the test
- `tests/e2e/helpers/hydration.ts`: new. The `waitForHydration` helper from US-074, moved here so two specs share it
- `tests/e2e/topbar.spec.ts`: import the helper instead of defining it
- `components/shell/Sidebar.tsx`: the width transition or the stored-state read, only if the cause is in the component

## Out of scope

- Changing the sidebar's width, the 200 ms transition's duration, or where the state is stored (`sessionStorage`, F0.3)
- The other tests in `shell.spec.ts`
- Other WebKit flakes. If a second one appears, give it its own story

## Tests to add

- The existing test, made reliable. No new test, and no timeout raised or `waitForTimeout` added (CODING § 9)

## Notes

- **Seen once, on 2026-10-14**, in a full `npm run test:e2e` run (360 passed, 1 failed, all four projects in parallel) during US-072, which changed no app code. The failing test was `[webkit] shell.spec.ts:123`, at the last line, `expect.poll(width).toBe(64)` after `page.reload()`. It received 320 for the whole 5 s.
- **The page snapshot in the failure shows the sidebar collapsed**: the button was named "Expand sidebar", so the stored state was read. Only the width stayed at 320. That points at the `transition-[width]` step, not at storage.
- **Not reproduced elsewhere.** The test ran 5 times in a 1,805-run e2e repeat earlier the same day and passed, and it passed in 30 more WebKit-only repeats of the whole of `shell.spec.ts` (570 runs). So it happens rarely, and perhaps only under the load of all four projects at once.
- **Hypothesis, unconfirmed.** The sidebar renders expanded on the server, and `useSyncExternalStore` switches it to collapsed after hydration. That starts a 200 ms width transition on a page that has just loaded. WebKit may not advance that transition until a frame is produced. Check first by reproducing under load (for example `npx playwright test --project=webkit --repeat-each=10 --workers=8` with the other projects running), keeping the failure's trace (`retain-on-failure` is on), and reading the width and `getComputedStyle(...).transitionProperty` at the failure.
- **Related.** US-066 was a WebKit-only flake of the same kind. A different one was also seen: WebKit workers crashing with exit code 3221226505 in US-018's pre-push run (US-066's Log). Neither has recurred in the runs since.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Done. Caleb approved rewording the first two criteria. The 60-repeat check was the wrong measure: this flake only shows under the load of the whole suite (570 isolated WebKit runs passed before the fix), and 60 parallel WebKit pages crash the browser on this machine. Criterion 1 is now 3 full e2e runs in a row, which passed 361/361 each, and criterion 2 names the 15 s restore wait · this commit · `npm run test:e2e`: 3 full runs 361/361
2026-10-14 · In review, for Caleb to rule on the first two criteria. **Cause, in the test:** the sidebar renders expanded on the server and the stored choice is applied after hydration, so on reload the rail appears a moment late. A diagnostic run inside the full suite measured it in WebKit: the button hydrated at 0 to 90 ms, the collapsed class landed at 0 to 1458 ms, and the width reached 64 at 289 to 2381 ms. In the failing run it passed 5 s, which was the whole budget of the width check. The first click was also exposed to the click-before-hydration race (US-074). **Fix:** `waitForHydration` before the first click, then a wait of up to 15 s for the "Expand sidebar" button, then the unchanged 64 px check on its own 5 s. No component change. **Not met as written:** criterion 1, because the 60 repeats had 17 failures, all WebKit crashing ("Page crashed", "Target page, context or browser has been closed", worker exit code 3221226505, the crash US-066 recorded), none of them an assertion; and criterion 2, because the restore wait has its own 15 s limit (the width assertion keeps its 5 s). Three full `npm run test:e2e` runs after the fix passed 361/361 each. Suggest rewording criterion 1 to what a full suite shows, or fixing the WebKit crash first · this commit · `npm run test:e2e`: 3 full runs 361/361; 60-repeat WebKit run: 43 passed, 17 failed (crashes)
2026-10-14 · Added to backlog from US-072's verification run: one WebKit failure in about 36 runs of this test, not reproduced in 30 further WebKit repeats of `shell.spec.ts`. The cause isn't known yet · — · —
