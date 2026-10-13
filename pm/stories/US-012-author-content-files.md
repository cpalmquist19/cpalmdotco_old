---
id: US-012
title: Author placeholder content files
sprint: S02
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-011]
spec: Repo layout › content/; Content schemas; Inputs needed from you › Content
---

# US-012 · Author placeholder content files

As the **builder**, I want complete, realistic placeholder content, so that every page and the chat can be built and tested before Caleb's real content arrives (D-010).

## Acceptance criteria

- [x] `content/` has realistic placeholder content for an SDET (QA → automation → applied AI): `profile.json`, `about.md`, 3 `experience/*.md`, 4 `projects/*.md`, `skills.json`, `offlimits.md`
- [x] Every file is marked `placeholder: true` / `"placeholder": true` (see [docs/CODING.md § 7](../../docs/CODING.md#7-content-and-facts))
- [x] Only fictional companies, projects and people; nothing from Caleb's real history or the spec's examples
- [x] Concrete numbers (tests written, coverage, runtime saved), so the pages and the chat eval have facts to work with
- [x] All files pass schema validation

## Files to touch

- `content/profile.json`: rewrite the values, keeping every key the schema requires
- `content/commands.json`: for the five pages, rewrite `description` (it becomes the page's H1) and add an `intro` (1 to 2 sentences), per D-018. US-013 fails the build without them. Keep `command`, `answer`, `chip`, `order` and `icon` as they are
- `content/about.md`, `content/offlimits.md`
- `content/experience/*.md` (3 files), `content/projects/*.md` (4 files)
- `content/skills.json`: replace US-011's one-line stand-in

## Out of scope

- Any code. If a file won't validate, fix the file, not the schema. If the schema is wrong, stop and ask
- Pages that show the content (US-013 to US-017)
- The headline pool's final wording (US-019, per D-004). Write placeholder facts that pass the schema
- Real content (US-009, US-049)
- `public/cv.pdf` (US-014)

## Tests to add

- No new test files. US-011's `US-011: the committed content/ folder validates` covers criterion 5 on every `npm run verify`
- Criteria 2 and 3 are checked by hand and recorded in the Log (see **Notes**). Not as permanent tests, because both stop being true by design once US-049 swaps in real content
- Criteria 1 and 4 are judgment calls. Caleb checks them at the S02 gate

## Notes

**Fictional names only.** Use Microsoft's stock fictional companies (Contoso, Fabrikam, Northwind Traders, Tailspin Toys, Woodgrove Bank) and invented project names ("Project Atlas"). Never eRSP, Quark or any other name from the spec. Keep `name` as "Caleb Palmquist"; everything else is fiction.

**Links and email stay obvious placeholders,** even though the rest reads realistically: `placeholder@example.com` and `https://example.com/placeholder-…`. A realistic-looking invented link is an invented fact (CODING § 7).

**Shape of each file:**

- `profile.json`: `role` like "Senior SDET". `headlinePool` with 8 to 12 short facts, each under about 60 characters (F1 shows them at 64 px). `sidebar.projects` lists the 4 projects, each `href` being `/projects/<slug>/`, and `sidebar.askAbout` stays as US-005 set it.
- `about.md`: frontmatter `placeholder: true`; 4 to 6 sentences covering support → QA → automation → applied AI, and what's next (the spec's About input).
- `experience/*.md`: one role per file, named `<company>-<role>.md` in kebab case. `order` 1 is the latest role. 3 to 6 bullets each, with numbers. Write bullets as plain text with no Markdown inside: US-015 renders them as text.
- `projects/*.md`: file name = `slug`. 2 to 4 `stats`. Each of the four sections is 1 to 3 short paragraphs or a list. Give at most two of them a `repo` (an `example.com` link). Mix the categories (for example "Test automation", "Applied AI", "Tooling").
- `skills.json`: 4 to 6 categories, and 3 or more `inPractice` pairs whose `project` is the title of one of the 4 projects.
- `offlimits.md`: frontmatter `placeholder: true`; a bullet list of topics the bot declines (the spec's examples: employer internals, salary, personal life).

The numbers should hang together across files: a bullet in an experience file and a stat on a project shouldn't contradict each other. The eval (US-034) asks about them.

**Hand checks for the Log:**

1. Every file is marked: list the files in `content/` that don't contain `placeholder` set to `true` (`git grep --untracked -L -E '"?placeholder"?: true' -- content/`; `--untracked` because the new files aren't committed yet). Expect only `.gitkeep`, if it's still there. In `commands.json`, check each entry has it.
2. No real names: `git grep --untracked -i -E 'eRSP|Quark' -- content/`. Expect no output.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done. Wrote the placeholder SDET content. `profile.json`: 10 headline facts, 4 sidebar projects. `skills.json`: 5 categories, 4 `inPractice` pairs. `commands.json`: an H1 `description` and an `intro` for each ASK ABOUT page. Plus `about.md`, `offlimits.md`, 3 experience files and 4 project files. Numbers match across files: 1,240 API tests and 47 to 9 minutes (Atlas, Tailspin bullet), 3 days to 4 hours (Release Gate), 9% to 1.5% flaky runs (quarantine), 400 tickets and 72% (triage). Choices the story left open: Microsoft's sample company names (Contoso, Fabrikam, Tailspin Toys); project titles match the sidebar labels; `value` and `pitch` are quoted in YAML so `400` stays text; `repo` only on Project Atlas and the triage assistant. Criterion 2 by hand (`git grep --untracked -L -E '"?placeholder"?: true' -- content/`): only `.gitkeep` is unmarked. Criterion 3 by hand (`git grep --untracked -i -E 'eRSP|Quark' -- content/`): no output. Criteria 1 and 4 are judgment calls for the S02 gate. `npm run verify`: pass (format, lint with 0 warnings, typecheck, 90 unit tests including 17 content tests, board check; the US-022 readiness warning was already there). `npm run test:e2e`: 112 passed · this commit · pass
2026-10-13 · Started the build from main (clean tree); status in-progress · — · —
2026-10-13 · Refined for handoff (US-054): added Files/Out of scope/Tests/Notes; file shapes, fictional-name source, which checks are tests and which are by hand · — · —
2026-10-13 · Reworked for D-010: placeholder SDET content instead of Caleb's inputs; no longer depends on US-009. Real content arrives in US-049 · — · —
