---
id: US-005
title: App shell and sidebar
sprint: S01
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-003]
spec: F0.1–F0.3; AppShell, Sidebar
---

# US-005 · App shell and sidebar

As a **visitor**, I want a sidebar of topics and projects, so that I can see at a glance what I can ask about.

## Acceptance criteria

- [ ] `AppShell` renders a 320 px sidebar plus canvas grid (F0.1)
- [ ] Sidebar has identity row (avatar, name, collapse button), "New chat", ASK ABOUT list with Lucide icons, PROJECTS list, and social row pinned to the bottom (F0.1)
- [ ] Sidebar content is driven by `profile.json` and `commands.json` (placeholder data is fine until S02/S04) (F0.1)
- [ ] Collapse button hides the sidebar to an icon rail; state persists for the session (F0.3)
- [ ] Each item has an `href` to its page (chat wiring happens in US-024) (F0.2)
- [ ] Playwright tests cover each criterion above

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
