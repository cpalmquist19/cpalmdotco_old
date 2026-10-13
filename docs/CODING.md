# Coding standards

Rules for all code in this repo. They are short on purpose: follow them exactly. If a rule seems wrong for your story, don't break it quietly. Stop and ask Caleb (see *Stop and ask* in [AGENTS.md](../AGENTS.md)).

Where a tool can enforce a rule (ESLint, TypeScript, Prettier), the tool is the authority. Never turn a rule off to make a check pass.

## 1. Stack

| Thing | Use | Don't use |
| --- | --- | --- |
| Framework | Next.js App Router, TypeScript | Pages Router, `src/` folder |
| Package manager | `npm` (versions per decision D-007) | yarn, pnpm, bun |
| Styling | Tailwind CSS v4, via the tokens in `app/globals.css` | CSS modules, styled-components, inline `style` (except CSS variables) |
| Icons | `lucide-react` | Other icon sets, inline SVG copied from the web |
| Validation | `zod` (from US-011) | Hand-written type guards for content |
| Unit tests | Vitest | Jest |
| E2E tests | Playwright, `@axe-core/playwright` | Cypress |
| Fonts | `next/font/google` (Geist, Geist Mono) | `<link>` tags to Google Fonts |

**Dependencies.** Install only packages that the spec or your story names. If you think you need another one, stop and ask. Install with exact versions (`.npmrc` has `save-exact=true`), and never edit `package-lock.json` by hand.

## 2. Files and folders

The layout is the one in the spec under *Repo layout and content model*. In short:

| Path | Holds | File names |
| --- | --- | --- |
| `app/` | Routes only: `page.tsx`, `layout.tsx`, `route.ts`, and Next.js special files | Next.js names |
| `components/<area>/` | React components. Areas: `shell`, `hero`, `chat`, `palette`, `chips`, `theme`, `ui` | `PascalCase.tsx`, one component per file, file name = component name |
| `lib/` | Non-React logic: content loading, knowledge pack, rate limit | `kebab-case.ts` |
| `content/` | Facts about Caleb, as JSON and Markdown. No code | As in the spec |
| `tests/unit/` | Vitest tests, mirroring the source path | `<source-name>.test.ts`, e.g. `tests/unit/lib/content.test.ts` |
| `tests/e2e/` | Playwright tests, one file per feature area | `<area>.spec.ts`, e.g. `theme.spec.ts` |
| `public/` | Static files served as-is | lowercase |

- Use the `@/` import alias (`import { AppShell } from "@/components/shell/AppShell"`). No `../../` imports across folders.
- Use named exports. The only default exports are the ones Next.js requires (`page.tsx`, `layout.tsx`, `opengraph-image.tsx`, etc.).
- Don't create barrel files (`index.ts` that re-exports).

## 3. TypeScript

- `strict: true` and `noUncheckedIndexedAccess: true` stay on.
- No `any`. Use `unknown` and narrow it, or a Zod schema.
- No `as` casts, except `as const`. No non-null assertions (`!`). If TypeScript can't tell a value exists, handle the missing case.
- No `@ts-ignore`, `@ts-expect-error` or `// eslint-disable`.
- Use `type`, not `interface`. Use string-literal unions, not `enum`: `type Theme = "light" | "dark"`.
- Name props types `Props` inside the component file: `type Props = { label: string }`.
- Content types come from the Zod schemas with `z.infer`. Don't write the same type twice.

## 4. React and Next.js

- **Server components by default.** Add `"use client"` only to a component that needs state, effects, event handlers or browser APIs. Keep client components small and pass them data from a server parent.
- Pages that show content must be statically generated and must work with JavaScript off (F5.5). Don't fetch content in the browser.
- Don't use `useEffect` to compute values you can compute during render.
- Navigation uses `<Link href>` (renders `<a>`). Actions use `<button type="button">`. Never put `onClick` on a `div` or `span`.
- Read `localStorage`/`sessionStorage` only inside effects or event handlers, never during render (it breaks server rendering), and wrap it in `try/catch`.

## 5. Styling and design tokens

All colours, radii and the sidebar width come from the CSS variables in the spec's *Design tokens and components*. `app/globals.css` maps them into Tailwind with `@theme inline`, so you get these classes:

