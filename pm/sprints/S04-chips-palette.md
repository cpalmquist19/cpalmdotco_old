---
id: S04
name: Chips and slash palette
status: planned
start:
end:
---

# S04 · Chips and slash palette

**Goal:** Chips, the sidebar and the `/` palette all run from `commands.json` and answer inline.

**Review gate:** You try every chip and command on desktop and phone.

**Decisions needed first:** none (see [decisions.md](../decisions.md))

## Stories

This list is generated from the `sprint: S04` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-022](../stories/US-022-commands-json.md) | commands.json as the single source | ✅ done | Claude | P0 | 1 | 3/3 | ~~US-011~~ |
| [US-023](../stories/US-023-chip-row.md) | Link-first suggested chips | ⬜ todo · ready | Claude | P0 | 5 | 0/9 | ~~US-022~~, ~~US-020~~ |
| [US-024](../stories/US-024-sidebar-wiring.md) | Wire sidebar items and "Surprise me" | ⬜ todo | Claude | P1 | 2 | 0/2 | ~~US-022~~, US-023 |
| [US-025](../stories/US-025-command-palette.md) | Slash command palette | ⬜ todo | Claude | P0 | 5 | 0/6 | ~~US-022~~, US-023 |
| [US-026](../stories/US-026-chips-palette-e2e.md) | F2 and F3 tests | ⬜ todo | Claude | P0 | 3 | 0/3 | US-023, US-024, US-025 |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: You try every chip and command on desktop and phone.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
