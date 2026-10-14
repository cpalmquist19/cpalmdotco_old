---
id: US-031
title: Guardrails and kill switch
sprint: S05
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-029, US-030]
spec: Chat backend › Guardrails; Operations › Kill switch; F4.8
---

# US-031 · Guardrails and kill switch

As the **site owner**, I want hard limits on the chat, so that cost and abuse stay bounded.

## Acceptance criteria

- [x] A client that has made 10 requests in the last minute, or 60 in the last day, gets `429` with a `Retry-After` header and one `error` event `{ code: "rate_limited", fallback }`, and the model isn't called. The limiter is `lib/ratelimit.ts` and keys on the caller's IP (D-045, D-048)
- [x] A `user` message over 500 characters, or an `assistant` message over 2,500, gets `400` and the model isn't called. The 500-token output cap (US-029) is unchanged (D-050)
- [x] The history sent to the model is the last 6 messages and starts with a `user` message, so a long conversation can't produce a request the API rejects (D-036, D-050)
- [x] An answer that hasn't finished after 20 s ends with one `error` event `{ code: "timeout", fallback }`, after any text already sent, and the upstream call is aborted
- [x] Every `error` event's `fallback` is the static page that matches the question, or `/about/` when none does (F4.8)
- [x] One log line per request holds the question, the outcome and the number of cited sources, and never an IP address, header or user agent. A request with no valid citation is logged as `unanswered` (D-051)
- [x] With `CHAT_ENABLED=false` the route answers `503` with one `error` event `{ code: "upstream", fallback }` and never calls the model. Unset, empty or `true` leaves the chat on; any other value turns it off (D-049)

## Files to touch

- `lib/ratelimit.ts`: new. `createRateLimiter({ perMinute, perDay, now })` returning `check(key)`, and `clientKey(headers)` (see Notes). Pure apart from its own map
- `lib/chat-limits.ts`: new. The numbers as named constants, importable by client code: `MAX_INPUT_CHARS` (500), `MAX_ASSISTANT_CHARS` (2,500), `RATE_LIMIT_PER_MINUTE` (10), `RATE_LIMIT_PER_DAY` (60), `ANSWER_TIMEOUT_MS` (20,000). No imports
- `lib/chat-fallback.ts`: new. `fallbackFor(question, commands)`: the matching static page (see Notes). Pure
- `lib/chat-prompt.ts`: `lastMessages` returns the window that starts with a `user` message (see Notes)
- `lib/chat.ts`: the handler's new order of work (see Notes), the timeout, the log line, the kill switch. `FALLBACK_PAGE` stays as the default. `Options` gains `rateLimiter`, `timeoutMs`, `enabled` and `onLog`
- `app/api/chat/route.ts`: pass the shared limiter; `export const maxDuration = 30` (see Notes)
- `.env.example`: `CHAT_ENABLED=` with a one-line comment
- `tests/unit/lib/ratelimit.test.ts`: new
- `tests/unit/lib/chat-fallback.test.ts`: new
- `tests/unit/lib/chat.test.ts`: the handler tests below
- `tests/unit/lib/chat-prompt.test.ts`: the window test below. One US-029 test is updated, see Notes

## Out of scope

- Citation stripping, link and follow-up choice: US-030, which this story builds on (it needs the cited count for the log)
- How the browser shows a rate-limit, timeout or "unavailable" line: US-032
- Playwright tests of the contract and of the kill switch from the page's side (chips, palette and pages still work): US-033. This story proves the route's side with unit tests
- A shared rate-limit store, a firewall rule or any new account or package: D-045 is Caleb's, and the default needs none
- The provider's monthly spend cap: set in the provider console at launch (US-039)
- Per-IP blocking, CAPTCHAs, bot detection
- Reading Vercel's own request logs. This story controls only what the app writes

## Tests to add

`tests/unit/lib/ratelimit.test.ts` (a fake clock passed as `now`):

