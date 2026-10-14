---
id: US-032
title: Chat thread UI
sprint: S05
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-023, US-029, US-030, US-031]
spec: F4.1–F4.4, F4.5 (keys), F4.7, F4.8; F1.4; Thread, Message, ChatInput
---

# US-032 · Chat thread UI

As a **visitor**, I want a clean chat thread, so that I can have a conversation about Caleb's work.

## Acceptance criteria

- [x] Text that doesn't start with `/` is sent to `/api/chat`. The visitor's message appears at once as a right-aligned bubble, and the answer streams in with the caret after its last character, which goes when the answer ends (F4.1, F4.2)
- [x] A bot answer is left-aligned plain text with the avatar beside its first line (F4.2)
- [x] An answer renders headings, lists, links and inline code and nothing else, and raw HTML or a `javascript:` link in it does nothing (F4.3, D-017)
- [x] When an answer ends, 1–2 page links and 2–3 follow-up chips appear under it. A follow-up chip sends its question like typed text (F4.4, D-046)
- [x] Enter sends, Shift+Enter inserts a new line, and Send is disabled while the input is empty or an answer is streaming. Enter during IME composition doesn't send (F4.5, the keys)
- [x] The input holds at most 500 characters (`MAX_INPUT_CHARS`), so the server's cap is never hit from the page (F4.9, the limit; the counter is US-081)
- [x] The thread is an `aria-live=polite` region that announces each answer once, after it has finished, and never its half-streamed text (F4.7)
- [x] An error (`rate_limited`, `timeout`, `upstream`), a response that isn't an event stream, and a stream that closes with no `done` or `error` each give one friendly line with a link to the `fallback` page. Text already streamed stays (F4.8, D-048)
- [x] A chip, palette or sidebar ask while an answer is streaming stops that answer and keeps its text so far. Back stops it too and shows the thread of the earlier history entry (D-053)
- [x] The rotating headline stays stopped once a free-text conversation has started (F1.4)
- [x] The slash palette still works in the new input: `/` opens it, Enter or Tab runs the highlighted command (F3)

## Files to touch

- `lib/chat-client.ts`: new. `streamAnswer({ messages, signal, fetchImpl })`, an async generator of typed events that parses the SSE stream and turns every failure into one `error` event (see Notes); `requestMessages(turns, commands, question)` builds the request body. No imports from the content loader or the SDK
- `lib/chat-errors.ts`: new. The friendly line for each code and the "open the page" link text (see Notes). Pure
- `lib/conversation.ts`: a turn is a command name (as today) or an exchange `{ question, answer, links, followups, error? }`. Reading `history.state` accepts both. `messagesFor` returns what the thread renders
- `components/chat/ConversationProvider.tsx`: `send(text)` and `stop()`; the in-flight exchange lives in the store, the finished one is written to the current history entry (see Notes); `ask` stops a running answer first
- `components/chat/ChatInput.tsx`: new. Replaces `PillInput`: a `<textarea>` with the combobox attributes, the palette, Enter and Shift+Enter, and a circular Send button. Keeps `id="chat-input"` and `aria-label="Ask about Caleb"`
- `components/hero/PillInput.tsx`: deleted (`ChatInput` replaces it)
- `components/palette/useCommandPalette.ts`: element types `HTMLInputElement` → `HTMLTextAreaElement`, and Enter falls through to the caller when no command is highlighted
- `components/chat/Thread.tsx`: new. The live region and the in-flight answer (see Notes)
- `components/chat/Message.tsx`: a second form for an exchange's answer (Markdown, links, follow-ups, error line); the command form is unchanged
- `components/chat/FollowupChip.tsx`: new. One outlined `<button>`, the chips' look, no icon
- `components/hero/HomeHero.tsx`: uses `ChatInput` and `Thread`; the headline stays paused while any turn exists
- `components/shell/Sidebar.tsx`: only the `TODO` comment's story id, `US-032` → `US-081` (New chat's clearing moves there)
- `tests/e2e/helpers/chat-stream.ts`: new. Replaces `fetch` for `/api/chat` with a stream the test controls (see Notes)
- `tests/e2e/thread.spec.ts`: new
- `tests/unit/lib/chat-client.test.ts`: new
- `tests/unit/lib/chat-errors.test.ts`: new
- `tests/unit/lib/conversation.test.ts`: the exchange cases below

