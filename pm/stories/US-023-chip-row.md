---
id: US-023
title: Link-first suggested chips
sprint: S04
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-022, US-020]
spec: F2.1–F2.5; F1.4; F1.7; ChipRow, Chip
---

# US-023 · Link-first suggested chips

As a **visitor**, I want suggested questions under the input, so that I can explore without typing.

## Acceptance criteria

- [x] Chips are the `commands.json` entries with `chip: true`, in `order` (F2.1)
- [x] Each chip is an `<a href>` to its page in the server-rendered HTML, so it works with JavaScript off (F2.2)
- [x] With JavaScript, a plain click on a chip stays on the page: the label appears as a visitor message, the answer appears below it, and `history.pushState` sets the chip's page URL (F2.3). What the answer holds is decision D-032
- [x] Back restores the thread as it was before the click, and a reload of the pushed URL shows the real page (F2.3)
- [x] Chips sit centred under the input in one outlined, fully rounded style, with the command's Lucide icon before the label. The top-bar CV is still the only filled button (F2.4)
- [x] After the page is interactive the chips fade and rise in with a 40 ms stagger. Under reduced motion they just appear. With JavaScript off they are visible from the first paint (F2.5, D-033)
- [x] The headline stops cycling once a chip has been clicked (F1.4: the part of it this story starts)
- [x] The region the answer appears in is `aria-live="polite"`, so a screen reader announces it
- [x] The skip link is still available after a chip click, and isn't shown on other pages (F1.7)

## Files to touch

- `components/chips/Chip.tsx`: one chip, an `<a href>` with the command's icon and label. A plain left click asks the command. A modified or middle click follows the link
- `components/chips/ChipRow.tsx`: the row of chips in `order`, each with its stagger delay
- `components/chat/ConversationProvider.tsx`: client provider mounted by `AppShell`. Holds the thread, `ask(command)`, and the `history.pushState` and `popstate` sync
- `components/chat/Message.tsx`: a visitor bubble or a bot answer, styled as F4.2 describes
- `lib/conversation.ts`: pure functions: add a turn, and read a thread back from `history.state` (`unknown` in, validated turns out)
- `components/hero/HomeHero.tsx`: takes the commands, renders the chips and the thread, and pauses the headline once a chip has been used
- `components/shell/AppShell.tsx`: mounts the provider around the shell
- `components/shell/SkipLink.tsx`: stays available after `pushState` changes the pathname while the input is still on screen
- `app/page.tsx`: passes the commands to the hero
- `app/globals.css`: the chip reveal keyframes and the `scripting: enabled` hidden state
- `tests/unit/lib/conversation.test.ts`
- `tests/e2e/chips.spec.ts`

## Out of scope

- The "More" chip and the slash palette: US-025. This story leaves no inert control behind, so the row has no "More" yet
- Sidebar items: US-024. It reads the provider built here
- Free-text sending, `/api/chat`, streaming, the full `Thread`, answer-announced-once rules, Markdown in answers, the pinned input and "New chat" clearing the thread: US-032. It extends `Message` and the provider
- Follow-up chips under an answer: US-030 and US-032
- Changing the headline's cycle or timings: US-020 and US-021. Pausing uses the `paused` prop it already has
- Changing `PillInput` beyond what the layout needs: US-025 and US-032 own it
- Editing `content/commands.json` or the `chip` flags in it

## Tests to add

`tests/unit/lib/conversation.test.ts`:

- `US-023: asking a command adds the visitor message and then its answer`
- `US-023: history state holding known command names becomes a thread`
- `US-023: history state of any other shape gives an empty thread`
- `US-023: a command name that is no longer in commands.json is dropped`

`tests/e2e/chips.spec.ts`:

- `US-023 F2.1: chips are the commands.json entries with chip true, in order`
- `US-023 F2.2: each chip is a link to its page with JavaScript off` (a `describe` with `test.use({ javaScriptEnabled: false })`; also click one and expect the page to load)
- `US-023 F2.3: a click shows the label and the inline answer, and pushes the page URL`
- `US-023 F2.3: Back restores the thread from before the click`
- `US-023 F2.3: a click with a modifier key is not intercepted`
- `US-023 F2.4: chips are centred under the input, outlined and fully rounded, each with an icon`
- `US-023 F2.4: the top-bar CV is the only filled button`
- `US-023 F2.5: chips are staggered by 40 ms`
- `US-023 F2.5: with reduced motion the chips show at once`
- `US-023 F1.4: the headline stops once a chip is clicked`
- `US-023: the answer region is aria-live polite`
- `US-023 F1.7: the skip link is still there after a chip click, and not on /about/`

## Notes

