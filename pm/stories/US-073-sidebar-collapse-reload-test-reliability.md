---
id: US-073
title: Make the sidebar collapsed-state reload e2e test reliable in WebKit
sprint: backlog
status: todo
owner: Claude
points: 1
priority: P2
depends_on: [US-005, US-061]
spec: F0.3; Testing and evals
---

# US-073 · Make the sidebar collapsed-state reload e2e test reliable in WebKit

As the **builder**, I want the US-005 collapsed-state test to pass on every run, so that an intermittent failure can't block a push or a CI run.

## Acceptance criteria

- [ ] `US-005 F0.3: collapsed state survives reload` passes in 60 repeated WebKit runs: `npx playwright test tests/e2e/shell.spec.ts -g "collapsed state survives reload" --project=webkit --repeat-each=60`
- [ ] The test still checks that the rail is 64 px wide after a reload, with no weakened assertion and no longer timeout
- [ ] The Log names the cause of the intermittent failure, and says whether it was in the test or in the component

## Files to touch

- `tests/e2e/shell.spec.ts`: the one test, only if the cause is in the test
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
2026-10-14 · Added to backlog from US-072's verification run: one WebKit failure in about 36 runs of this test, not reproduced in 30 further WebKit repeats of `shell.spec.ts`. The cause isn't known yet · — · —
