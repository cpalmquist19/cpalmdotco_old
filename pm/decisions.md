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
| D-003 | Base palette | Warm off-white · cooler gray · your pick | Warm off-white `#f5f4f0`, monochrome, green status dot | S01 | decided | Default: warm off-white `#f5f4f0`, monochrome, green status dot | 2026-10-12 |
| D-004 | Headline pool | Report's drafted pool · your own facts | The report's pool, edited by you | S03 | open | | |
| D-005 | Domain | Your own · host's free subdomain | Your own if you have one; else host subdomain | S07 | open | | |
| D-006 | Hosting | Vercel · Cloudflare Pages | Vercel | S01* | decided | Default: Vercel | 2026-10-12 |
| D-007 | Toolchain versions | Node 24 LTS · Node 22 (installed on your machine now) · other; npm · pnpm | npm; Node 24 LTS pinned in `.nvmrc` and `engines`; the latest stable Next.js, React and Tailwind v4 when US-002 starts; exact versions pinned | S01 | decided | Default: npm; Node 24 LTS; latest stable Next.js, React, Tailwind v4 at US-002; exact pins | 2026-10-12 |
| D-008 | Rules for merging to `main` | Protected branch (PR + passing CI required) · unprotected | Protect `main`: require a PR and passing CI checks, squash merge, delete branches after merge. You set it in GitHub settings, or tell Claude to set it with `gh` | S01 | decided | Push straight to `main`, but only when all tests pass. No PRs or branch protection. Applied in US-048 | 2026-10-12 |
| D-010 | Content before Caleb's inputs | Wait for US-009 · build with placeholder content | — (Caleb's own call) | S02 | decided | Build S02 onward with realistic placeholder SDET content; Caleb backfills real content later. Applied in US-048 | 2026-10-12 |

\* The spec lists hosting as blocking Phase 7, but Phase 1 links a Vercel preview, so it is needed by S01 (see US-001).

## Decisions made during the build

Choices the builder made within a story that Caleb didn't need to approve. Add rows with the next free `D-###` id, the date, the choice and the reason. If Caleb should approve the choice, put it in the table above as `open` instead.

| ID | Date | Decision | Choice | Why | Stories affected |
| --- | --- | --- | --- | --- | --- |
| D-009 | 2026-10-12 | Data for sidebar and chip icons | `commands.json` entries get an `icon` field (Lucide icon name); `profile.json` gets `sidebar.askAbout` (command names, in order) and `sidebar.projects` (`{ label, href }`) | F0.1 and F2.4 need an icon per item and a defined sidebar order, and the spec's schema table has neither | US-005, US-011, US-022 |
| D-011 | 2026-10-13 | How Tailwind v4 plugs into the build | `@tailwindcss/turbopack` loader in `next.config.ts`, no `postcss.config.mjs`. Recorded after the fact in US-052; Caleb agreed to keep it | It's what the Next.js 16.4 template ships, and Turbopack builds both locally and on Vercel. It wouldn't work with Next's webpack build or a tool that processes CSS outside Next; `@tailwindcss/postcss` would | US-002 |
| D-012 | 2026-10-13 | Next.js Cache Components | Off (`--no-cache-components`). Recorded after the fact in US-052 | The template turns it on by default, but the spec doesn't ask for it and it changes how pages render and cache. Revisit only with a story | US-002 |
| D-013 | 2026-10-13 | `next dev` writing to AGENTS.md | `agentRules: false` in `next.config.ts`. Recorded after the fact in US-052 | Otherwise `next dev` adds its own block to the hand-written AGENTS.md | US-002 |
| D-014 | 2026-10-13 | Module type of the project | `"type": "module"` in `package.json`. Recorded after the fact in US-052 | Vitest warned that `vitest.config.ts` was loaded as CommonJS, and checks must run without warnings | US-002 |
| D-015 | 2026-10-13 | e2e tests and a server already on port 3000 | `reuseExistingServer: false` in `playwright.config.ts`, replacing the story's `!process.env.CI` | The pre-push hook is the only gate before `main` (D-008). Reusing a running server let it test a dev server or another project instead of a fresh build | US-052 |
| D-016 | 2026-10-13 | How content is loaded and validated | `zod` for the schemas and `yaml` for frontmatter (split on the `---` lines, parse the middle), both exact-pinned. Schemas are strict: an unknown key fails. `commands.json` stays a bare array, so the `placeholder` flag goes on each placeholder entry. A project's `dates` is `{ start, end }` in `YYYY-MM`. US-011 depends on US-005, which creates `lib/content.ts` | `zod` is named in the spec and CODING.md; no frontmatter parser was named, and `yaml` is typed and maintained. Strict schemas catch a mistyped field name at build time. Wrapping `commands.json` in an object would change the spec's "array of" shape and US-005's tests. Two stories were creating `lib/content.ts` | US-005, US-011, US-012, US-022, US-049 |
