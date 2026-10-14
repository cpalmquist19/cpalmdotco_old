---
id: US-029
title: System prompt and streaming /api/chat
sprint: S05
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-027, US-028, US-067]
spec: Chat backend › API contract, System prompt
---

# US-029 · System prompt and streaming /api/chat

As a **visitor**, I want answers to stream in, so that the chat feels responsive.

## Acceptance criteria

- [x] `POST /api/chat` accepts `{ messages }`, checked with Zod, answers a malformed body with 400, and otherwise returns `text/event-stream`
- [x] It streams `token` events as the model's text arrives, then `links`, `followups` and `done`, in that order. `links` and `followups` are empty arrays until US-030 fills them
- [x] A provider failure sends one `error` event (`{ code, fallback }`) in place of `links`, `followups` and `done`, then closes the stream
- [x] Each model request carries the system prompt (with `offlimits.md` and the knowledge pack injected) as a cached block, plus the last 6 messages (Grounding 2, D-036)
- [x] The system prompt matches the spec's draft word for word, with only its two placeholders filled
- [x] The route calls the Claude API with `claude-haiku-5-5`, from a Next.js route handler (D-001, D-002). The key is read only on the server, from `ANTHROPIC_API_KEY`, which is named in `.env.example`

## Files to touch

- `package.json`: add `@anthropic-ai/sdk`, exact-pinned (D-037)
- `package-lock.json`: updated by `npm install`, never by hand
- `app/api/chat/route.ts`: `export const POST = createChatHandler(anthropicProvider)`, with the Node runtime and `dynamic = "force-dynamic"`
- `lib/chat.ts`: `createChatHandler(provider)`: validates the body, takes the last 6 messages, calls the provider, and writes the SSE stream
- `lib/chat-prompt.ts`: the draft system prompt as one template, `buildSystemPrompt({ offLimits, knowledge })`, and `lastMessages(messages)`
- `lib/chat-provider.ts`: the `ChatProvider` type and `anthropicProvider(client)`, which marks the system block cacheable
- `lib/sse.ts`: formats one SSE event
- `lib/content.ts`: `getOffLimits()`, which returns `offlimits.md`'s body
- `.env.example`: the name `ANTHROPIC_API_KEY` with a one-line comment, no value
- `tests/unit/lib/chat.test.ts`
- `tests/unit/lib/chat-prompt.test.ts`
- `tests/unit/lib/chat-provider.test.ts`
- `tests/unit/lib/sse.test.ts`
- `tests/unit/lib/content-offlimits.test.ts`

## Out of scope

- Stripping `[src:…]` from the text, mapping citations to links, and choosing follow-ups: US-030
- The rate limit, the 500-character input cap, the 20 s timeout, logging and `CHAT_ENABLED`: US-031. Until it lands the route isn't safe to deploy
- The chat UI and the browser's SSE reader: US-032
- Playwright contract tests, and how an e2e run swaps in a mock provider: US-033. This story only keeps the provider injectable
- The grounded-answer eval: US-034
- Setting the key as a hosting secret: US-027, which is Caleb's
- A FastAPI port: US-042
- Reading `knowledge.txt` from disk. Use `getKnowledge()` from US-028
- Any real call to the Claude API in a test. `npm run verify` must pass with no key

## Tests to add

`tests/unit/lib/chat.test.ts` (call the handler directly with a fake provider):

- `US-029: a valid body streams token, links, followups and done in order as text/event-stream`
- `US-029: links and followups are empty arrays for now`
- `US-029: a provider failure sends one error event with a code and a fallback page, and no done`
- `US-029: a failure after some tokens sends the error after them and closes the stream`
- `US-029: a body with no messages, an unknown role, or a last message that isn't from the user gets 400`
- `US-029: only the last 6 messages reach the provider`
- `US-029: a closed request aborts the provider call`

`tests/unit/lib/chat-prompt.test.ts`:

- `US-029: the system prompt keeps the draft's rules`
- `US-029: the OFF-LIMITS and KNOWLEDGE placeholders are filled and no braces are left`
- `US-029: lastMessages keeps the last 6 and keeps their order`

`tests/unit/lib/chat-provider.test.ts` (a fake client, never the real SDK call):

- `US-029: the Anthropic provider asks for claude-haiku-5-5 with max_tokens 500`
- `US-029: the system block carries cache_control ephemeral`
- `US-029: a missing API key becomes an upstream failure, not a crash`

`tests/unit/lib/sse.test.ts`:

