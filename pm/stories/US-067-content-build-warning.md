---
id: US-067
title: Remove the Turbopack tracing warning from the content loader
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: [US-014, US-016, US-024]
spec: Build and deployment (AGENTS.md: no warnings in checks)
---

# US-067 · Remove the Turbopack tracing warning from the content loader

As the **builder**, I want `npm run build` to finish with no warnings, so that a real warning isn't lost among the ones we accept.

## Acceptance criteria

- [x] `npm run build` prints no Turbopack warnings (checked by hand and recorded in the Log)
- [x] The content loader still reads the same files and returns the same values (existing `lib/content` tests pass)
- [x] `npm run verify` and `npm run test:e2e` pass

## Files to touch

- `lib/content.ts`: mark the two dynamic `readFileSync` calls (`readText` and `isPlaceholder`) so Turbopack stops tracing the whole project. The fix is the `turbopackIgnore` comment the build message names, or a statically scoped path. Pick one and say which in the Log

## Out of scope

- Changing what the loader reads, validates or returns
- Changing the schemas (US-011)
- Any other build warning. If a second one appears, add a story for it

## Tests to add

- No new tests. The existing `tests/unit/lib/content.test.ts` covers criterion 2
- Criterion 1 is checked by hand: run `npm run build` and copy the warning count into the Log

## Notes

**Where the warning comes from.** Since US-011, `lib/content.ts` reads files with a path built at run time (`path.join(dir, file)`). Turbopack can't tell which files that reads, so it traces the whole project into the server bundle. The build message says it can be silenced with `path.join(/*turbopackIgnore: true*/ ...)`.

**Check the cause first.** Run `npm run build` before changing anything and record the exact warning in the Log. If the warning has gone (for example after a Next.js upgrade), close the story with that result.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Fixed: `isPlaceholder` in `lib/content.ts` now reads with `readFileSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dir, file), "utf8")`, the comment form the build message named, so the loader's reads and values are unchanged. Picked it over a statically scoped path because the folder is an argument (tests point it at fixtures). Before: `npm run build` printed "Turbopack build encountered 2 warnings", both `Dynamic filesystem access causes tracing of the whole project` at `lib/content.ts:374`. After: 0 warnings · this commit (with US-029) · `npm run build` prints none; `npm run verify` passed; `npm run test:e2e`: 492 passed
2026-10-14 · Started, as the first of two stories (US-067, US-029) Caleb asked to be built before one commit and push. `main` clean at `8e92015` · — · —
2026-10-14 · Added US-024 to `depends_on` (US-078): it adds a check to `commandProblems` in `lib/content.ts`, which this story also changes. US-024 goes first · c151576 · —
2026-10-13 · Added to backlog. The US-013 build printed "Turbopack build encountered 2 warnings" from `lib/content.ts`, which US-013 doesn't change. Kept out of US-013 because that file belongs to US-011 · — · —
