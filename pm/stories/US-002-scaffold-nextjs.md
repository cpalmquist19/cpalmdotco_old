---
id: US-002
title: Scaffold the Next.js project
sprint: S01
status: done
owner: Claude
points: 5
priority: P0
depends_on: [US-001]
spec: Phase 1; Repo layout and content model; Testing and evals › Test suites
---

# US-002 · Scaffold the Next.js project

As the **builder**, I want a Next.js App Router project with the agreed tooling, so that every later story starts from the same base.

## Acceptance criteria

- [x] Next.js (App Router, TypeScript) app runs locally with `npm run dev`. Versions follow decision D-007, pinned exactly in `package.json`; Node version in `.nvmrc` and `engines.node`
- [x] Tailwind v4, ESLint, Prettier, Vitest, Playwright and `lucide-react` installed and configured as in **Notes**
- [x] `package.json` has exactly the scripts listed in **Notes**, and `npm run verify` and `npm run test:e2e` both pass after `npm ci` on a clean checkout
- [x] `tsconfig.json` has `strict: true`, `noUncheckedIndexedAccess: true` and the `@/*` alias pointing at the repo root
- [x] Folder layout matches *Repo layout and content model*: `app/`, `components/`, `content/`, `lib/`, `tests/unit/`, `tests/e2e/`, `public/` (empty folders hold a `.gitkeep`)
- [x] A git pre-push hook runs `npm run verify` and `npm run test:e2e` and refuses the push if either fails; `npm install` turns it on (D-008)
- [x] The create-next-app boilerplate is gone: the home page is a placeholder `<main>` with one `<h1>`, and the template's SVGs and demo styles are deleted

## Files to touch

- `package.json`, `package-lock.json`: dependencies and scripts
- `.nvmrc`, `.npmrc` (`save-exact=true`)
- `.githooks/pre-push`: the push gate (see Notes)
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`
- `vitest.config.ts`, `playwright.config.ts`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (just `@import "tailwindcss";` for now)
- `.gitkeep` in `components/`, `content/`, `lib/`, `public/`
- `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`
- `.gitignore`: add any lines create-next-app needs that are missing. Keep the existing ones

## Out of scope

- Design tokens, fonts and colours (US-003)
- Any UI component or the app shell (US-004 to US-007)
- GitHub Actions (US-008)
- Zod, content files and schemas (US-011)
- `@axe-core/playwright` (US-035)
- Changing `AGENTS.md`, `CLAUDE.md`, `docs/` or `pm/` (except this story file and the generated pm files)

## Tests to add

- `tests/unit/smoke.test.ts`: `US-002: unit test runner works`. Imports something through the `@/` alias, so the alias is tested too
- `tests/e2e/smoke.spec.ts`: `US-002: home page loads with one h1`
- The hook, by hand: add `expect(1).toBe(2)` to the unit smoke test, run `git push origin main`, and confirm it's refused before anything is sent. Remove the line. Note both results in the Log

## Notes

**Scaffolding without overwriting the repo.** `create-next-app` refuses to run in a folder that already has files, and it may generate its own `AGENTS.md`/`CLAUDE.md`. So scaffold into a temporary folder **outside** the repo, then copy the files in:

```
npx create-next-app@latest <temp-folder> --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --skip-install
```

Don't copy its `README.md`, `AGENTS.md`, `CLAUDE.md` or `.gitignore` over ours. Then run `npm install` in the repo.

**Scripts.** Exactly these:

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint . --max-warnings 0` |
| `typecheck` | `tsc --noEmit` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |
| `verify` | `npm run format:check && npm run lint && npm run typecheck && npm test && node pm/scripts/board.mjs --check` |
| `prepare` | `git config core.hooksPath .githooks` |

Use `eslint` directly, not `next lint`, which newer Next.js versions deprecate.

**Pre-push hook (D-008).** Every story is pushed straight to `main`, so this hook is the gate. `.githooks/pre-push`:

```sh
#!/bin/sh
# Refuse the push unless every check passes (decision D-008). Never bypass with --no-verify.
set -e
npm run verify
npm run test:e2e
```

Mark it executable in git (`git update-index --chmod=+x .githooks/pre-push`), so it works on every OS. `npm install` runs `prepare`, which points git at `.githooks/`. That's why the folder has no extra package such as husky.

**Config details**

