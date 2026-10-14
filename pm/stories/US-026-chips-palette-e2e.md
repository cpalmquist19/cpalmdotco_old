---
id: US-026
title: F2 and F3 tests
sprint: S04
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-023, US-024, US-025]
spec: F2.1–F2.5; F3.1–F3.5; Testing and evals
---

# US-026 · F2 and F3 tests

As the **builder**, I want chips and the palette under test, so that F2 and F3 stay done.

## Acceptance criteria

- [x] Every F2 and F3 criterion, F2.1–F2.5 and F3.1–F3.5, has an e2e test whose title names it. US-023 and US-025 wrote most of them. This story audits them against the spec, adds the ones that are missing, and puts the audit result in the Log
- [x] JavaScript off: every chip is a link in the server HTML, in order, and a click loads that page and not the home page (F2.2)
- [x] The palette is a bottom sheet under 640 px and a popover above the input from 640 px up, and "More" opens the sheet on a phone (F3.1, F3.5)
- [x] The palette works with the keyboard alone, from the first Tab to a command's answer, and neither Tab nor Shift+Tab traps focus (F3.3)
- [x] The chips fade and rise in, and the "More" chip has the chips' outlined, rounded style (F2.4, F2.5)
- [x] A query whose letters are in order but not next to each other matches, and a name prefix puts that command first (F3.2)

## Files to touch

- `tests/e2e/chips.spec.ts`: the F2 tests below, next to the helpers and locators they reuse
- `tests/e2e/palette.spec.ts`: the F3 tests below, same reason

No app code. If a new test finds a real bug, a small, obvious fix goes in with a Log entry. Anything bigger sets this story to `blocked`.

## Out of scope

- Sidebar items and F0.2: US-024 and its tests
- Choosing a palette option by tap or click. It isn't built (US-025's Log: options are keyboard-only), so there is nothing to test. See Notes
- axe on the open palette, in both themes: US-035
- Whether the bottom sheet clears the iOS on-screen keyboard: US-041, on a real device
- Free text, `/api/chat`, streaming, follow-up chips and "New chat": US-029 to US-033
- Changing the tests US-023 and US-025 wrote, including the title of `US-023 F2.2: each chip is a link to its page with JavaScript off`. It runs with JavaScript on; the new JS-off tests below are what prove the claim
- A whole-suite project with JavaScript off or reduced motion (the same reading as US-021)

## Tests to add

`tests/e2e/chips.spec.ts`, the first two inside the existing `with JavaScript off` describe:

- `US-026 F2.2: with JavaScript off the chips are links in order, in the server HTML`
- `US-026 F2.2: with JavaScript off a chip click shows that page, with no chips`
- `US-026 F2.4: the More chip is outlined and fully rounded like the chips`
- `US-026 F2.5: the chips fade and rise in`

`tests/e2e/palette.spec.ts`:

- `US-026 F3.1: the palette is a bottom sheet under 640 px and a popover from 640 px @desktop-only`
- `US-026 F3.2: letters in order match, and a name prefix ranks that command first`
- `US-026 F3.3: Tab and Shift+Tab move focus on when the palette can't take them`
- `US-026 F3.3: the palette works with the keyboard alone, from the first Tab to the answer`
- `US-026 F3.5: on a phone More opens the palette as a bottom sheet @mobile-only`

## Notes

- **The audit, done while scoping.** US-023 wrote 15 chip tests and US-025 wrote 14 palette tests. Against the spec:

  | Criterion | Already tested | Gap, and the test that fills it |
  | --- | --- | --- |
  | F2.1 | order and membership | none |
  | F2.2 | `href` of each chip (runs with JS on); a JS-off click checks the URL only | Nothing reads the no-JS HTML, and the click never checks the page that loaded: the two F2.2 tests |
  | F2.3 | click, Back, reload, modifier click | none |
  | F2.4 | centred, outlined, rounded, icon; CV the only filled button | The "More" chip's style isn't checked |
  | F2.5 | 40 ms stagger, reduced motion, visible with JS off | Nothing checks that they fade and rise |
  | F3.1 | desktop above the input; phone sheet; `/` after text | The 640 px edge is untested: the two tests run only at 1280 px and 412 px |
  | F3.2 | filter by name and by description; no match | No test with letters apart, or of best match first (unit tests only) |
  | F3.3 | arrows wrap, Enter, Tab, Esc | Tab and Shift+Tab not trapping focus, and a keyboard-only run |
  | F3.4 | combobox attributes, listbox and options, `aria-activedescendant` | none |
  | F3.5 | "More" opens the palette; hidden with JS off | "More" on a phone opens the sheet |

