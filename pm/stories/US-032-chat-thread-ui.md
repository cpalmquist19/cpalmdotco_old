---
id: US-032
title: Chat thread UI
sprint: S05
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-029, US-030]
spec: F4.1–F4.9; Thread, Message, ChatInput
---

# US-032 · Chat thread UI

As a **visitor**, I want a clean chat thread, so that I can have a conversation about Caleb's work.

## Acceptance criteria

- [ ] Non-`/` text goes to `/api/chat` and streams with the caret (F4.1)
- [ ] Visitor bubbles right-aligned; bot answers left-aligned plain text with avatar on the first line (F4.2)
- [ ] Renders headings, lists, links and inline code only; all HTML sanitized (F4.3)
- [ ] Answers end with 1–2 links and 2–3 follow-up chips (F4.4)
- [ ] Input pins to the bottom; Enter sends, Shift+Enter newline; send disabled when empty; auto-grows to 6 lines (F4.5)
- [ ] "New chat" clears the thread and restores the hero without retyping (F4.6)
- [ ] Thread is `aria-live=polite` and announces each answer once when finished (F4.7)
- [ ] Friendly error line with a link to the matching static page (F4.8)
- [ ] 500-character limit with a counter after 400 (F4.9)

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · D-017 decided (US-057): answers render through US-014's shared `Markdown` component with `react-markdown`'s default `urlTransform` kept, so a `javascript:` link in an answer is neutralised. Visitor messages stay plain text · — · —
