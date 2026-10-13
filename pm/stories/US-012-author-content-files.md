---
id: US-012
title: Author placeholder content files
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-011]
spec: Repo layout › content/
---

# US-012 · Author placeholder content files

As the **builder**, I want complete, realistic placeholder content, so that every page and the chat can be built and tested before Caleb's real content arrives (D-010).

## Acceptance criteria

- [ ] `content/` has realistic placeholder content for an SDET (QA → automation → applied AI): `profile.json`, `about.md`, 3 `experience/*.md`, 4 `projects/*.md`, `skills.json`, `offlimits.md`
- [ ] Every file is marked `placeholder: true` / `"placeholder": true` (see [docs/CODING.md § 7](../../docs/CODING.md#7-content-and-facts))
- [ ] Only fictional companies, projects and people; nothing from Caleb's real history or the spec's examples
- [ ] Concrete numbers (tests written, coverage, runtime saved), so the pages and the chat eval have facts to work with
- [ ] All files pass schema validation

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Reworked for D-010: placeholder SDET content instead of Caleb's inputs; no longer depends on US-009. Real content arrives in US-049 · — · —