- **Why this depends on US-024.** It isn't a shared file. US-024 puts the sidebar's ASK ABOUT items on the same `ask` the chips use, and US-023's Log shows the chips and the sidebar share accessible names. The audit and the locators are easiest to settle once, against the finished sidebar, so this story runs last in S04. If US-024's wiring changes a locator here, the fix is a scoped lookup, as in US-023.
- **Where it stands against D-033.** F2.5 says the chips rise in "after the hero finishes typing". D-033 reads that as "once the page is interactive", and the existing tests follow D-033. Don't add a test for "after typing".
- **Hydration and waits.** Every click or key press straight after `page.goto` waits for the control first with `waitForHydration` (D-038), which both specs already import. No fixed waits (CODING § 9).
- **JS-off tests.** Use the describe's `test.use({ javaScriptEnabled: false })`. The `no-js` project only runs `content-pages.spec.ts`, so these run in the other three. A chip click lands on the real page (`/about/`), so assert on its `<h1>` and that the "Suggested questions" list is absent, the way the reload test does.
- **The 640 px edge.** The palette uses Tailwind's `max-sm`, which is `width < 40rem`: 639 px is a sheet, 640 px is a popover. Load at 640 px wide, open the palette and check it ends above the input. Then `setViewportSize` to 639 px and check it spans the width and ends at the bottom edge. The palette holds its state through a resize. Tag it `@desktop-only` so the touch-emulated mobile project doesn't run it too.
- **Fade and rise.** `getAnimations()` on a chip's `<li>` lists `chip-rise`, with `fill-mode: both` keeping it listed after it ends. Check the animation's name and its keyframes: opacity from 0 to 1, and a `translateY` transform at the start. If an engine returns none, fall back to the computed `animation-name` and say so in the Log. Reduced motion is already tested.
- **Fuzzy.** The ranking rules (D-034) are unit-tested in `tests/unit/lib/fuzzy.test.ts`, so don't repeat them. The e2e test shows the palette uses them. `/pjt` lists `/projects` and nothing that doesn't contain p, j and t in order. For each command in `commands.json`, `/` plus the first three letters of its name lists that command first. Derive the expectations from `commands.json`, as the other tests do, because US-049 replaces the placeholder content.
- **Tab and Shift+Tab.** `useCommandPalette` stops Tab only while the palette is open with a command highlighted. Three cases, each with nothing asked and the thread empty: after Esc (palette closed), with `/zzz` (nothing matches), and Shift+Tab with the palette open. After each, assert the input no longer has focus. Don't assert which element has it: US-032 adds a send button after the input.
- **Keyboard only.** Start with no pointer and no `.click()`, `.fill()` or `.focus()` in the test. `waitForHydration(input)` only reads. Press Tab and expect the skip link to be focused (F1.7), press Enter and expect the input focused, then use `page.keyboard.type("/")`, ArrowDown, Enter. Expect the visitor's message, the answer and the pushed URL. Then type `/` again with focus still in the input and expect the palette to reopen, to prove the flow can repeat.
- **Seen while scoping, not tested here.**
  - **Options can't be tapped or clicked.** `CommandPalette` renders each `option` with no handler, and US-025 chose keyboard-only options "yet". On a phone, "More" opens a sheet of commands a visitor can't select, and the S04 gate says to try every command on desktop and phone. This needs Caleb: a bug to fix in S04, or fine until US-032? Raised in US-077's Log. There is no story for it.
  - **The chips stay invisible if the scripts fail to load.** The hidden state is `@media (scripting: enabled)`, which stays true when a script is blocked or errors, so `.chip-row:not(.chip-row-revealed)` keeps opacity 0 and nothing reveals them. They remain links in the Tab order. This is D-033's trade-off. Noted, not a criterion.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built the 9 tests the audit listed, and no app code changed: 4 in `tests/e2e/chips.spec.ts` (two with JavaScript off, the More chip's style, the fade and rise) and 5 in `tests/e2e/palette.spec.ts` (the 640 px edge, letters in order and name prefix, Tab and Shift+Tab, keyboard only, More on a phone). Audit result: every criterion F2.1–F2.5 and F3.1–F3.5 now has a test whose title names it. The fade-and-rise test reads the `chip-rise` animation through `getAnimations()` on all three engines, so the computed-style fallback wasn't needed. The 640 px test resizes to 639 px with the palette open and sees it become a sheet. Findings from scoping still stand and aren't built here: palette options can't be tapped, and the chips stay at opacity 0 if scripts fail (D-033) · this commit (with US-024 and US-028) · `npm run verify` passed (150 unit tests). First full `npm run test:e2e`: 491 passed, 1 failed (`[webkit] sidebar-chat.spec.ts` PROJECTS click, URL stayed `/`). It passed 30 of 30 on WebKit alone and 425 of 425 with 10 workers on all projects, so it wasn't reproduced and is tracked as US-079. The pre-push run is the gate for this commit
2026-10-14 · Started, as the second of three stories (US-024, US-026, US-028) built and tested locally before one commit and push. US-024's code is in the working tree, uncommitted · — · —
2026-10-14 · Scoped by US-077: gap audit of F2.1–F2.5 and F3.1–F3.5 against the 29 existing tests (7 criteria with gaps, 9 tests to add), files, out of scope, tests and notes · this commit · —