- `US-031: the eleventh request in a minute is refused and the tenth is allowed`
- `US-031: the minute window slides: a request is allowed again 60 s after the oldest`
- `US-031: the sixty-first request in a day is refused, however slowly they came`
- `US-031: a refused request doesn't extend the window`
- `US-031: retryAfterSeconds is the wait until the oldest counted request leaves the window`
- `US-031: two keys are counted separately`
- `US-031: clientKey takes x-real-ip, then the first x-forwarded-for entry, then one shared key`
- `US-031: the map doesn't grow without bound`

`tests/unit/lib/chat-fallback.test.ts`:

- `US-031: a question naming a page's label gets that page`
- `US-031: the label match ignores case and a plural s`
- `US-031: with two labels in the question, the one that comes last wins`
- `US-031: no label gives /about/`

`tests/unit/lib/chat-prompt.test.ts`:

- `US-031: the window is at most 6 messages and starts with a user message`
- `US-031: a short conversation is sent whole`

`tests/unit/lib/chat.test.ts`:

- `US-031: a rate-limited request gets 429, Retry-After and one rate_limited error, and the provider isn't called`
- `US-031: a user message over 500 characters gets 400 and the provider isn't called`
- `US-031: an assistant message over 2500 characters gets 400`
- `US-031: exactly 500 characters is accepted`
- `US-031: a provider that never answers ends in one timeout error after the time limit, and its signal is aborted`
- `US-031: a timeout after some tokens sends the error after them`
- `US-031: every error event carries the fallback page for the question`
- `US-031: one log line per request, with the question, the outcome and the cited count`
- `US-031: the log has no IP address, even when the request carries one`
- `US-031: an answer with no valid citation is logged as unanswered`
- `US-031: CHAT_ENABLED=false answers 503 with an upstream error and never calls the provider`
- `US-031: CHAT_ENABLED unset, empty or true leaves the chat on, and "no" or "0" turns it off`
- `US-031: the kill switch is read on each request, not when the module loads`

## Notes

