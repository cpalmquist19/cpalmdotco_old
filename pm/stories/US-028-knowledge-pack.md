---
id: US-028
title: Knowledge-pack builder
sprint: S05
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-012, US-024]
spec: Chat backend › Grounding
---

# US-028 · Knowledge-pack builder

As the **builder**, I want all content compiled into one tagged knowledge pack, so that the model can only answer from real facts.

## Acceptance criteria

- [ ] `lib/knowledge.ts` turns each fact file (`profile`, `about`, `skills`, every `experience/*` and `projects/*`) into one section tagged `[src:<id>]` (Grounding 1, D-035)
- [ ] The builder also returns each source's id and the page it maps to, so US-030 can turn a citation into a link without a second table
- [ ] The text is deterministic, and holds no `placeholder` flag, icon name, `order` or sidebar data
- [ ] Fact text that contains `[src:` can't be read as a section tag or a citation
- [ ] `knowledge.txt` is written at build time and served at `/knowledge.txt` as plain text with `X-Robots-Tag: noindex`
- [ ] A unit test fails if the pack passes 200,000 characters (about 50k tokens), so the growth the spec warns about is noticed (Grounding 4)

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
2026-10-14 · Added US-024 to `depends_on` (US-078): it adds a check to `commandProblems` in `lib/content.ts`, which this story also changes. US-024 goes first · this commit · —
2026-10-14 · Scoped in US-072. Added the size-guard criterion (Grounding 4) and the source-page map. Recorded D-035 · — · —
