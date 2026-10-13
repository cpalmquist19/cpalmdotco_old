# Decision log

Choices that change what gets built. A `decided` row overrides the spec's default.

## Decisions for Caleb

Every `open` row here shows up on [WAITING-ON-CALEB.md](WAITING-ON-CALEB.md), ordered by the sprint in the **Blocks** column. The recommended default goes ahead if nothing is chosen by the time that sprint starts.

- **To decide:** set **Status** to `decided`, fill **Choice** and **Date**, then run `node pm/scripts/board.mjs`. Note anything that changes in the affected stories.
- **Status** is one of `open`, `decided`, `decided (default)`. **Blocks** must name a sprint (`S01`…`S07`).
- **New choice for Caleb:** add a row here with the next `D-###` id and `open` status.

| ID | Decision | Options | Recommended default | Blocks | Status | Choice | Date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | Chat backend | Next.js API route · FastAPI service | Next.js route for v1; FastAPI as stretch (US-042) | S05 | open | | |
| D-002 | Model provider | Claude API · OpenAI · self-hosted Ollama | Claude API with a small, fast model | S05 | open | | |
| D-003 | Base palette | Warm off-white · cooler gray · your pick | Warm off-white `#f5f4f0`, monochrome, green status dot | S01 | open | | |
| D-004 | Headline pool | Report's drafted pool · your own facts | The report's pool, edited by you | S03 | open | | |
| D-005 | Domain | Your own · host's free subdomain | Your own if you have one; else host subdomain | S07 | open | | |
| D-006 | Hosting | Vercel · Cloudflare Pages | Vercel | S01* | open | | |
| D-007 | Toolchain versions | Node 24 LTS · Node 22 (installed on your machine now) · other; npm · pnpm | npm; Node 24 LTS pinned in `.nvmrc` and `engines`; the latest stable Next.js, React and Tailwind v4 when US-002 starts; exact versions pinned | S01 | open | | |
| D-008 | Rules for merging to `main` | Protected branch (PR + passing CI required) · unprotected | Protect `main`: require a PR and passing CI checks, squash merge, delete branches after merge. You set it in GitHub settings, or tell Claude to set it with `gh` | S01 | open | | |

\* The spec lists hosting as blocking Phase 7, but Phase 1 links a Vercel preview, so it is needed by S01 (see US-001).

## Decisions made during the build

Choices the builder made within a story that Caleb didn't need to approve. Add rows with the next free `D-###` id, the date, the choice and the reason. If Caleb should approve the choice, put it in the table above as `open` instead.

| ID | Date | Decision | Choice | Why | Stories affected |
| --- | --- | --- | --- | --- | --- |
| D-009 | 2026-10-12 | Data for sidebar and chip icons | `commands.json` entries get an `icon` field (Lucide icon name); `profile.json` gets `sidebar.askAbout` (command names, in order) and `sidebar.projects` (`{ label, href }`) | F0.1 and F2.4 need an icon per item and a defined sidebar order, and the spec's schema table has neither | US-005, US-011, US-022 |
