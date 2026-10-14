---
id: US-028
title: Knowledge-pack builder
sprint: S05
status: done
owner: Claude
points: 3
priority: P0
depends_on: [US-012]
spec: Chat backend › Grounding
---

# US-028 · Knowledge-pack builder

As the **builder**, I want all content compiled into one tagged knowledge pack, so that the model can only answer from real facts.

## Acceptance criteria

- [x] `lib/knowledge.ts` turns each fact file (`profile`, `about`, `skills`, every `experience/*` and `projects/*`) into one section tagged `[src:<id>]` (Grounding 1, D-035)
- [x] The builder also returns each source's id and the page it maps to, so US-030 can turn a citation into a link without a second table
- [x] The text is deterministic, and holds no `placeholder` flag, icon name, `order` or sidebar data
- [x] Fact text that contains `[src:` can't be read as a section tag or a citation
- [x] `knowledge.txt` is written at build time and served at `/knowledge.txt` as plain text with `X-Robots-Tag: noindex`
- [x] A unit test fails if the pack passes 200,000 characters (about 50k tokens), so the growth the spec warns about is noticed (Grounding 4)

## Files to touch

- `lib/knowledge.ts`: `buildKnowledge(content)` (pure) and `getKnowledge()` (loads the content once and keeps the result)
- `app/knowledge.txt/route.ts`: a static `GET` returning the pack as `text/plain`
- `tests/unit/lib/knowledge.test.ts`
- `tests/e2e/knowledge.spec.ts`

## Out of scope

- The system prompt, `/api/chat` and reading `offlimits.md`: US-029. The pack leaves `offlimits.md` out because the prompt injects it on its own (D-035)
- Stripping citations from answers and mapping them to links: US-030. This story only supplies each source's id and page
- Embedding retrieval, which the spec puts in v2
- Changing `lib/content.ts` or the schemas: US-067 and US-022 touch those. Call `loadContent()` as it is
- Editing content files

## Tests to add

`tests/unit/lib/knowledge.test.ts` (use the fixtures in `tests/unit/fixtures/content` through `tests/unit/helpers/content-fixture.ts`):

- `US-028: each fact file becomes one section tagged [src:<id>]`
- `US-028: ids follow the file path, projects/<slug> and experience/<file>`
- `US-028: each source has an id, a page href ending in a slash, and its text`
- `US-028: the same content gives byte-identical text`
- `US-028: placeholder flags, icon names and order values are not in the text`
- `US-028: commands and offlimits are not sources`
- `US-028: fact text containing [src: is escaped, so only real section tags match the tag pattern`
- `US-028: the real content pack is under 200,000 characters`

`tests/e2e/knowledge.spec.ts`:

- `US-028: /knowledge.txt is plain text, holds a [src:about] section, and is marked noindex`
- `US-028: /knowledge.txt does not redirect`

## Notes

- **Ids.** The file path under `content/` without its extension: `profile`, `about`, `skills`, `experience/<file name>`, `projects/<slug>`. The spec's example is `[src:projects/quark]`, and the eval's `must_cite` uses `about`.
- **Source pages.** `profile` → `/contact/` (email, location, socials and status are shown there), `about` → `/about/`, `skills` → `/skills/`, `experience/*` → `/experience/`, `projects/<slug>` → `/projects/<slug>/`. These are routes, not facts, so they can be constants in `lib/knowledge.ts`.
- **Text format.** One section per source: the tag on its own line, then `Label: value` lines for fields, then the body. JSON and frontmatter fields appear in the schema's order. A project has title, category, dates, pitch, stats, stack, repo, then its four sections. An experience entry has title, company, location, dates, tags, then the bullets. Leave out `placeholder`, `icon`, `order`, `sidebar` and the social `icon`s. Keep `headlinePool` as a "Highlights" list, because those are stated facts.
- **Why a route writes the file (D-035).** The project has no script runner, and the `@/` alias doesn't resolve outside Next. A static route handler (`export const dynamic = "force-static"`) is evaluated at build time and is testable. The URL ends in `.txt`, so `trailingSlash: true` leaves it alone, the way D-026 found for the site icon. The pack is the site's own text, so serving it adds nothing new. Say in the Log that Caleb can ask for it to be removed from the route.
- **`getKnowledge()`** keeps its result for the life of the server instance. `/api/chat` (US-029) calls it, and so does the eval (US-034), so both see the same pack.
- **The size check** uses characters (about four per token), because the spec's 50k-token figure is a guide, not a tokenizer result.
- **Tagged output must not be forgeable.** A fact whose text contains `[src:` would look like a citation to the model and to US-030's parser. The builder should neutralise it, for example by escaping the bracket, and have a test.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Built: `lib/knowledge.ts` (`buildKnowledge`, `getKnowledge`), the static `app/knowledge.txt/route.ts`, 8 unit tests and 2 e2e tests. Choices the story left open: an experience source's id is `experience/<company>-<title>` (slugified, `-2` for a repeat), because a loaded `Experience` has no file name and the story keeps the loader out of scope. Recorded as D-042; Caleb can ask for a `file` field instead. Other choices: a `[src:` in a fact becomes `(src:`; `greeting`, the profile's `icon`s and `placeholder` are left out and `headlinePool` is kept as Highlights; projects are sorted by slug. Caleb can ask for `/knowledge.txt` to be dropped from the route, and the pack still reaches `/api/chat` through `getKnowledge()`. Outside **Files to touch**: `pm/decisions.md` · this commit (with US-024 and US-026) · `npm run verify` passed (150 unit tests). First full `npm run test:e2e`: 491 passed, 1 failed (`[webkit] sidebar-chat.spec.ts` PROJECTS click, URL stayed `/`). It passed 30 of 30 on WebKit alone and 425 of 425 with 10 workers on all projects, so it wasn't reproduced and is tracked as US-079. The pre-push run is the gate for this commit
2026-10-14 · Started, as the third of three stories (US-024, US-026, US-028) built and tested locally before one commit and push · — · —
2026-10-14 · Removed the US-024 edge that US-078 added: this story only names `lib/content.ts` under Out of scope, so it shares no file with US-024 · this commit · —
2026-10-14 · Scoped in US-072. Added the size-guard criterion (Grounding 4) and the source-page map. Recorded D-035 · — · —
