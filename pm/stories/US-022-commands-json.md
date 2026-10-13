---
id: US-022
title: commands.json as the single source
sprint: S04
status: todo
owner: Claude
points: 2
priority: P0
depends_on: [US-011]
spec: Content schemas › commands.json
---

# US-022 · commands.json as the single source

As the **site owner**, I want chips, the palette and the sidebar to read from one file, so that adding a command is one entry.

## Acceptance criteria

- [ ] `content/commands.json` with { command, label, description, answer, chip, order } per entry
- [ ] Validated by the Zod schema from US-011
- [ ] Sidebar, chips and palette all read from it

## Notes

- Per decision D-009, `commands.json` entries also have `icon` (a Lucide icon name), and `profile.json` has `sidebar: { askAbout: string[] (command names), projects: { label, href }[] }`. Include both in the schema. US-005 already uses them with placeholder data.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
