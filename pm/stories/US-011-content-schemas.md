---
id: US-011
title: Content schemas and loader
sprint: S02
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-002, US-005, US-007, US-061]
spec: Repo layout and content model › Content schemas; Testing and evals › Unit
---

# US-011 · Content schemas and loader

As the **builder**, I want every content file validated at build time, so that a missing field fails the build instead of shipping a broken page.

## Acceptance criteria

- [ ] Zod schemas for `profile.json`, `experience/*.md`, `projects/*.md`, `skills.json`, `commands.json` with the fields in *Content schemas* (plus the D-009 and D-010 fields, see **Notes**)
- [ ] `lib/content.ts` loads and validates all content, and every getter validates every file, so one bad file fails any page that reads content
- [ ] Removing a required field fails `npm run build` with an error that names the file and the field
- [ ] Cross-file checks: every `sidebar.askAbout` entry is a `command` in `commands.json`; command names are unique; project slugs are unique and each equals its file name
- [ ] `isPlaceholder(file)` is true for a content file marked `placeholder: true` and false otherwise
- [ ] The placeholder `profile.json` and `commands.json` from US-005 pass validation
- [ ] Vitest unit tests cover each criterion above

## Files to touch

- `package.json`, `package-lock.json`: add `zod` and `yaml` as dependencies with `npm install zod yaml` (`.npmrc` has `save-exact=true`). This story names both, so they're allowed
- `lib/content-schemas.ts`: the Zod schemas and their `z.infer` types (`Profile`, `Command`, `Experience`, `Project`, `Skills`)
- `lib/content.ts`: US-005 created it with `getProfile()` and `getCommands()`. Replace the plain JSON imports and `typeof` types with validated loading, and add the rest (see **Notes**)
- `content/profile.json`, `content/commands.json`: add `placeholder: true` and the profile fields US-005 left out (see **Notes**)
- `content/skills.json`: a minimal placeholder file, so the loader can require it (US-012 fills it in)
- `components/shell/*.tsx` (from US-005 to US-007): only those that take their types from the JSON with `typeof`. Switch them to `import type { Profile, Command } from "@/lib/content-schemas"`
- `docs/CODING.md`: one sentence in § 7 about marking `commands.json` entries (see **Notes**)
- `tests/unit/lib/content-schemas.test.ts`, `tests/unit/lib/content.test.ts`
- `tests/unit/helpers/content-fixture.ts`, `tests/unit/fixtures/content/**`: a small valid content folder, and a helper that copies it to a temp folder and lets a test break one thing

## Out of scope