- **Order of work in the handler.** Parse and validate the body (`400`), then the kill switch (`503`), then the rate limit (`429`), then the model. The first step comes first so that `fallbackFor` has the question for the two refusals, and so a malformed request costs no rate-limit count.
- **A refusal is still an event stream (D-048).** `429` and `503` carry `Content-Type: text/event-stream` and one `error` event, so the browser reads every chat failure the same way. `400` stays JSON, as in US-029.
- **The history window.** `lastMessages` today takes the last 6. A conversation that alternates and ends on a `user` message gives a window that starts on an `assistant` one, and the Messages API requires the first message to be `user` (documented rule, "Multi-Turn Conversations"; not tried against the live API, since no key is on this machine). The fourth question in a chat would have failed as `upstream`, and no fake-provider test could show it. Drop leading `assistant` messages after taking the last 6, so the window is 5 or 6 long. Update `US-029: lastMessages keeps the last 6 and keeps their order` to the new rule and say so in the Log. It isn't deleted or loosened: its subject, an ordered tail, still holds.
- **Rate limit store (D-045 is open).** Build on the default: counts in a module-level `Map` per server instance, holding timestamps per key, pruned on every call. Counts reset on a cold start and aren't shared between instances, so the real ceiling is looser than 10 a minute. The provider's monthly spend cap is the hard limit. Say this in the Log. If Caleb picks another store before this starts, change only `createRateLimiter`'s storage, which is why `check` is the one entry point.
- **Count only allowed requests.** A refused request is not recorded, or a client hammering the route would stay blocked for ever.
- **Bound the map.** Drop keys whose newest request is older than 24 h on each call, and if more than 10,000 keys remain, drop the oldest-inserted. A test passes a small bound as an option.
- **The key.** `x-real-ip`, else the first entry of `x-forwarded-for`, else one shared `"unknown"` key. The shared key means local runs and the e2e suite share one bucket: a Playwright test that really calls the route more than 10 times a minute will be refused. The handler only applies a limiter when it is given one, and only `route.ts` gives it, so unit tests that call `createChatHandler` directly are never limited. US-033 decides how e2e avoids it.
- **The timeout.** Start a timer when the provider call begins, with `ANSWER_TIMEOUT_MS`, and clear it in `finally`. On expiry set a `timedOut` flag, then abort the upstream call. Keep that flag apart from "the visitor went away" (`request.signal`), which still sends nothing. A fake timer or a tiny `timeoutMs` option makes the test deterministic: no real 20 s wait (CODING § 9).
- **`maxDuration`.** A 20 s answer needs a function that is allowed to run that long. Set `export const maxDuration = 30` in `route.ts`. Confirm at deploy (US-039) that the plan allows it; if the platform cuts the stream first, the browser's rule for a stream that ends with no `done` or `error` (US-032, D-048) covers it.
- **The fallback page (F4.8).** US-029's note said "per code". A page can't depend on the code: a rate limit says nothing about the topic. Choose by question: the first-listed `commands.json` entry whose label is a whole word in the question, ignoring case and a trailing "s", wins; if several match, the one whose word comes last in the question wins (so "what do you know about projects" gives Projects, not About). No match gives `FALLBACK_PAGE`. It is a heuristic and a test pins it. `Options` takes the commands the way US-030's `content` option does.
- **The log line.** `console.info(JSON.stringify({ event: "chat", outcome, question, cited }))`, one per request that reaches the model step or is refused. `outcome` is `answered`, `unanswered` (no valid citation, the "refusal" of the spec's Logging row), `rate_limited`, `timeout`, `upstream` or `disabled`. `question` is the last user message, at most 500 characters. The default `onLog` is `console.info`, and a test passes its own. `disabled` is logged so US-040's error alert can leave it out.
- **Fail closed.** A kill switch that fails open on a typo is worse than none. Only an unset, empty or `true` (any case) value is on. This is why `.env.example` carries `CHAT_ENABLED=` with no value.
- **Read the flag per request**, like the API key, so a test sets it with `vi.stubEnv` and nothing is cached at import.
- **Not logged, not stored:** answers, IPs, headers, the user agent. Vercel's own request logs may record the IP. That is the platform's, and outside this story.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built `lib/ratelimit.ts` (in memory per instance, keys by IP, bounded map), `lib/chat-limits.ts`, `lib/chat-fallback.ts`, and the handler's order: body (400), kill switch (503), rate limit (429), then the model. Timeout, one log line per request, and `CHAT_ENABLED` read per request. Updated US-029 `lastMessages keeps the last 6 and keeps their order` and US-029 `only the last 6 messages reach the provider` to the new window rule (the window drops a leading answer, so 9 alternating messages give 5). Logged the visitor-left case as `abandoned` (D-056). D-045 stays open: built on its default, so counts reset on a cold start and aren't shared between instances, and the provider's monthly cap is the hard ceiling. Added `tests/unit/...` for the limiter, fallback and window. `npm run verify`: 242 unit tests pass; `npm run test:e2e`: 554 passed · this commit · see US-030
2026-10-14 · Scoped in US-080. Estimate 3 → 5: five criteria became seven, because the spec's one-line rows hide a limiter with a bounded store, a request-window fix (an alternating history would have started on an `assistant` message), a per-question fallback and the log's outcome field. Added US-030 to `depends_on` (both change `lib/chat.ts` and its test file, and the log needs the cited count). Recorded D-045 (open, for Caleb) and D-048 to D-051 · — · —
2026-10-14 · Scoped in US-080. Estimate 3 → 5: five criteria became seven, because the spec's one-line rows hide a limiter with a bounded store, a request-window fix (an alternating history would have started on an `assistant` message), a per-question fallback and the log's outcome field. Added US-030 to `depends_on` (both change `lib/chat.ts` and its test file, and the log needs the cited count). Recorded D-045 (open, for Caleb) and D-048 to D-051 · — · —
