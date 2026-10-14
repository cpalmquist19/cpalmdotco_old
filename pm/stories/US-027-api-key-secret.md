---
id: US-027
title: Set the model API key as a hosting secret
sprint: S05
status: done
owner: Caleb
points: 1
priority: P0
depends_on: []
spec: Inputs needed from you › Accounts; Guardrails › Secrets, Spend cap
---

# US-027 · Set the model API key as a hosting secret

As the **site owner**, I want the API key stored only in hosting env vars, so that it never leaks into the client or repo.

## Acceptance criteria

- [x] Provider chosen per decision D-002
- [x] Key set as a hosting environment variable (never pasted into chat or committed)
- [x] Monthly spend cap set in the provider console

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Caleb said in chat that the key and the spend cap are set, and that no key was pasted anywhere. Claude can't see the hosting settings, so the three criteria are ticked on his word. Variable name `ANTHROPIC_API_KEY`, Production and Preview · this commit · —