## Out of scope

- The input pinned to the bottom, growing to 6 lines, the 400-character counter, and "New chat" clearing the thread: US-081 (it depends on this story)
- Any change to the route, the events or the limits: US-029 to US-031
- Contract tests against the real route with a mock provider, and the kill switch from the page's side: US-033
- A `/api/chat` call from a test. Every browser test here stubs the network
- Saving a conversation between visits (not in v1). A reload restores the current history entry's thread, as it does for chips; nothing is stored anywhere else
- Picking a palette option by click or tap (see US-026's Notes). Not a chat feature
- Changing the headline's cycle or timings (US-020, US-021)
- Markdown the shared component doesn't render (tables, images, code blocks, raw HTML): they are not part of F4.3

## Tests to add

`tests/unit/lib/chat-client.test.ts` (a fake `fetchImpl` returning a `Response` over a `ReadableStream`):

- `US-032: events are read when a chunk ends in the middle of a line, and in the middle of a multi-byte character`
- `US-032: token, links, followups and done are yielded in order with their payloads`
- `US-032: an error event is yielded as it came, from a 429 and from a 503 as well as a 200`
- `US-032: a JSON 400, an HTML 502 and a network failure each give one upstream error`
- `US-032: a stream that ends with no done or error gives an upstream error after the tokens`
- `US-032: a link whose href doesn't start with / is dropped`
- `US-032: aborting the signal stops reading and yields nothing more`
- `US-032: the request holds each command turn as label and intro, each exchange as question and answer, and ends with the new question`
- `US-032: an assistant message over 2500 characters is cut to the limit, and an empty answer is left out`

`tests/unit/lib/chat-errors.test.ts`:

- `US-032: each code has a line, and no line names a vendor, a status code or a stack`

`tests/unit/lib/conversation.test.ts`:

- `US-032: a history state with command names and exchanges becomes a thread in order`
- `US-032: an exchange with an unknown field or a missing question is dropped, the others kept`
- `US-032: a history state written before this story, command names only, still reads`
- `US-032: an exchange renders as a visitor message followed by its answer`

`tests/e2e/thread.spec.ts` (every test stubs `/api/chat` through the helper):

- `US-032 F4.1: a typed question appears as a visitor bubble, the answer streams in with the caret, and the caret goes at done`
- `US-032 F4.1: the question is sent in a POST body that ends with it`
- `US-032 F4.1: text starting with / is not sent`
- `US-032 F4.2: the bubble is right-aligned and the answer is left-aligned with the avatar beside its first line`
- `US-032 F4.3: headings, lists, links and inline code render, and raw HTML and a javascript: link do nothing`
- `US-032 F4.4: the answer ends with its links and follow-up chips, and a chip sends its question`
- `US-032 F4.5: Enter sends and Shift+Enter inserts a new line`
- `US-032 F4.5: Send is disabled while empty and while an answer streams`
- `US-032 F4.9: the input stops at 500 characters`
- `US-032 F4.7: the live region never holds half an answer, and holds the finished one once`
- `US-032 F4.8: rate_limited, timeout and upstream each show their line and a link to the fallback page`
- `US-032 F4.8: a 503 and an HTML 502 show the upstream line, and a stream that just closes does too`
- `US-032 F4.8: text streamed before an error stays above its error line`
- `US-032 D-053: a chip click during a stream stops it and keeps the text so far`
- `US-032 D-053: Back after a chip click restores the earlier thread, answer included`
- `US-032 F1.4: the headline stops once a question has been sent`
- `US-032 F3: with the new input, / opens the palette and Enter runs a command rather than sending`

## Notes

- **A textarea carrying `role="combobox"`.** Shift+Enter needs a `<textarea>`, and F3.4 needs the combobox role and `aria-expanded`. Axe 4.14 reports this pairing only as `aria-allowed-role` at **minor** impact (checked against axe-core in `node_modules` on a page with a listbox; no serious or critical result), so US-035's "no serious or critical" bar holds. If a later axe rule disagrees, it is a US-035 finding, not a reason to give up the newline.
- **The turn model (D-053).** `turns` stays an array of command-name strings, and a free-text exchange is an object in the same array. That keeps the shape US-023 wrote and its tests unchanged, and keeps one list in order, which Back needs: a chip click after a question pushes `turns: [exchange, "/about"]`. While an answer streams it lives only in the store. When it ends (or is stopped, or fails) write it into the **current** entry with `history.replaceState`, merging with the keys Next keeps there rather than replacing them. Check with the Back test that Next's own state survives.
- **One request at a time.** `send` is ignored while an answer is streaming (Send is disabled too). `ask` (chip, palette, sidebar) and a `popstate` first stop the running answer: abort the fetch, keep the text so far with no links or follow-ups, no error line. A stopped exchange is kept as it stands.
- **What the request carries.** Every turn in the thread, then the new question. A command turn is `{user: label}` and `{assistant: intro ?? description}`, so the model knows what the visitor has seen. An exchange is `{user: question}` and, when its answer has text, `{assistant: answer}`. The server keeps the last 6 and drops a leading assistant message (US-031), so the client doesn't count. Cut an assistant text to `MAX_ASSISTANT_CHARS`, so a long answer can't make the next request a `400`.
- **Reading the response (D-048).** Don't branch on `response.ok`. If the `Content-Type` is `text/event-stream`, read the body as events whatever the status (`429` and `503` carry one `error` event). Any other response, or a failed `fetch`, is one `upstream` error with the default fallback. If the stream ends without `done` or `error` (the platform cut the function), yield an `upstream` error after the tokens. Validate each event with Zod, and drop a link whose `href` doesn't start with `/`: the server only builds site paths, so anything else is wrong and must never become an `<a href>`.
- **The error line.** Friendly, one sentence, no vendor, status code or stack. A code's line, then a link to the `fallback` page, labelled with that page's `commands.json` label (the thread has the commands), or its path when none matches. Wording is the builder's within those rules; `lib/chat-errors.ts` holds it so it can be tested and changed in one place.
- **The live region (F4.7).** Today `HomeHero` has one `aria-live="polite"` div that holds every message. Keep a region that exists from first render (a live region must exist before its content changes). Put only finished turns in it. Render the in-flight answer beside it, outside the region, and hide it from assistive technology while it streams. When it ends, add the finished answer to the region once. A screen reader then hears the answer once, whole. The test reads the region's text during the stream (no partial text) and after it (the full text once).
- **Markdown.** Use `components/ui/Markdown.tsx` as it is (D-017). The model's answer is already stripped of citations by the server. Don't add a plugin and don't use `dangerouslySetInnerHTML`. Visitor text stays plain text.
- **Streaming and the caret.** `components/ui/Caret.tsx` is the shared caret and its comment already says the chat will use it. Show it after the last streamed character while the answer streams, and remove it at `done`, on an error and when the answer is stopped. It already stops blinking under reduced motion; it still shows. An answer with no text yet shows only the caret.
- **The stub for browser tests.** `helpers/chat-stream.ts` installs, with `page.addInitScript` before `goto`, a `fetch` wrapper that passes everything except `/api/chat` through. For `/api/chat` it returns `new Response(readableStream, { status, headers })` and exposes `send(event, data)`, `close()` and `fail(status, body)` on `window`, so a test can push a token, look at the page, then push the rest. `page.route(...).fulfill` can't be used: it delivers the whole body at once, so a half-streamed answer can't be seen. Wait for hydration before the first click (`waitForHydration`, D-038), and use no fixed waits (CODING § 9).
- **IME.** `event.nativeEvent.isComposing` means Enter confirms a composition and must not send. There is no stable way to drive an IME from Playwright, so this is built to the note and has no test of its own. Say so in the Log.
- **The skip link and the input id.** The skip link (F1.7) targets `#chat-input`. Keep that id and its accessible name, because US-023 to US-026's tests find the input by them.
- **Where the thread sits.** Below the chips, as now. US-081 moves the input and the layout.
- **Existing tests.** Every US-023 to US-026 test must pass unchanged. `getByRole("combobox")` still finds the input.
- **No `TODO` without a story** (CODING § 10): the Sidebar one is retargeted, not removed.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built the thread: `lib/chat-client.ts` (SSE reader, request body, Zod-checked events; a link not starting with `/` is dropped), `lib/chat-errors.ts`, exchanges as turns in `lib/conversation.ts`, the store in `ConversationProvider` (send, stop, commit into history, discard on Back), `ChatInput` (replaces `PillInput`, now deleted), `Thread`, `Message`, `FollowupChip`. The Send button is outlined, because the CV button must stay the only filled control (US-023 F2.4). Retargeted the Sidebar TODO to US-081. The caret sits after the rendered Markdown block, so while streaming it can sit on its own line after a paragraph. Added D-055 and D-058. Added a `data-testid="in-flight"` wrapper (no role or name, and the caret is shared with the headline). The IME criterion has a test that dispatches a keydown with `isComposing` set, since a real IME can't be driven from Playwright. Back during a stream is handled in the same sync as the pathname change, because Next's popstate handling can stop the event before this app's listener. Tests: `npm run verify`: 242 unit tests pass; `npm run test:e2e`: 554 passed (thread.spec: 62 across three projects) · this commit · see US-030
2026-10-14 · Scoped in US-080. The ten criteria became eleven and the layout half of F4.5, F4.6 and the counter of F4.9 moved to new story US-081: one story held a textarea and combobox conflict, a streaming and announce-once design, a new turn model and a layout change, which is more than the 5 points it was estimated at. Added US-023 (done) and US-031 to `depends_on` as US-072 asked, and US-031 so the client is built against the statuses the route really sends. Recorded D-053. The 2026-10-13 F1.4 criterion stays here, and D-039 still sets when the headline pauses · — · —
2026-10-13 · Added the F1.4 criterion for the headline pausing once a conversation starts, moved from US-020 (which builds the headline before this story builds the chat). Also replaces US-020's plain `#chat-input` with `ChatInput` · — · —
2026-10-13 · D-017 decided (US-057): answers render through US-014's shared `Markdown` component with `react-markdown`'s default `urlTransform` kept, so a `javascript:` link in an answer is neutralised. Visitor messages stay plain text · — · —
2026-10-14 · Scoped in US-080. The ten criteria became eleven and the layout half of F4.5, F4.6 and the counter of F4.9 moved to new story US-081: one story held a textarea and combobox conflict, a streaming and announce-once design, a new turn model and a layout change, which is more than the 5 points it was estimated at. Added US-023 (done) and US-031 to `depends_on` as US-072 asked, and US-031 so the client is built against the statuses the route really sends. Recorded D-053. The 2026-10-13 F1.4 criterion stays here, and D-039 still sets when the headline pauses · — · —
2026-10-13 · Added the F1.4 criterion for the headline pausing once a conversation starts, moved from US-020 (which builds the headline before this story builds the chat). Also replaces US-020's plain `#chat-input` with `ChatInput` · — · —
2026-10-13 · D-017 decided (US-057): answers render through US-014's shared `Markdown` component with `react-markdown`'s default `urlTransform` kept, so a `javascript:` link in an answer is neutralised. Visitor messages stay plain text · — · —
