---
id: US-033
title: Chat contract and F4 tests
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-031, US-032, US-081]
spec: Testing › Chat contract, End to end; API contract; F4.1–F4.9
---

# US-033 · Chat contract and F4 tests

As the **builder**, I want the chat tested against a mocked provider, so that UI and contract regressions are caught without spending tokens.

## Acceptance criteria

- [ ] Every F4 criterion, F4.1–F4.9, has an e2e test whose title names it. US-032 and US-081 wrote 33. This story audits them against the spec, adds the one that is missing (F4.7's `aria-live`), and puts the audit result in the Log
- [ ] The real `/api/chat` route, the real SDK provider and a real browser are tested together, with a fake model API behind them. A question streams `token` events before the answer is complete, then `links`, `followups` and `done` in that order, and the thread shows the answer without its citation, with its page links and its follow-up chips (API contract, F4.1, F4.4)
- [ ] Through the same route, a model failure and a model rate limit each arrive as one `error` event with a fallback page, and the thread shows the friendly line and the link (API contract, F4.8)
- [ ] Through the same route, a question over 500 characters gets `400`, and the 11th request in a minute from one client gets `429` with `Retry-After` and a `rate_limited` error event (Guardrails)
- [ ] Kill switch: with `CHAT_ENABLED=false` the real `POST` export answers `503` with an `upstream` error event and doesn't count against the rate limit. The browser's view of a `503` is already tested (see Notes)

## Files to touch

- `tests/e2e/chat-contract.spec.ts`: new. The real-route tests below
- `tests/e2e/helpers/fake-anthropic.mjs`: new. A small HTTP server that answers `POST /v1/messages` with a Messages API event stream (see Notes). Plain Node, no packages, so Playwright can start it with `node`
- `playwright.config.ts`: `webServer` becomes an array: the fake model API on port 3101, then the existing app server with `env` set (see Notes)
- `tests/e2e/thread.spec.ts`: one new test, F4.7's `aria-live`. No existing test changes
- `tests/unit/lib/chat.test.ts`: one new test, the kill switch on the real `POST` export. No existing test changes
- `pm/decisions.md`: row D-061 (see Notes)

No app code. If a new test finds a real bug, a small, obvious fix goes in with a Log entry. Anything bigger sets this story to `blocked`.

## Out of scope

- Re-testing what `thread.spec.ts` and `chat-input.spec.ts` already cover. Those tests stub the page's `fetch`, which is the right tool for half-streamed answers and for the UI states, and they stay as they are
- The 20 s timeout through the browser. `chat.test.ts` covers it with a small `timeoutMs`; an e2e run would wait 20 s per project for nothing new
- A second app server with `CHAT_ENABLED=false`, to test the kill switch through a browser. Playwright starts its `webServer` entries together, so it would need its own build step or a launcher script. The stubbed `503` tests plus the route-level unit test give the same coverage. Revisit in US-040 if monitoring wants a live check
- The real model, and answer quality: US-034
- axe and Lighthouse on the conversation view: US-035
- Any change to the stub helper `tests/e2e/helpers/chat-stream.ts`, or to how US-032's tests use it
- A change to `lib/chat.ts`, `lib/chat-provider.ts` or `app/api/chat/route.ts` to add a test hook. See Notes: the SDK already has one

## Tests to add

`tests/e2e/chat-contract.spec.ts` (each test uses its own `x-forwarded-for` value, see Notes):

- `US-033 contract: token events arrive before the answer is complete, then links, followups and done in that order`
- `US-033 F4.1 F4.4: a question through the real route shows the answer without its citation, with its page links and follow-up chips`
- `US-033 F4.8: a model failure arrives as one upstream error event with a fallback page, and the thread shows the line and the link`
- `US-033 F4.8: a model rate limit arrives as one rate_limited error event with a fallback page`
- `US-033 contract: a 501-character question gets 400, and a 500-character one is answered @chromium-only @desktop-only`
- `US-033 contract: the 11th request in a minute gets 429 with Retry-After and a rate_limited error event @chromium-only @desktop-only`

`tests/e2e/thread.spec.ts`:

- `US-033 F4.7: the thread is an aria-live polite region`

`tests/unit/lib/chat.test.ts`:

- `US-033: with CHAT_ENABLED=false the real POST answers 503 with an upstream error event, and 11 such requests are never rate limited`

## Notes

- **The audit, done while scoping.** 21 tests in `thread.spec.ts` and 12 in `chat-input.spec.ts`, against the spec:

  | Criterion | Already tested | Gap, and what fills it |
  | --- | --- | --- |
  | F4.1 | bubble, streaming and caret, POST body, `/` text not sent | The stream through the real route: the real-route tests |
  | F4.2 | right-aligned bubble, left-aligned answer, avatar beside the first line | none |
  | F4.3 | headings, lists, links, inline code; raw HTML and a `javascript:` link do nothing | none |
  | F4.4 | links and chips shown, a chip sends its question with the history | Links and chips as the server builds them: the real-route tests |
  | F4.5 | Enter, Shift+Enter, Send disabled, IME, pinned, grows to 6 lines, keeps focus | none |
  | F4.6 | clears, headline doesn't retype, stops a stream, Back, content page | none |
  | F4.7 | the live region never holds half an answer, and holds the finished one once | The `aria-live="polite"` attribute is never read (only the counter's is): the F4.7 test |
  | F4.8 | each code with its link, 503, HTML 502, stream that just closes, text before an error | The same codes as the server sends them: the two F4.8 real-route tests |
  | F4.9 | stops at 500, counter after 400, polite counter | none |

- **How the e2e run swaps in a mock provider.** The Anthropic SDK reads `ANTHROPIC_BASE_URL` when it builds the client, and `lib/chat-provider.ts` builds it per request. So the app server is started with `ANTHROPIC_BASE_URL=http://localhost:3101` and `ANTHROPIC_API_KEY=test-key`, and the fake on 3101 plays the model API. The route, the provider, the SDK's stream parsing, Next's response handling and the browser are all the real ones. No test branch goes in the app (D-061). Set `CHAT_ENABLED: "true"` in the same `env` so a developer's own value can't change the run. A developer's real key is never used.
- **The fake.** `POST /v1/messages` answers with a `text/event-stream` of Messages API events: `message_start`, `content_block_start`, one or more `content_block_delta` with a `text_delta`, `content_block_stop`, `message_delta` with `stop_reason: "end_turn"`, `message_stop`. It picks the answer from a marker in the last user message, and does nothing else:
  - no marker: two deltas about 200 ms apart, citing the first `[src:<id>]` found in the request's system text (`body.system[0].text`). This keeps the test independent of `content/`, which US-049 replaces. The pause is what makes "tokens arrive before done" mean something: a proxy that buffered would deliver both in one read
  - `[fake:short]`: one delta at once, same citation. For the test that sends 11 requests
  - `[fake:upstream]`: `400` with a JSON error body. The SDK doesn't retry a 4xx
  - `[fake:rate-limited]`: `429` with `x-should-retry: false`, so the SDK doesn't retry and sleep. It maps to `rate_limited`
- **Reading the stream in order.** `APIRequestContext` buffers the whole body, so it can't show tokens arriving first. Run `fetch` in the page, read it with `response.body.getReader()`, and record the event names as they arrive. Assert that the first chunk read holds a `token` event and no `done`, and that the full list of names, de-duplicated by order, is `token… links followups done`.
- **Rate limit keys.** The limiter counts `x-real-ip`, else the first `x-forwarded-for`, else one shared `unknown` key (`clientKey`). The three browser projects run in parallel against one server, so every test sets its own header with `crypto.randomUUID()` (`page.setExtraHTTPHeaders` for page tests, the `headers` option for `request`). The key is any string, not only an IP. Without it the tests would trip each other's 10 a minute. The 11th-request test sends `[fake:short]` for the first 10.
- **Tags.** The two tests that need no browser, 400 and 429, use the `request` fixture and run once: `@chromium-only @desktop-only` leaves Chromium on desktop (D-030 and CODING § 9). The other four use a page and run on all three browser projects, since WebKit and the mobile engine parse the stream too.
- **The kill switch.** `createChatHandler` reads `CHAT_ENABLED` per request and US-031 already tests the handler for the flag, the values and the log. The gap is the `POST` export in `app/api/chat/route.ts`, which wires the handler to the limiter. The one unit test calls it with `vi.stubEnv("CHAT_ENABLED", "false")` 11 times: all 503 and none 429, which proves the switch is checked before the limiter, as `chat.ts` says. It must not need a key or a network, because a disabled request never builds the SDK client. The browser's side, the `503` with an `upstream` line and a fallback link, is `thread.spec.ts`'s "a 503 and an HTML 502 show the upstream line".
- **Hydration and waits.** Every click or key press straight after `page.goto` waits for the input with `waitForHydration` (D-038). No fixed waits (CODING § 9). The 200 ms gap lives in the fake, not in the test.
- **Cost.** `ANTHROPIC_BASE_URL` only reaches `next start` through the config's `env`. A build with it set is harmless. Nothing in CI changes: the workflow already runs `npm run test:e2e` and needs no secret.
- **For US-042.** These tests only know the `/api/chat` contract and the fake model API behind it, so a FastAPI port can be pointed at the same fake and run the same file.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Scoped by US-082: audit of F4.1–F4.9 against the 33 existing e2e tests (one gap, F4.7's `aria-live`), the real-route approach (fake model API behind `ANTHROPIC_BASE_URL`, D-061), files, out of scope, tests and notes. Points stay at 3 · this commit · —
2026-10-14 · Added US-081 to `depends_on` (US-080): F4.5's pinned input, F4.6 and F4.9's counter moved there from US-032, and this story tests F4.1–F4.9. Still not scoped. Two things to settle when it is: how an e2e run swaps in a mock provider for the real route (US-031's limiter counts every caller from one bucket without an IP header, and refuses the 11th request a minute), and whether it re-tests what US-032's `thread.spec.ts` already covers, or audits it as US-026 did · — · —
