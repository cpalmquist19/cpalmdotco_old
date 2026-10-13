---
id: US-031
title: Guardrails and kill switch
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-029]
spec: Chat backend › Guardrails; Operations › Kill switch
---

# US-031 · Guardrails and kill switch

As the **site owner**, I want hard limits on the chat, so that cost and abuse stay bounded.

## Acceptance criteria

- [ ] Rate limit 10/min and 60/day per IP (`lib/ratelimit.ts`, unit tested)
- [ ] 500-character input cap, last 6 turns, 500-token output cap
- [ ] 20 s timeout → `error` event with fallback page
- [ ] Questions and refusals logged without IP addresses
- [ ] `CHAT_ENABLED=false` disables the model and leaves chips, palette and pages working

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