- The content itself: `about.md`, `experience/*.md`, `projects/*.md`, the real `skills.json` and `offlimits.md` (US-012). Until then `content/experience/` and `content/projects/` don't exist, and the loader treats a missing folder as an empty list
- Loading `about.md` and `offlimits.md`. The spec gives them no schema; US-014 and US-031 load them. `isPlaceholder` can still read them
- Rendering Markdown to HTML, and any Markdown package (US-014 onward)
- The pages that show this content (US-014 to US-017) and the knowledge pack (US-028)
- `npm run check:launch` (US-049). This story only exports `isPlaceholder` for it
- Adding commands or changing the sidebar (US-022, US-024)
- Checking that an `icon` name exists in `components/ui/icons.ts`, or that a sidebar project `href` points to a real project (the pages and projects don't exist yet)
- A separate validation script or a hook in `next.config.ts`. The build fails because the pages call the getters

## Tests to add

All Vitest. Each test builds its content with the helper and breaks one thing.

- `tests/unit/lib/content-schemas.test.ts`
  - `US-011: profile accepts the fixture`
  - `US-011: profile rejects a missing <field>`: `it.each` over name, role, greeting, headlinePool, sidebar, socials, status, location, email, links
  - `US-011: profile rejects fewer than 3 headline facts`
  - `US-011: profile.links needs cv, linkedin and github`
  - `US-011: profile rejects an unknown key`
  - `US-011: experience rejects a missing <field>`: `it.each` over title, company, start, end, location, order, tags
  - `US-011: experience end accepts "present" and rejects a value that is neither YYYY-MM nor "present"`
  - `US-011: project rejects a missing <field>`: `it.each` over slug, title, category, dates, pitch, stats, stack
  - `US-011: project repo is optional`
  - `US-011: skills rejects a category with no items`, and `US-011: skills accepts inPractice pairs`
  - `US-011: command rejects a name without a leading slash`, and `US-011: command answer accepts "model"`
  - `US-011: every schema allows placeholder: true`
- `tests/unit/lib/content.test.ts`
  - `US-011: loadContent returns every file from valid content`
  - `US-011: a missing required field throws an error naming the file and the field`
  - `US-011: every problem is reported, one per line`: break two files, both appear in the message
  - `US-011: a missing profile.json fails`
  - `US-011: a missing experience or projects folder loads as an empty list`
  - `US-011: experience body must be a bullet list`: a prose line fails, and so does a body with no bullet
  - `US-011: project body needs the Problem, What I built, Numbers and Stack sections`
  - `US-011: sidebar.askAbout naming an unknown command fails`
  - `US-011: duplicate command names fail`
  - `US-011: duplicate project slugs fail`, and `US-011: a project slug that differs from its file name fails`
  - `US-011: experience and commands come back sorted by order`
  - `US-011: a file with Windows line endings loads`
  - `US-011: isPlaceholder is true for marked JSON and Markdown, false for unmarked, and true when any commands entry is marked`
  - `US-011: the committed content/ folder validates`: calls `loadContent()` on the real folder, so a bad content file fails `npm run verify` before the build

Criterion 3 (the build fails) is covered by the error tests above plus one manual `npm run build` check, recorded in the Log. There's no automated build test, on purpose: a build is too slow for `verify`, and `AppShell` calls `getProfile()` on every page.

## Notes

**Packages.** `zod` is the validator the spec and CODING.md name. `yaml` parses frontmatter: split the file on its first two `---` lines yourself and pass the middle to `yaml`. Don't add `gray-matter` or a Markdown package. See decision D-016.

**Shared types** used in the tables below:

| Type | Rule |
| --- | --- |
| `text` | trimmed, non-empty string |
| `href` | an `http://` or `https://` URL, or a site path starting with `/` |
| `month` | `YYYY-MM`, month `01` to `12` |
| `slug` | lowercase letters, digits and hyphens |

Every schema is strict: an unknown key fails, so a mistyped field name is caught at build time. Every schema also allows an optional `placeholder: boolean` (D-010).

**`profile.json`**

| Field | Type |
| --- | --- |
| `name`, `role`, `greeting`, `status`, `location` | `text` |
| `email` | a valid email address |
| `headlinePool` | array of `text`, at least 3 (F1 shows 3 facts at a time) |
| `socials` | array of `{ label: text, href, icon: text }`, at least 1 |
| `links` | `{ cv: href, linkedin: href, github: href }` |
| `sidebar` | `{ askAbout: string[], projects: { label: text, href }[] }` (D-009). Each `askAbout` entry is a command name such as `/about` |

**`commands.json`**: an array, at least 1 entry, of:

| Field | Type |
| --- | --- |
| `command` | `/` followed by a `slug` |
| `label`, `description` | `text` |
| `answer` | a site path starting with `/`, or the string `"model"` |
| `chip` | boolean |
| `order` | integer, 1 or more |
| `icon` | `text`, a Lucide icon name (D-009) |
| `intro` | optional `text`: the intro paragraph of the command's page (D-018). US-012 writes one for each ASK ABOUT page, and US-013 requires it |

**`skills.json`**: `{ categories: { name: text, items: text[] (at least 1) }[] (at least 1), inPractice?: { tool: text, project: text }[] }`.

**`experience/*.md`** frontmatter: `title`, `company`, `location` are `text`; `start` is `month`; `end` is `month` or the string `"present"`; `order` is an integer, 1 or more; `tags` is an array of `text`. The body is a bullet list: every non-blank line starts with `- ` or `* `, and there is at least one. The loader returns the frontmatter plus `bullets: string[]` (the text after each marker).

**`projects/*.md`** frontmatter: `slug` is a `slug` and equals the file name without `.md`; `title`, `category`, `pitch` are `text`; `dates` is `{ start: month, end: month or "present" }`; `stats` is an array of `{ value: text, label: text }`, at least 1; `stack` is an array of `text`, at least 1; `repo` is an optional `href`. The body has exactly four `## ` sections, `Problem`, `What I built`, `Numbers` and `Stack`, each non-empty, with nothing before the first. The loader returns the frontmatter plus `sections: { problem, built, numbers, stack }`, each the section's raw Markdown, trimmed.

**Loader.**

- `loadContent(dir = CONTENT_DIR)` reads and validates everything and returns `{ profile, commands, skills, experience, projects }`. `CONTENT_DIR` is `content/` under `process.cwd()`. The getters (`getProfile`, `getCommands`, `getSkills`, `getExperience`, `getProjects`) call it and return one part.
- Don't cache. The files are small, and content must refresh in `next dev`.
- Single files are required. A missing `experience/` or `projects/` folder is an empty list.
- Sort `experience` and `commands` by `order`, ascending, and `projects` by file name.
- Read `.md` files with CRLF or LF line endings (this repo is developed on Windows).
- Failures throw `ContentError`, which extends `Error`. Its message is one line per problem: `content/<path>: <field path, or "body">: <message>`, with forward slashes. Collect every problem before throwing, not just the first. Tests match on the file name and field name, not on Zod's wording.
- `isPlaceholder(file: string, dir = CONTENT_DIR): boolean` takes a path relative to the content folder (`"profile.json"`, `"experience/northwind-qa.md"`). It reads the file without validating it, so it also works for `about.md` and `offlimits.md`. JSON object: top-level `placeholder === true`. JSON array (`commands.json`): any entry has it. Markdown: the frontmatter has it. A missing file throws.
- Client components must `import type` from `lib/content-schemas.ts` and never import `lib/content.ts`, which uses `fs`.

**Placeholder data to add.** In `content/profile.json`, keep US-005's fields and add `"placeholder": true`, plus:

```json
"greeting": "Placeholder: Hi, I'm Caleb.",
"headlinePool": ["Placeholder: fact one", "Placeholder: fact two", "Placeholder: fact three"],
"location": "Placeholder: city, country",
"email": "placeholder@example.com",
"links": {
  "cv": "/cv.pdf",
  "linkedin": "https://example.com/placeholder-linkedin",
  "github": "https://example.com/placeholder-github"
}
```

In `content/commands.json`, add `"placeholder": true` to each of the five entries. `content/skills.json`:

```json
{
  "placeholder": true,
  "categories": [{ "name": "Placeholder: category", "items": ["Placeholder: skill"] }]
}
```

**The `placeholder` flag in `commands.json`.** CODING.md § 7 says "top-level JSON field", but `commands.json` is an array (spec). Keep the array and put the flag on each placeholder entry. Add this sentence to § 7: "`commands.json` is an array, so mark each placeholder entry with `"placeholder": true` instead." See decision D-016.

**Fixtures.** `tests/unit/fixtures/content/` holds one valid file of each kind, with fictional names only ("Northwind", "Atlas"). Leave one value unquoted (`start: 2021-03`) to prove YAML keeps it a string. The helper copies the folder with `fs.mkdtempSync` under `os.tmpdir()`, runs the test's change, and the test removes the folder in `afterEach`.

**Checking criterion 3 by hand.** Copy `content/profile.json` outside the repo, delete its `role` field, run `npm run build` and confirm it fails with a message naming `content/profile.json` and `role`. Then copy the file back and check `git diff` shows only your intended change. Don't use `git restore` or `git checkout` for this (see *Never* in AGENTS.md). Record the result in the Log.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Now depends on US-061, which changes `Sidebar.tsx` before the type switch (`board.mjs` shared-file check) · — · —
2026-10-13 · US-054: added the optional `intro` field to commands (D-018); now depends on US-007, so every shell component exists before the type switch · — · —
2026-10-13 · Refined for handoff (US-053): added Files/Out of scope/Tests/Notes and exact field types; now depends on US-005, which creates `lib/content.ts`; added criteria for cross-file checks and `isPlaceholder` · — · —
