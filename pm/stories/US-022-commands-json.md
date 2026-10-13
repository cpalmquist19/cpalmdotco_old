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

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
