---
id: US-019
title: Headline pool and skip link
sprint: S03
status: review
owner: Claude
points: 1
priority: P1
depends_on: [US-012]
spec: F1.7; Phase 3
---

# US-019 · Headline pool and skip link

As a **keyboard visitor**, I want a headline pool of facts, so that the home headline has something to rotate through.

## Acceptance criteria

- [ ] `headlinePool` in `profile.json` filled per decision D-004 and reviewed by Caleb

## Notes

- The skip link (F1.7) moved to US-020, which builds the pill input it targets. Caleb chose this on 2026-10-13.
- D-004 is still `open`. The pool is placeholder content (`placeholder: true`, 10 facts), so the sprint runs on it until Caleb replaces or approves it.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Status to review. Caleb chose to move the skip link to US-020 (it builds the pill input the link targets), so AC2 left this story. AC1 stays open: the pool is placeholder content already in `profile.json` (10 facts, `placeholder: true`; the schema needs at least 3), and D-004 is still open. No code changed here. Caleb's review of the pool is the only step left · — · —
2026-10-13 · Blocked, question for Caleb. (1) The pool: `profile.json` already has 10 placeholder facts, marked `placeholder: true`, and the schema needs at least 3. D-004 is still open, so "reviewed by Caleb" is open too. (2) The skip link: it must be the first Tab stop and move focus to the input, but the sidebar comes first in the DOM (`AppShell.tsx`), and no story builds the home page's pill input before S04 (US-023, US-025, US-032 all refer to it). Options: (A) build a placeholder input here and render the skip link on every page: home targets the input, other pages target `<main>`. That touches `AppShell.tsx`, `app/layout.tsx` and `app/page.tsx`. (B, recommended) move the skip link and its test to US-020, which builds the headline above the input (F1.5 needs it), and close this story once Caleb has reviewed the pool. · — · —
