---
id: S02
name: Content and static pages
status: planned
start:
end:
---

# S02 · Content and static pages

**Goal:** Every static page renders real, validated content and works with JavaScript off.

**Review gate:** You confirm every page looks and reads right with placeholder content (D-010). Accuracy of the real facts is checked in S07 (US-049).

**Decisions needed first:** D-017, the Markdown renderer (see [decisions.md](../decisions.md)). If it's still open when the sprint starts, the recommended default goes ahead

## Stories

This list is generated from the `sprint: S02` field in each story file. To add, remove or move a story, change that field and run `node pm/scripts/board.mjs`. Don't edit between the markers. See [BOARD.md](../BOARD.md) for the whole project.

<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->

| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-010](../stories/US-010-avatar.md) | Headshot or monogram avatar | ⬜ todo · ready | Caleb | P2 | 1 | 0/2 | — |
| [US-011](../stories/US-011-content-schemas.md) | Content schemas and loader | ⬜ todo · ready | Claude | P0 | 3 | 0/7 | ~~US-002~~, ~~US-005~~, ~~US-007~~, ~~US-061~~, ~~US-062~~, ~~US-063~~ |
| [US-012](../stories/US-012-author-content-files.md) | Author placeholder content files | ⬜ todo | Claude | P0 | 3 | 0/5 | US-011 |
| [US-013](../stories/US-013-page-template.md) | Content-page template, footer and Contact page | ⬜ todo | Claude | P0 | 5 | 0/7 | ~~US-005~~, US-011, US-012 |
| [US-014](../stories/US-014-about-contact-cv-pages.md) | About and CV pages | ⬜ todo | Claude | P0 | 3 | 0/7 | US-012, US-013 |
| [US-015](../stories/US-015-experience-page.md) | Experience page | ⬜ todo | Claude | P0 | 3 | 0/5 | US-012, US-013 |
| [US-016](../stories/US-016-projects-and-case-studies.md) | Projects feed and case studies | ⬜ todo | Claude | P0 | 3 | 0/6 | US-012, US-013, US-014, US-015 |
| [US-017](../stories/US-017-skills-page.md) | Skills page | ⬜ todo | Claude | P1 | 2 | 0/4 | US-012, US-013, US-014 |
| [US-018](../stories/US-018-content-pages-e2e.md) | F5 tests and a JavaScript-off project | ⬜ todo | Claude | P0 | 3 | 0/4 | ~~US-007~~, US-014, US-015, US-016, US-017, ~~US-059~~ |
| [US-050](../stories/US-050-site-icon.md) | Site icon (favicon) | ⬜ todo | Claude | P1 | 2 | 0/2 | ~~US-003~~, US-012 |

<!-- END GENERATED STORIES -->

## Gate

- [ ] Preview URL: <!-- link -->
- [ ] Gate passed: You confirm every page looks and reads right with placeholder content.
- [ ] Approved by Caleb on: <!-- YYYY-MM-DD -->

## Review

<!-- At the gate: what shipped, what slipped (and to which sprint), demo notes -->

## Retro

<!-- Keep / change / try next sprint -->
