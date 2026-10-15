---
id: US-085
title: Fix four home-page issues Caleb marked up in a screenshot
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: [US-070, US-081]
spec: F0.1 (sidebar), F1.2 and F1.5 (headline), F2.1 (chips), F4.5 and F4.9 (input and counter); ChatInput
---

# US-085 · Fix four home-page issues Caleb marked up in a screenshot

As a **visitor**, I want the home page to line up and read cleanly, so that it looks finished.

Caleb sent a screenshot of the home page with four notes. This story has no earlier story, so it was created from the screenshot.

## Acceptance criteria

- [x] In the expanded sidebar, the name's text starts at the same x as the "New chat" and ASK ABOUT labels (note 1)
- [x] Every fact in `headlinePool` fits on one line at 64 px on desktop and at 40 px on a phone, with no ellipsis (note 2, D-028)
- [x] The Send button is centred vertically on the input pill (note 3)
- [x] The chips sit no more than 24 px under the input before a conversation starts, with and without the counter showing (note 4, D-060)

## Files to touch

- `components/shell/Sidebar.tsx`: drop the row's `gap-3` between the collapse button and the name link, so the name starts where the labels start
- `components/hero/HomeHero.tsx`: only if the chip spacing can't be done in `ChipRow` or `ChatInput`
- `components/chat/ChatInput.tsx`: `block` on the textarea, and the counter moves inside the pill, left of Send
- `components/chips/ChipRow.tsx`: only if a margin change is needed
- `content/profile.json`: shorter `headlinePool` facts, from the same placeholder facts
- `tests/e2e/headline-fit.spec.ts`: new
- `tests/e2e/chat-input.spec.ts`: Send is centred, the chips are close, the counter doesn't move them
- `tests/e2e/sidebar-align.spec.ts`: new, the name aligns with the labels. Not in `shell.spec.ts`, which US-075 also changes and isn't ordered against this story
- `pm/decisions.md`: a row for the counter's new place (it changes D-060's last sentence)

## Out of scope

- Replacing the placeholder facts with Caleb's real ones: US-049. This story only shortens the placeholders
- Changing the headline's size, line count or truncation (D-028 stays)
- A rule on how long a fact may be in `content-schemas.ts`: the e2e fit test is the guard, because fit depends on glyph widths, not character counts
- The drawer's top row: it has no collapse button, so the note doesn't apply to it

## Tests to add

`tests/e2e/sidebar-align.spec.ts`:

- `US-085 F0.1: the sidebar name starts where the item labels start @desktop-only`

`tests/e2e/headline-fit.spec.ts`:

- `US-085 F1.2: every headline fact fits on one line with no ellipsis`

`tests/e2e/chat-input.spec.ts`:

- `US-085 F4.5: the Send button is centred vertically on the input`
- `US-085 F2.1: before a conversation the chips sit close under the input, with or without the counter`

## Notes

- **Note 1.** The collapse button is 40 px wide and a menu item is `px-3` (12) + icon (16) + `gap-3` (12) = 40 px, so the name should start 40 px from the sidebar's padding edge, not 52.
- **Note 3.** The textarea is `inline-block` by default, so the wrapper is a few pixels taller than the pill (the line-box descender gap) and `top-1/2` lands low.
- **Note 4.** The counter's reserved line under the input (D-060) is what keeps the chips far away. Moving the counter inside the pill, with right padding always reserved for it, keeps "the counter appearing never moves anything" and removes the line.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-15 · Done. All four criteria ticked on passing runs. Note 1: dropped the `gap-3` between the collapse button and the name. Note 2: shortened the 10 placeholder facts (same facts, fewer words); the new fit test failed on the old pool and on the first draft of the new one (mobile cut four, desktop one), so the limit it enforces is real. Note 3: `block` on the textarea. Note 4: counter moved inside the pill (D-065), `pr-28` reserved, line under the input removed. Outside **Files to touch**: none. `npm run verify` passed (281 unit tests; board check, with the US-035, US-038 and US-042 readiness warnings that were already there). Full `npm run test:e2e`: 610 passed, then the one failing new test (a 450-character fill wraps and grows the input, so it compared the chips' absolute position) was fixed to compare the gap, and `chat-input.spec.ts` ran 37 of 37 · this commit · pass
2026-10-15 · Started. Created from Caleb's screenshot, which had no story · — · —
