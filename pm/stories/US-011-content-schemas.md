---
id: US-011
title: Content schemas and loader
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-002]
spec: Content schemas; Testing › Unit
---

# US-011 · Content schemas and loader

As the **builder**, I want every content file validated at build time, so that a missing field fails the build instead of shipping a broken page.

## Acceptance criteria

- [ ] Zod schemas for `profile.json`, `experience/*.md`, `projects/*.md`, `skills.json`, `commands.json` with the fields in *Content schemas*
- [ ] `lib/content.ts` loads and validates all content
- [ ] Removing a required field fails `npm run build` with a readable error
- [ ] Vitest unit tests cover the schemas

## Notes

- Per decision D-009, `commands.json` entries also have `icon` (a Lucide icon name), and `profile.json` has `sidebar: { askAbout: string[] (command names), projects: { label, href }[] }`. Include both in the schema. US-005 already uses them with placeholder data.
- Per decision D-010, every content file may carry an optional `placeholder` boolean (frontmatter or top-level JSON field). Allow it in every schema, and export `isPlaceholder(file)` from `lib/content.ts` for the launch check in US-049.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
