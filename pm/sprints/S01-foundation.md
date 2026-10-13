---
id: S01
name: Foundation
status: planned
start:
end:
---

# S01 · Foundation

**Goal:** A scaffolded app with the shell, both themes and CI, live on a preview URL.

**Review gate:** You approve the shell in both themes on the preview URL.

**Decisions needed first:** D-003 Base palette, D-006 Hosting (needed early for the preview URL) (see [decisions.md](../decisions.md))

## Stories

This list is generated from the `sprint: S01` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-001](../stories/US-001-github-repo-and-vercel.md) | Create the GitHub repo and link Vercel | ⬜ todo · ready | Caleb | P0 | 1 | 3/3 | — |
| [US-002](../stories/US-002-scaffold-nextjs.md) | Scaffold the Next.js project | ✅ done | Claude | P0 | 5 | 7/7 | US-001 |
| [US-003](../stories/US-003-design-tokens-and-fonts.md) | Design tokens and fonts | ✅ done | Claude | P0 | 2 | 5/5 | ~~US-002~~ |
| [US-004](../stories/US-004-theme-toggle.md) | Theme toggle with no-flash script | ⬜ todo · ready | Claude | P0 | 3 | 0/7 | ~~US-003~~ |
| [US-005](../stories/US-005-app-shell-and-sidebar.md) | App shell and sidebar | ⬜ todo · ready | Claude | P0 | 5 | 0/6 | ~~US-003~~ |
| [US-006](../stories/US-006-mobile-drawer.md) | Mobile off-canvas drawer | ⬜ todo | Claude | P1 | 3 | 0/7 | US-005 |
| [US-007](../stories/US-007-top-bar.md) | Top bar: status pill, share, theme, CV | ⬜ todo | Claude | P0 | 3 | 0/7 | US-004, US-005, US-006 |
| [US-008](../stories/US-008-ci-pipeline.md) | CI pipeline: lint, typecheck, unit, e2e | ⬜ todo | Claude | P0 | 3 | 0/5 | US-001, ~~US-002~~ |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: You approve the shell in both themes on the preview URL.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