- `next.config.ts`: `trailingSlash: true`, because every URL in the spec ends in `/` (`/about/`, `/projects/[slug]/`).
- ESLint: the `next/core-web-vitals` and `next/typescript` configs that create-next-app generates. Add `pm/**` and the build output to `ignores`.
- `.prettierignore`: `pm/`, `docs/`, `AGENTS.md`, `CLAUDE.md`, `.next/`, `package-lock.json`. These are hand-written or generated, and reformatting them makes noise.
- Prettier: `{ "printWidth": 100 }`, and defaults for everything else.
- Vitest: `include: ["tests/unit/**/*.test.{ts,tsx}"]`, `environment: "node"`, and `resolve.alias` mapping `@` to the repo root, so the `@/` imports work without an extra package.
- Playwright:
  - `testDir: "tests/e2e"`, `baseURL: "http://localhost:3000"`
  - `webServer: { command: "npm run build && npm run start", url: "http://localhost:3000", reuseExistingServer: !process.env.CI }`
  - Projects, per the spec's Test suites table:
    - `chromium` (`devices["Desktop Chrome"]`, `grepInvert: /@mobile-only/`)
    - `webkit` (`devices["Desktop Safari"]`, `grepInvert: /@mobile-only/`)
    - `mobile` (`devices["Pixel 7"]`, `grepInvert: /@desktop-only/`)
  - Install the browsers with `npx playwright install chromium webkit`.
- Playwright was planned for US-018. It moved here because the S01 stories need it.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done. Scaffolded with create-next-app 16.4.0 in a folder outside the repo and copied in, as in Notes. Pinned exactly (D-007): next 16.4.0, react and react-dom 19.3.0, tailwindcss and @tailwindcss/turbopack 4.3.3, vitest 5.0.4, @playwright/test 1.64.0, prettier 3.9.10, lucide-react 1.56.0, @types/node 24.19.2. eslint 9.39.5 and typescript 5.9.3 stay on the majors the template uses · this commit · `npm run verify` ✔, `npm run test:e2e` ✔ (3 tests: chromium, webkit, mobile), same results on a clean copy after `npm ci`; `npm run dev` served `/` with one h1
2026-10-13 · Differences from the story's file list, all inside **Files to touch**: (1) no `postcss.config.mjs`: Next 16.4's template wires Tailwind v4 through `turbopack.rules` and `@tailwindcss/turbopack` in `next.config.ts`, so I kept that; (2) `agentRules: false` in `next.config.ts`, because otherwise `next dev` writes its own block into our hand-written `AGENTS.md`; (3) `"type": "module"` in `package.json`, because Vitest warned that `vitest.config.ts` was loaded as CommonJS and the story allows no warnings; (4) `.claude/` added to `.prettierignore`, because its hand-written `settings.json` fails `format:check`; (5) `.gitignore` gained `*.pem` and `npm-debug.log*`; (6) scaffolded with `--no-cache-components`, since the template turns Cache Components on by default and the story doesn't ask for it; (7) the template's `app/favicon.ico` isn't copied (boilerplate) and no story covers a favicon yet; (8) the unit smoke test imports `@/package.json`, because there's no `lib/` code yet to import · — · —
2026-10-13 · Pre-push hook tested by hand: with `expect(1).toBe(2)` added to the unit smoke test, `git push origin main` ran `npm run verify`, failed at `npm test` and refused the push (`failed to push some refs`, nothing sent). Line removed afterwards. `npm install` sets `core.hooksPath` to `.githooks` through `prepare` · — · hook refused ✔
2026-10-13 · Known and left alone: (a) this machine runs Node 22.18.0, so `npm install` prints an `EBADENGINE` warning for `engines.node: "24.x"` (D-007); checks still pass, and Vercel will use 24; (b) `npm audit` reports 5 high findings in dev tooling (`braces`, through eslint-config-next's dependencies), and `npm audit fix --force` would downgrade to eslint-config-next 14, so it isn't applied; (c) `board.mjs` warns that US-002 depends on US-001, which isn't `done` yet, as expected · — · —
2026-10-13 · Started. US-001 isn't `done` (last criterion needs this story's push to deploy), but Caleb told Claude to start US-002 anyway · — · —
2026-10-13 · Added the pre-push hook and `prepare` script for D-008 (direct pushes to `main`) · — · —
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes; moved Playwright setup here from US-018; exact scripts and config; points 3 → 5 · — · —
