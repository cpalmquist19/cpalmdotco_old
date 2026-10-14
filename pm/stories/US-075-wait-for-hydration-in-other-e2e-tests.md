---
id: US-075
title: Wait for hydration before the first click in the other e2e tests
sprint: backlog
status: todo
owner: Claude
points: 2
priority: P2
depends_on: [US-073, US-074, US-060]
spec: Testing and evals
---

# US-075 · Wait for hydration before the first click in the other e2e tests

As the **builder**, I want every e2e test that clicks right after `page.goto` to wait for hydration, so that the click-before-hydration race US-074 fixed for the share button can't fail another test.

## Acceptance criteria

- [ ] Every test that clicks, types into or presses a keyboard shortcut on a client-rendered control straight after `page.goto` waits for that control to be hydrated first
- [ ] The wait is one shared helper, not a copy in each file
- [ ] The full `npm run test:e2e` passes 3 runs in a row on all four projects, with no assertion weakened and no timeout raised

## Files to touch

- `tests/e2e/helpers/hydration.ts`: the `waitForHydration` helper US-074 put in `topbar.spec.ts`, moved here and exported
- `tests/e2e/topbar.spec.ts`: import it instead of defining it
- `tests/e2e/shell.spec.ts`, `tests/e2e/drawer.spec.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/headline.spec.ts`: call the helper before any click or key press that comes straight after `page.goto`. Specs added later (chips, palette) use the helper from their own stories

## Out of scope

- Any app code (`data-hydrated` attributes, disabled-until-hydrated buttons)
- The `US-005 F0.3: collapsed state survives reload` flake: US-073
- Tests that only read the server-rendered page, which need no wait

## Tests to add

No new tests. The existing ones are made reliable. If a test fails without the wait under the CPU-throttled check in US-074's Log, keep it as the proof.

## Notes

- **Why.** On WebKit, `page.goto` returned before the share button was hydrated in 54 of 60 loads (up to 191 ms). Any test that clicks a client-side control in that gap loses the click silently. Most tests have survived because Playwright's click takes a few frames to check the element is stable, but under load they have no margin. US-074 has the numbers and the detection method (D-038).
- `tests/e2e` has no helpers folder yet. CODING § 2 names `tests/e2e/<area>.spec.ts` only, so a `helpers/` folder here mirrors `tests/unit/helpers/`.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Created from US-074: the same race is open in the other specs · — · —