- **What exists.** `HomeHero` is a client component holding `inputFocused` and passing `paused` to `RotatingHeadline`. `PillInput` is a plain input with `id="chat-input"`. `iconFor()` in `components/ui/icons.ts` maps a command's `icon` name to a Lucide icon, falling back to `User`. `loadContent()` already returns commands sorted by `order`, so chips only need a `chip` filter. Commands are strict-validated, and US-022 guarantees every chip has a page `answer`.
- **Where the state lives.** In a provider mounted by `AppShell`, not in `HomeHero`, so US-024's sidebar (outside the hero) and US-032's thread read the same thing. Derive the thread from the current history entry's `history.state` under one key, for example `{ turns: ["/about", "/skills"] }` (command names). Then Back restores it for free, and a link navigation (an entry without `turns`) shows an empty thread. Don't copy state from an effect (CODING § 4); set it in the event handlers that call `pushState` and listen for `popstate`.
- **Use `window.history.pushState`, not `router.push`.** `router.push` would navigate and replace the page. Next 16's router wraps the native method: it syncs the new URL into `usePathname()`, and merges its own keys into the state object you pass. Read only your own key back. Check this in the Back test rather than trusting it.
- **The URL is the command's `answer`** (`/about/`, with the trailing slash, as `trailingSlash: true` expects).
- **D-032 is open.** The default (Caleb hasn't chosen) is the command's `intro` plus a link to the page, labelled with the command's label. Keep that content in one place, so a different choice changes only `Message`'s content. If a command has no `intro`, use its `description`.
- **Click handling.** Intercept only a plain primary-button click with no modifier key. Let Ctrl, Cmd, Shift, Alt and middle clicks through, so "open in new tab" works. The chip is an `<a>`, never a `div` with `onClick` (CODING § 4).
- **Reveal without a flash and without JavaScript (D-033).** Put the hidden state inside `@media (scripting: enabled)`, so it only applies when scripts run. The server HTML is then already hidden for visitors with JavaScript (no flash at hydration), and chips are plain visible links for visitors without. A keyframe with `animation-delay: calc(var(--i) * 40ms)` and `animation-fill-mode: backwards` gives the stagger. Put it under `motion-safe:` (CODING § 5), so reduced motion shows the chips at once. If Playwright's JavaScript-off context doesn't match `scripting: none` in a browser, fall back to a `<noscript>` style rule and say so in the Log.
- **The skip link.** `SkipLink` returns `null` unless `usePathname() === "/"`. After the chip's `pushState` the pathname is `/about/`, but the input is still on screen. It must show whenever the home input is mounted and never on other pages, including after a reload at the pushed URL (the real About page, whose `history.state` still holds `turns`). One way: `HomeHero` records "home is mounted" in a small external store that `SkipLink` reads with `useSyncExternalStore`. Pick one way and say which in the Log.
- **Where the thread goes.** Below the chip row, in the same `max-w-2xl` column. The input is not pinned to the bottom yet (US-032, F4.5).
- **`Message`.** Visitor messages are right-aligned bubbles. Bot answers are left-aligned plain text with the avatar beside the first line (F4.2). The avatar component is `components/shell/Avatar.tsx`.
- **No fixed waits in tests** (CODING § 9). For the headline pause, use `page.clock` the way `tests/e2e/headline.spec.ts` does.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built the chips, `ConversationProvider` (the shared thread, `ask`, `pushState` and `popstate`), `Message`, and the skip-link fix. The thread lives in `history.state` under `turns`, read through zod, and `ConversationProvider` re-reads it on every pathname change, since Next writes its own entries after render. The skip link shows on any page while the home is mounted (`homeMounted`, set by `HomeHero`), not by pathname alone, because a chip click changes the pathname to `/about/` while the input stays on screen. Chip reveal waits for `homeMounted` (D-033). D-032 stays open; the answer is built on its default in `Message`, the one place to change. Added a reload test for F2.3's reload clause, and `data-testid="visitor-message"` on the bubbles (they have no role). Headline pause is D-039. Outside Files to touch: `tests/e2e/shell.spec.ts`, two sidebar lookups scoped to the sidebar (`sidebar.getByRole`), because the chips reuse the ASK ABOUT names and the page-wide lookup matched both; the assertions are unchanged. Two Turbopack tracing warnings in the build come from `lib/content.ts` and the site-icon route, predate this story, and belong to US-067 · this commit · `npm run verify` passed; `npm run test:e2e` passed, 406 tests on chromium, webkit, mobile and no-js
2026-10-14 · Started. D-032 is still open, so the answer content is the recommended default, kept in one place (`Message`). Left D-032 open, since S04 isn't active yet · — · —
2026-10-14 · Started. D-032 is still open, so the answer content is the recommended default, kept in one place (`Message`). Left D-032 open, since S04 isn't active yet · — · —
2026-10-14 · Scoped in US-072. Estimate 3 → 5: the story needs the shared conversation provider, `history.state` handling for Back and the skip-link fix. Added F1.4, F1.7 and the `aria-live` criteria, which the chip click starts. Recorded D-032 (open) and D-033 · — · —
