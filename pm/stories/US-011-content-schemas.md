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

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
