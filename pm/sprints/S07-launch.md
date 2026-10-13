---
id: S07
name: Launch
status: planned
start:
end:
---

# S07 · Launch

**Goal:** The site is live on its domain with SEO, monitoring and a cross-device pass.

**Review gate:** You approve launch.

**Decisions needed first:** D-005 Domain (see [decisions.md](../decisions.md))

## Stories

This list is generated from the `sprint: S07` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-009](../stories/US-009-content-inputs.md) | Provide content inputs | ⬜ todo · ready | Caleb | P0 | 3 | 0/7 | — |
| [US-037](../stories/US-037-domain-and-hosting-access.md) | Domain DNS access and OG image approval | ⬜ todo · ready | Caleb | P0 | 1 | 0/3 | — |
| [US-038](../stories/US-038-seo-and-og.md) | SEO, Open Graph and structured data | ⬜ todo | Claude | P0 | 3 | 0/4 | US-016 |
| [US-039](../stories/US-039-production-deploy.md) | Production deploy and smoke test | ⬜ todo | Claude | P0 | 3 | 0/4 | US-037, US-036, US-049 |
| [US-040](../stories/US-040-monitoring.md) | Monitoring and error alert | ⬜ todo | Claude | P1 | 2 | 0/3 | US-039 |
| [US-041](../stories/US-041-cross-device-pass.md) | Final cross-device pass | ⬜ todo | Claude | P0 | 2 | 0/3 | US-039 |
| [US-049](../stories/US-049-replace-placeholder-content.md) | Replace placeholder content with Caleb's real content | ⬜ todo | Claude | P0 | 3 | 0/4 | US-009, US-012, US-034 |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: You approve launch.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
