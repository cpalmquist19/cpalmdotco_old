---
id: S05
name: Chat
status: planned
start:
end:
---

# S05 · Chat

**Goal:** Grounded, streaming chat with citations, follow-ups, guardrails and a kill switch.

**Review gate:** You ask it 20 of your own questions and flag anything wrong.

**Decisions needed first:** D-001 Chat backend, D-002 Model provider (see [decisions.md](../decisions.md))

## Stories

This list is generated from the `sprint: S05` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-027](../stories/US-027-api-key-secret.md) | Set the model API key as a hosting secret | ⬜ todo · ready | Caleb | P0 | 1 | 0/3 | — |
| [US-028](../stories/US-028-knowledge-pack.md) | Knowledge-pack builder | ⬜ todo · ready | Claude | P0 | 3 | 0/3 | ~~US-012~~ |
| [US-029](../stories/US-029-chat-route.md) | System prompt and streaming /api/chat | ⬜ todo | Claude | P0 | 5 | 0/5 | US-027, US-028 |
| [US-030](../stories/US-030-citations-and-followups.md) | Citation-to-link mapping and follow-ups | ⬜ todo | Claude | P0 | 3 | 0/4 | US-029, US-022 |
| [US-031](../stories/US-031-guardrails.md) | Guardrails and kill switch | ⬜ todo | Claude | P0 | 3 | 0/5 | US-029 |
| [US-032](../stories/US-032-chat-thread-ui.md) | Chat thread UI | ⬜ todo | Claude | P0 | 5 | 0/9 | US-029, US-030 |
| [US-033](../stories/US-033-chat-tests.md) | Chat contract and F4 tests | ⬜ todo | Claude | P0 | 3 | 0/3 | US-031, US-032 |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: You ask it 20 of your own questions and flag anything wrong.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