- `US-029: an event is written as "event:" and "data:" lines ended by a blank line`
- `US-029: the data is JSON on one line`

`tests/unit/lib/content-offlimits.test.ts`:

- `US-029: getOffLimits returns the body without the frontmatter`
- `US-029: getOffLimits fails when offlimits.md is missing or empty`

## Notes

- **Load the `claude-api` skill before writing the SDK code**, and confirm the model id, the streaming call and `cache_control` against it. D-002 says `claude-haiku-5-5`.
- **The prompt is one template**, kept in `lib/chat-prompt.ts` and exported, so the eval (US-034) uses the same text. The two placeholders are `{offlimits.md}` and `{knowledge.txt}`. The spec's draft is under *System prompt (draft)*.
- **Caching.** Put the system prompt, OFF-LIMITS and KNOWLEDGE in one system block with `cache_control: { type: "ephemeral" }`, and the messages after it. A short prefix may be under the provider's minimum cacheable size, so the placeholder pack may not be cached. That isn't an error.
- **SSE frames.** `event: token\ndata: {"t":"…"}\n\n`, and so on, from the spec's table. Headers: `Content-Type: text/event-stream; charset=utf-8` and `Cache-Control: no-cache, no-transform`. Build the body with a `ReadableStream`.
- **An error mid-stream.** Text already sent can't be taken back. Send the `error` event after it, then close. US-032 shows the friendly line.
- **`fallback`.** Use `/about/`, the spec's example, from one constant. US-031 and US-032 refine it per code (F4.8).
- **A message is a turn (D-036).** The last 6 messages. Keep the number in one exported constant. US-031 enforces and tests the cap.
- **`max_tokens` is required by the API.** Set it to 500, the spec's output cap, from one constant. US-031 owns the test and the other limits.
- **The request body is untrusted.** Accept only `user` and `assistant` roles, pass on only `role` and `content`, and never pass a client-supplied `system` message through.
- **Read the key lazily.** Don't read `process.env.ANTHROPIC_API_KEY` at import time. A build with no key must still pass, and a missing key at request time becomes an `upstream` error plus a server log line that never prints the key.
- **Cancel upstream when the visitor goes.** Pass `request.signal` to the provider so a closed tab stops the paid call.
- **`getOffLimits()` and the tracing warning.** It reads a file the way the loader does. US-067 decides how those reads are written, which is why this story depends on it. Follow whatever it settles.
- **Don't put the key in a test, a fixture, a log or `.env.example`'s value.** AGENTS.md "Never".

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built: `POST /api/chat` (`app/api/chat/route.ts`, Node runtime, `force-dynamic`), `lib/chat.ts` (validation, last 6 messages, SSE stream, abort), `lib/chat-prompt.ts` (the draft word for word, one template), `lib/chat-provider.ts` (`anthropicProvider` over `@anthropic-ai/sdk` 0.134.0, exact-pinned; `claude-haiku-5-5`, `max_tokens` 500, cacheable system block), `lib/sse.ts`, `getOffLimits()` in `lib/content.ts`, and the `ANTHROPIC_API_KEY` name in `.env.example` (new file, no value). Choices the story left open are recorded as D-044: thinking off, a refusal reported as `upstream`, one log line per failure. The provider takes a client factory, so the key is read per request and a build needs none. The route is `createChatHandler(anthropicProvider())`, not the story's `createChatHandler(anthropicProvider)`, because the provider is built from a factory. `fallback` is `/about/`, from one constant. 24 new unit tests across the five files, one of which calls the real route with no key and gets one `upstream` error event. Nothing calls the live API, and no key is on this machine, so the first real answer is checked at deploy. Outside **Files to touch**: `pm/decisions.md` · this commit (with US-067) · `npm run verify` passed; `npm run build` clean with no key (`/api/chat` is dynamic); `npm run test:e2e`: 492 passed; `npm run verify`: 174 unit tests
2026-10-14 · Started, as the second of two stories (US-067, US-029) built before one commit and push. US-027 is done on Caleb's word, so the key exists in hosting but not on this machine; every test uses a fake provider · — · —
2026-10-14 · Scoped in US-072. Added US-067 to `depends_on` (both change `lib/content.ts`). Split the work across `lib/chat.ts`, `lib/chat-prompt.ts` and `lib/chat-provider.ts` so the route is testable without a key. Recorded D-036 and D-037 · — · —
2026-10-13 · D-001 and D-002 decided (US-057): a Next.js route, calling the Claude API with Haiku 5.5 (`claude-haiku-5-5`) to start · — · —
