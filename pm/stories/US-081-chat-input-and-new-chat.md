---
id: US-081
title: Pinned chat input, counter and New chat
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-031, US-032]
spec: F4.5 (pinned, auto-grow), F4.6, F4.9 (counter); ChatInput
---

# US-081 · Pinned chat input, counter and New chat

As a **visitor**, I want the input to stay in reach as the conversation grows, and a way to start over, so that a long chat stays usable.

## Acceptance criteria

- [ ] Once a conversation has started, the input is pinned to the bottom of the screen and stays there as the thread grows. Before that it sits under the headline as it does today (F4.5, D-052)
- [ ] The input grows with its text up to 6 lines and then scrolls inside itself (F4.5)
- [ ] A counter appears after 400 characters and shows how many remain. The input stops at 500 (F4.9)
- [ ] "New chat" clears the thread, stops a streaming answer, and puts the page back to its start, with the input under the headline. The headline shows the same facts it showed, and does not type them again (F4.6)
- [ ] Back after "New chat" returns to the conversation it cleared. "New chat" on a content page loads the home page with an empty thread (F4.6, D-053)
- [ ] The counter is announced politely and the pinned input never covers the last line of the thread (F4.5, F4.9)

## Files to touch

- `components/chat/ChatInput.tsx`: auto-grow, the counter, the pinned state. US-032 builds it, so this story depends on that one
- `components/hero/HomeHero.tsx`: the layout order that lets one input element sit under the headline or at the bottom (see Notes)
- `components/chat/ConversationProvider.tsx`: `reset()`: stop the stream, set an empty thread, `pushState` to `/`
- `components/shell/Sidebar.tsx`: "New chat" calls `reset()` on a plain click while the home page is mounted, and stays a link otherwise. Removes the `TODO(US-081)` comment US-032 retargeted
- `tests/e2e/chat-input.spec.ts`: new
- `tests/unit/lib/chat-limits.test.ts`: new, for the counter helper (see Notes)
- `lib/chat-limits.ts`: `INPUT_COUNTER_FROM` (400) and `remainingChars(length)`

## Out of scope

- Hiding the headline and chips once a conversation starts. D-052 keeps them in place and lets them scroll away; hiding them is Caleb's call at the S05 gate and would be a new story
- Any change to the stream, the turn model or the error lines: US-032
- Whether the pinned input clears the iOS on-screen keyboard: US-041, on a real device
- A button on a content page that starts a chat there (the thread lives on the home page only, D-043)
- Saving a thread, or "share this conversation"
- Axe in both themes on the conversation view: US-035
- `app/globals.css`. `order`, `sticky` and the height cap are Tailwind classes. If a rule can't be written that way, set this story to `blocked` and say so: US-060 also changes that file and isn't ordered against this one

## Tests to add

`tests/unit/lib/chat-limits.test.ts`:

- `US-081: remainingChars is 500 minus the length, and never below 0`
- `US-081: the counter shows from 400 characters and not before`

`tests/e2e/chat-input.spec.ts` (stubs `/api/chat` with US-032's helper; no real model call):

- `US-081 F4.5: before any question the input is under the headline`
- `US-081 F4.5: after a question the input is at the bottom of the screen, and still there after the thread has scrolled`
- `US-081 F4.5: the input keeps focus and its text when it moves to the bottom`
- `US-081 F4.5: the input grows to 6 lines and then scrolls inside itself`
- `US-081 F4.9: no counter at 400 characters, a counter at 401, and the input stops at 500`
- `US-081 F4.9: the counter is a polite live region`
- `US-081 F4.6: New chat clears the thread, returns the input under the headline and the URL to /`
- `US-081 F4.6: New chat leaves the headline on the same facts and doesn't type them again`
- `US-081 F4.6: New chat during a stream stops the answer`
- `US-081 F4.6: Back after New chat returns to the cleared conversation`
- `US-081 F4.6: on a content page New chat loads the home page with no thread`
- `US-081 F4.5: the last message isn't hidden behind the pinned input`

## Notes

- **D-052 is the reading of F4.5 and F4.6 this story builds.** The spec says the input pins to the bottom and that "New chat" brings back the hero. It also says the headline pauses once a conversation starts (F1.4), which only makes sense if it is still there. So the headline and chips stay, above the thread, and scroll away as it grows. The input is one element that moves, not a second input. The other reading (hide the hero, ChatGPT-style) is a layout decision for Caleb at the S05 gate.
- **Move one element, don't remount it.** Give the hero's column `display: flex; flex-direction: column` and set the input's `order` after the thread once the thread has a turn, with `position: sticky; bottom: 0` and a `bg-bg` backing so the thread doesn't show through. The element stays the same, so focus, the caret position, the palette and its state survive. A different DOM position per state would remount it.
- **Don't cover the last line.** A sticky element at the bottom of a scroll container doesn't cover content that ends above it, because it takes its place in the flow. Check it in the test by scrolling to the end and comparing the last message's bottom edge with the input's top.
- **Auto-grow.** Set the height from `scrollHeight` in the `input` handler, capped at 6 line heights, then `overflow-y: auto`. Don't compute it in an effect that copies state (CODING § 4). Reset to one row after a send. Keep the one-line height equal to today's pill (`h-12`) so nothing shifts when a question is sent.
- **Counter.** Plain text, such as "37 left", `aria-live="polite"` and `aria-atomic`, in the same place in both states. Use `remainingChars` and `MAX_INPUT_CHARS` from `lib/chat-limits.ts`, which US-031 created without imports so the page can use it. Hitting 500 doesn't send an error: the input just stops (`maxLength`, which US-032 already set).
- **New chat.** On the home page a plain click (no modifier, same helper as the chips: `isPlainClick`) calls `reset()`: abort the stream, set the thread to `[]`, `history.pushState(historyState([]), "", "/")`, and scroll to the top. It is a push, not a replace, so Back returns to the conversation. Everywhere else it stays the `<Link href="/">` D-027 made, which loads the home page fresh.
- **"Doesn't retype".** `RotatingHeadline` is paused while the thread has a turn and resumes when it is empty, from the state it paused in, so it isn't remounted and nothing replays. If a remount happens anyway, `startCycle` already starts with three finished facts (D-033), so the test still holds. Freeze time with `page.clock` as `headline.spec.ts` does, so the cycle can't change between the two reads.
- **Chips under the pinned input.** Once there are turns, the chips are above the thread, so they can scroll out of view. That's accepted: follow-up chips under each answer are the next steps (F4.4).
- **Not decided here:** how the pinned input behaves under the mobile on-screen keyboard (visual viewport). Record what's seen on a phone in US-041.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Created in US-080, split out of US-032 (F4.5's layout half, F4.6 and F4.9's counter). Recorded D-052 for the layout reading. US-033 now depends on this story · — · —