| Variable | Tailwind name | Example classes |
| --- | --- | --- |
| `--bg` | `bg` | `bg-bg` |
| `--sidebar` | `sidebar` | `bg-sidebar` |
| `--surface` | `surface` | `bg-surface` |
| `--border` | `border` | `border-border` |
| `--text` | `text` | `text-text` |
| `--text-muted` | `text-muted` | `text-text-muted` |
| `--text-faint` | `text-faint` | `text-text-faint` |
| `--cta-bg` / `--cta-text` | `cta-bg` / `cta-text` | `bg-cta-bg text-cta-text` |
| `--ok` | `ok` | `bg-ok` |
| `--radius-pill` / `--radius-box` | `pill` / `box` | `rounded-pill`, `rounded-box` |

- **Never write a colour value** (hex, `rgb()`, Tailwind palette colours like `gray-500` or `bg-black`) in a component. Only the token classes above.
- **Never use Tailwind's `dark:` variant.** Dark mode works by redefining the same variables under `[data-theme="dark"]`, so components never know which theme is on.
- Arbitrary values (`w-[...]`) only for a size the spec gives in pixels, and prefer a variable: `w-[var(--sidebar-w)]`.
- Every animation and transition must stop or become instant under `prefers-reduced-motion: reduce` (use Tailwind's `motion-safe:` / `motion-reduce:`).

## 6. Accessibility

Every page must pass axe with zero serious or critical issues in both themes. To get there:

- Use the right element first (`button`, `a`, `nav`, `main`, `h1`–`h3`, `ul`), and ARIA only when no element fits.
- Every icon-only button has an `aria-label`. Decorative icons get `aria-hidden="true"`.
- Every interactive element works with the keyboard and shows a visible focus ring (`focus-visible:`). Never remove an outline without replacing it.
- No positive `tabIndex`.
- One `<h1>` per page.

## 7. Content and facts

The chat is trusted because it only says what's in `content/`. Keep it that way:

- **Never hard-code a fact about Caleb in a component**: name, job titles, dates, numbers, employers, links, email. Read it from `content/`.
- **Never invent facts**, even as placeholders that look real. Placeholder values must say so: `"Placeholder: role title"`, `"https://example.com/placeholder"`.
- Only Caleb supplies real content (US-009). Don't edit real facts in `content/` unless your story says to.

## 8. Secrets and environment

- Never commit a key, token or `.env` file. Secrets live only in Vercel environment variables.
- A secret is read only in server code. Never prefix a secret with `NEXT_PUBLIC_`.
- When you add an environment variable, add its name (no value) to `.env.example` with a one-line comment.

## 9. Tests

The spec says a feature is done only when every acceptance criterion has a passing test. So:

- **One test per acceptance criterion**, at least. Start the test title with the story id and the spec number when there is one: `test("US-004 F0.5: light is the default when the OS prefers dark", ...)`. That's how a reviewer matches tests to criteria.
- **Find elements the way a user would:** `getByRole`, `getByLabel`, `getByText`. Use `data-testid` only when there is no accessible role or name, and say why in a comment.
- **No fixed waits** (`waitForTimeout`, `setTimeout` in tests). Wait for a state: `await expect(locator).toBeVisible()`.
- **Tests must be deterministic.** Mock time, randomness and network. A test that passes only sometimes counts as failing.
- **Viewport-specific tests use tags, not skips.** Put `@desktop-only` or `@mobile-only` at the end of the title. The Playwright projects filter on them (see US-002). Untagged tests run on every project.
- **Never weaken a test to make it pass.** Don't delete it, skip it (`.skip`, `.only`, `test.fixme`), loosen an assertion, or raise a timeout without a reason. If the test is right and the code can't meet it, set the story to `blocked` and explain why.
- Unit-test pure logic in `lib/`. Use Playwright for anything a visitor sees or does.

## 10. Comments, errors and commits

- Comments explain *why*, not *what*. No commented-out code.
- A `TODO` must name a story: `// TODO(US-024): wire to chat`. If there's no story for it, create one in backlog.
- Never swallow an error with an empty `catch`. Handle it or let it fail loudly. Visitor-facing errors follow F4.8 (a friendly line plus a link to a static page).
- No `console.log` left in committed code.
- Commit messages: `US-###: imperative summary`, e.g. `US-004: Add theme toggle and no-flash script`.

## 11. Formatting and lint

- Prettier formats everything. Don't hand-format, and don't argue with it.
- ESLint runs with `--max-warnings 0`. A warning is a failure.
- `npm run verify` must pass before you set a story to `review`.
