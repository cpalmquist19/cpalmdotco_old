---
id: US-020
title: Rotating headline and caret
sprint: S03
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-019]
spec: F1.1–F1.6; RotatingHeadline, Caret
---

# US-020 · Rotating headline and caret

As a **visitor**, I want a lively headline of facts, so that I get a feel for Caleb before I ask anything.

## Acceptance criteria

- [x] `<h1>` holds the greeting and full pool as `sr-only` text plus an `aria-hidden` animated copy (F1.1)
- [x] Greeting plus 3 facts at ~64 px, bold, −0.03em; newest `--text`, others `--text-faint` (F1.2)
- [x] Types at 30–45 ms/char (±15 ms jitter), holds 2.5–3 s, fades over 400 ms, replaces the oldest (F1.3)
- [x] Pauses while the input has focus or the tab is hidden (F1.4). The pause for a started conversation moves to US-032, which starts conversations
- [x] Reserves 3 lines so the input never moves (F1.5)
- [x] `prefers-reduced-motion: reduce` shows a fixed set with no typing or fading (F1.6)
- [x] `Caret` is a shared component in `components/ui/`, used by the headline and later by the chat (US-032)
- [x] Skip link appears on the first Tab press and moves focus to the input (F1.7). The pill input is built here, above which the headline sits. Moved from US-019 on 2026-10-13

## Files to touch

- `lib/headline.ts` (new): the cycle logic. `startCycle`, `advance`, `delayMs` and the timing constants
- `tests/unit/lib/headline.test.ts` (new)
- `components/ui/Caret.tsx` (new): the blinking caret
- `components/hero/RotatingHeadline.tsx` (new, client): the `h1`, the cycle and the reduced-motion and tab-visibility checks
- `components/hero/HomeHero.tsx` (new, client): the headline and the input, and the input's focus state
- `components/hero/PillInput.tsx` (new, client): a plain `<input id="chat-input">`. US-032 replaces it with `ChatInput`
- `components/shell/SkipLink.tsx` (new, client): the skip link, rendered on `/` only
- `components/shell/AppShell.tsx`: render `SkipLink` as the first child, before the sidebar
- `app/page.tsx`: render `HomeHero` with `profile.json`'s greeting and pool. Keep `dynamic = "error"` (static, F5.5 style)
- `tests/e2e/headline.spec.ts` (new)
- `pm/decisions.md`: the two build decisions (D-028, D-029)

## Out of scope

- The chat input: send button, auto-grow, Enter to send, and the conversation itself (US-032). The input here is a plain `<input>`
- The pause for a started conversation (moved to US-032)
- Chips (US-023), the slash palette (US-025) and the CLS check (US-021)
- Changing `profile.json`, the content schemas or the headline pool (D-004 is decided)
- Any page other than `/`, apart from the skip link being rendered by the shell

## Tests to add

Unit, in `tests/unit/lib/headline.test.ts`:

- `US-020 F1.3: typing takes 30–45 ms per character`
- `US-020 F1.3: a fact holds for 2.5–3 s, then fades for 400 ms`
- `US-020 F1.3: each new fact replaces the oldest, and the pool wraps round`
- `US-020 F1.3: a cycle needs at least three facts`

E2E, in `tests/e2e/headline.spec.ts`. Use the fake clock (`page.clock`) where timing matters, as topbar.spec.ts does, so each test is deterministic:

- `US-020 F1.1: the h1 holds the greeting and every fact as sr-only text`
- `US-020 F1.2: the greeting, then three facts; the newest in --text, the others in --text-faint` (reduced motion, so the set is fixed)
- `US-020 F1.2: the caret sits after the newest fact and is hidden from assistive tech`
- `US-020 F1.4: the headline stops while the input has focus, and resumes on blur`
- `US-020 F1.4: the headline stops while the tab is hidden, and resumes when it's shown`
- `US-020 F1.5: the headline and the input keep the same positions as the facts change`
- `US-020 F1.6: with reduced motion the fixed set shows, with no typing, fading or caret`
- `US-020 F1.7: the skip link is the first Tab stop and moves focus to the input`

## Notes

- **Layout (D-028).** The greeting is a one-line lead above the block. The block is three fact lines, each on one line and truncated, reserved at exactly three lines so the input never moves. Facts are 40 px on phones and 64 px from `sm`. The `h1`'s sr-only text holds the full greeting and pool.
- **Timing (D-029).** Each character takes 30–45 ms at random. A fact holds for 2.5–3 s, then fades to `--text-faint` over 400 ms, and the next fact types in at the bottom while the oldest leaves the top.
- **Pause.** The cycle runs only when no input has focus, the tab is visible, and reduced motion is off. Focus and visibility come from `HomeHero` and `document`.
- **Skip link.** It sits before the sidebar, so it's the first Tab stop. It shows only on `/`, where it targets `#chat-input`. On click, the handler focuses the input. Without JavaScript the `href` still jumps to it.
- Depends on US-019, which is done (the pool was approved on 2026-10-13).

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Built the headline: `lib/headline.ts` (the cycle), `RotatingHeadline`, `HomeHero`, `PillInput` (a plain input, `#chat-input`), `Caret`, the `SkipLink` in `AppShell`, and the home page. Two findings from the tests. (1) With the fake clock, React has to render between timers, so one long `runFor` stalls after the first timer. The tests move the clock in small steps (`clockUntilChanged`). (2) Safari leaves `<a>` out of the Tab order by default, so the skip link has `tabIndex={0}`, and its test passes on WebKit. The F1.4 "conversation" pause moved to US-032, and the Caret criterion now says what it is. · this commit · `npm run verify` passes. `npm run test:e2e`: 351 passed (chromium, webkit, mobile, no-js). The Turbopack warnings from `lib/content.ts` are still there (US-067) · — · —
2026-10-13 · Scoped in full, for the placeholder pool approved on 2026-10-13. Moved the conversation part of F1.4 to US-032, because the chat doesn't exist yet. Reworded the Caret criterion so it's testable now: a shared component the headline uses. Recorded the layout and timing choices as D-028 and D-029 · — · —
2026-10-13 · Added the skip link (F1.7) as criterion 7, moved from US-019 on Caleb's choice · — · —
