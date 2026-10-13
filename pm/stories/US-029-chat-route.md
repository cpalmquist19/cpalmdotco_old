---
id: US-029
title: System prompt and streaming /api/chat
sprint: S05
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-027, US-028]
spec: Chat backend › API contract, System prompt
---

# US-029 · System prompt and streaming /api/chat

As a **visitor**, I want answers to stream in, so that the chat feels responsive.

## Acceptance criteria

- [ ] `POST /api/chat` accepts `{ messages }` and returns `text/event-stream`
- [ ] Emits `token`, `links`, `followups`, `done` in order, or `error` in place of the answer
- [ ] Sends system prompt + cached knowledge pack + last 6 turns (Grounding 2)
- [ ] System prompt matches the draft, with `offlimits.md` and `knowledge.txt` injected
- [ ] Backend matches decision D-001

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
