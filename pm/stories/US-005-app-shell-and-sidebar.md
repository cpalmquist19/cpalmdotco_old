---
id: US-005
title: App shell and sidebar
sprint: S01
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-003]
spec: F0.1–F0.3; AppShell, Sidebar; Repo layout and content model › Content schemas
---

# US-005 · App shell and sidebar

As a **visitor**, I want a sidebar of topics and projects, so that I can see at a glance what I can ask about.

## Acceptance criteria

- [ ] `AppShell` renders a 320 px sidebar (`--sidebar-w`) plus the page canvas, on every page, at 1024 px and wider (F0.1)
- [ ] Sidebar has, top to bottom: identity row (avatar, name, collapse button), "New chat", an "ASK ABOUT" list with Lucide icons, a "PROJECTS" list, and a social row pinned to the bottom (F0.1)
- [ ] Sidebar content comes only from `content/profile.json` and `content/commands.json`, filled with placeholder data (F0.1)
- [ ] Collapse button hides the sidebar to a 64 px icon rail; the state survives a reload in the same tab and resets in a new tab (F0.3)
- [ ] Each ASK ABOUT and PROJECTS item is a link with an `href` to its page (F0.2)
- [ ] Playwright tests cover each criterion above

## Files to touch

- `content/profile.json`, `content/commands.json`: placeholder data in the shapes under **Notes**
- `lib/content.ts`: `getProfile()` and `getCommands()` (commands sorted by `order`). Types come from the JSON with `typeof`, not written by hand
- `components/shell/AppShell.tsx`: server component; loads content and lays out sidebar + canvas
- `components/shell/Sidebar.tsx`: client component; renders the sidebar and owns the collapsed state
- `components/shell/Avatar.tsx`: monogram avatar (initials from `profile.name`)
- `components/ui/icons.ts`: maps icon names used in the JSON to Lucide components
- `app/layout.tsx`: wrap `{children}` in `<AppShell>`
- `app/globals.css`: add `--rail-w: 64px` to the `:root` block
- `tests/e2e/shell.spec.ts`

## Out of scope

- The mobile drawer and anything under 1024 px (US-006). Below 1024 px, just hide the sidebar (`hidden lg:flex`)
- The top bar (US-007)
- Making items ask in the chat, and "Surprise me" (US-024). "New chat" doing anything (US-032)
- Zod validation of the content files (US-011). Real content (US-009, US-012)
- Creating the pages the links point to (S02). The links will 404 for now, which is expected

## Tests to add

All in `tests/e2e/shell.spec.ts`, tagged `@desktop-only`, at the default 1280 px desktop viewport:

- `US-005 F0.1: sidebar is 320 px wide`: bounding box width of the `complementary` landmark (the `<aside>`) is 320
- `US-005 F0.1: sidebar sections appear in order`: avatar, name, collapse button, "New chat", "ASK ABOUT" heading and list, "PROJECTS" heading and list, social links, in that vertical order
- `US-005 F0.1: social row is pinned to the bottom`: the social row's bottom edge is within 32 px of the sidebar's bottom edge
- `US-005 F0.1: ASK ABOUT comes from commands.json`: import the JSON in the test; link names and order match `profile.sidebar.askAbout`
- `US-005 F0.1: PROJECTS comes from profile.json`: link names match `profile.sidebar.projects`
- `US-005 F0.2: every item links to its page`: each ASK ABOUT link's `href` equals its command's `answer`; each project's `href` matches the JSON
- `US-005 F0.3: collapse to a 64 px rail`: click "Collapse sidebar"; width is 64; ASK ABOUT links are still reachable by their accessible names
- `US-005 F0.3: collapsed state survives reload`: collapse, reload, still 64 px
- `US-005 F0.3: new tab starts expanded`: collapse, open a new page in the same context, it's 320 px

## Notes

**Placeholder data.** Real content arrives in S02. Until then every value except the name must be marked as a placeholder (see [docs/CODING.md § 7](../../docs/CODING.md#7-content-and-facts)).

`content/profile.json` (only the fields this story needs; US-011 adds the rest):

```json
{
  "name": "Caleb Palmquist",
  "role": "Placeholder: role",
  "status": "Placeholder: open to work",
  "socials": [
    { "label": "GitHub", "href": "https://example.com/placeholder-github", "icon": "github" },
    { "label": "LinkedIn", "href": "https://example.com/placeholder-linkedin", "icon": "linkedin" }
  ],
  "links": { "cv": "/cv.pdf" },
  "sidebar": {
    "askAbout": ["/about", "/experience", "/projects", "/skills", "/contact"],
    "projects": [
      { "label": "Placeholder project one", "href": "/projects/placeholder-one/" },
      { "label": "Placeholder project two", "href": "/projects/placeholder-two/" }
    ]
  }
}
```

`content/commands.json`: one entry per `/about` … `/contact`, shaped like this:

```json
{ "command": "/about", "label": "About", "description": "Placeholder: who I am", "answer": "/about/", "chip": true, "order": 1, "icon": "user" }
```

Icons for the five placeholder entries: `user`, `briefcase`, `folder`, `wrench`, `mail`.

- `icon` and `sidebar.askAbout` aren't in the spec's schema table, but F0.1 and F2.4 need an icon per item and a defined sidebar order. They are recorded as decision D-009. US-011 and US-022 must include them in the Zod schemas.
- **Icons:** `components/ui/icons.ts` exports `ICONS: Record<string, LucideIcon>` with only the icons the JSON uses, imported one by one (`import { User, Briefcase } from "lucide-react"`). Never `import * as`. Use the `user` icon for an unknown name. Lucide has deprecated its brand icons: if `Github`/`Linkedin` aren't in the installed version, use `Globe` for both and note it in the Log. Don't add another icon package.
- **Accessible names:** the sidebar is an `<aside aria-label="Sidebar">`. Section headings are `<h2>` with the visible text "ASK ABOUT" and "PROJECTS". The collapse button is `<button aria-label="Collapse sidebar" aria-expanded="true">`, which becomes "Expand sidebar" / `false` when collapsed. In the rail, labels are visually hidden (`sr-only`) and each link keeps its accessible name.
- **Rail contents:** avatar, expand button, "New chat" icon and ASK ABOUT icons. PROJECTS and the social row are hidden in the rail. Caleb can adjust this at the S01 gate.
- **Collapsed state:** `sessionStorage` key `sidebar-collapsed`, value `"1"`. Read it in a `useEffect` (in `try/catch`), never during render. A short jump on reload when collapsed is acceptable.
- **Layout:** the sidebar is `sticky top-0 h-dvh` and a flex column; the social row uses `mt-auto`. Colours: `bg-sidebar`, `border-border`, `text-text-muted` for headings.
- "New chat" is a `<button type="button">` with `// TODO(US-032): clear the thread`.
- **The canvas is a `<div>`, not `<main>`.** Each page renders its own `<main>` (the home page already does), and content pages put their `<footer>` after it so it's a `contentinfo` landmark (US-013).

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Note added (US-054): the canvas is a `<div>`, so content pages can own `<main>` and the footer · — · —
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes, placeholder data shapes, rail width, storage key · — · —
