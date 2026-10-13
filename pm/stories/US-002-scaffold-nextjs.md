---
id: US-002
title: Scaffold the Next.js project
sprint: S01
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-001]
spec: Phase 1; Repo layout and content model; Testing and evals › Test suites
---

# US-002 · Scaffold the Next.js project

As the **builder**, I want a Next.js App Router project with the agreed tooling, so that every later story starts from the same base.

## Acceptance criteria

- [ ] Next.js (App Router, TypeScript) app runs locally with `npm run dev`. Versions follow decision D-007, pinned exactly in `package.json`; Node version in `.nvmrc` and `engines.node`
- [ ] Tailwind v4, ESLint, Prettier, Vitest, Playwright and `lucide-react` installed and configured as in **Notes**
- [ ] `package.json` has exactly the scripts listed in **Notes**, and `npm run verify` and `npm run test:e2e` both pass after `npm ci` on a clean checkout
- [ ] `tsconfig.json` has `strict: true`, `noUncheckedIndexedAccess: true` and the `@/*` alias pointing at the repo root
- [ ] Folder layout matches *Repo layout and content model*: `app/`, `components/`, `content/`, `lib/`, `tests/unit/`, `tests/e2e/`, `public/` (empty folders hold a `.gitkeep`)
- [ ] A git pre-push hook runs `npm run verify` and `npm run test:e2e` and refuses the push if either fails; `npm install` turns it on (D-008)
- [ ] The create-next-app boilerplate is gone: the home page is a placeholder `<main>` with one `<h1>`, and the template's SVGs and demo styles are deleted

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
2026-10-13 · Added the pre-push hook and `prepare` script for D-008 (direct pushes to `main`) · — · —
2026-10-12 · Refined for handoff (US-046): added Files/Out of scope/Tests/Notes; moved Playwright setup here from US-018; exact scripts and config; points 3 → 5 · — · —
