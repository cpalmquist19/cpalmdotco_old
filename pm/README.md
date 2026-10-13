# Project management

Sprints, user stories, and their status for the chat-first portfolio. Everything is plain Markdown in the repo, so plans change in the same PRs as the code. The source of truth for *what* to build is [docs/Chat-First Portfolio — Build Spec.md](../docs/Chat-First%20Portfolio%20—%20Build%20Spec.md). This folder tracks *when* and *how far along* it is.

```
pm/
  README.md          how the system works (this file)
  BOARD.md           generated status board; never edit by hand
  decisions.md       open and settled decisions (D-###)
  sprints/           one file per sprint (S##): goal, generated story list, gate, review, retro
  stories/           one file per user story (US-###): story, acceptance criteria, log
  templates/         copy these to add a sprint or story
  scripts/board.mjs  rebuilds BOARD.md and each sprint's story list, and validates every file
```

## Mapping to the spec

| Spec | Here |
| --- | --- |
| Phase 1–7 | Sprints `S01`–`S07` |
| Phase review gate | The **Gate** section of each sprint file |
| Feature criteria F0.1–F5.6 | Acceptance criteria in stories, tagged with the spec number, e.g. `(F4.3)` |
| *Inputs needed from you* | Stories owned by `Caleb` |
| *Decisions to make before Phase 1* | [decisions.md](decisions.md) |
| Stretch · FastAPI | Stories with `sprint: backlog` |

## Stories

Each story lives in `stories/US-###-short-slug.md`. All its status lives in its frontmatter:

| Field | Values |
| --- | --- |
| `id` | `US-###`; must match the filename. Never reuse an id |
| `sprint` | `S01`…`S07`, or `backlog` |
| `status` | `todo` → `in-progress` → `review` → `done`; or `blocked`, `cancelled` |
| `owner` | `Claude` (builds it) or `Caleb` (provides an input or approves) |
| `points` | Relative size: 1, 2, 3, 5, 8. Split anything bigger than 5 |
| `priority` | `P0` must ship in the sprint · `P1` should · `P2` could · `P3` stretch |
| `depends_on` | `[US-001, US-002]`: stories that must be `done` first |
| `spec` | The spec section(s) this implements |

**Statuses**

- `todo`: planned, not started. The board marks it **ready** once every dependency is done.
- `in-progress`: being built on a branch.
- `review`: PR open, or waiting for Caleb to check it on the preview URL.
- `blocked`: can't move. Say why in the story's Log.
- `done`: merged, every acceptance criterion ticked, and its tests pass in CI.
- `cancelled`: dropped. Keep the file and note why in the Log.

**Definition of done:** every acceptance criterion is checked, each one has a passing automated test where the spec calls for one, CI is green, and the PR is merged to `main`.

## Workflow

1. **Plan the sprint.** Set the sprint file's `status: active` and `start:` date. Confirm the decisions it needs in [decisions.md](decisions.md).
2. **Pick work** from *Next up* on [BOARD.md](BOARD.md). Set the story to `in-progress`.
3. **Build it.** Tick acceptance criteria as they pass. Add dated entries to the story's **Log** (PR links, test results, scope changes).
4. **Open a PR.** Set `status: review`. Put the story id in the branch name and PR title, e.g. `us-012-author-content` / `US-012: Author the content files`.
5. **Merge.** Set `status: done`.
6. **Regenerate the board** after any status change, in the same commit. This also rewrites the story list in every sprint file:
   ```
   node pm/scripts/board.mjs
   ```
7. **Close the sprint at its gate.** Set `status: review`, fill **Gate** with the preview URL, and wait for Caleb's approval. Then write **Review** and **Retro**, set `status: closed` and `end:` date. Move unfinished stories to the next sprint by changing their `sprint:` field, and say so in Review.

**Sprint statuses:** `planned` → `active` → `review` (at the gate) → `closed`.

## Sprint story lists

Each sprint file has a `## Stories` table between `<!-- BEGIN GENERATED STORIES … -->` and `<!-- END GENERATED STORIES -->`. `board.mjs` writes that table from the `sprint:` field of every story. A story's `sprint:` field is the only place its sprint is set:

- To add a story to a sprint, or move it to another one, change its `sprint:` field and run the script.
- Never edit between the markers. The next run overwrites it.
- Story ids and filenames never include the sprint, because stories move between sprints.

## Adding work

- **New story:** copy [templates/story.md](templates/story.md) to `stories/US-<next id>-<slug>.md`, fill in the frontmatter, and regenerate the board.
- **Scope change mid-sprint:** add the story to `backlog`, or to the current sprint if Caleb agrees. Note it in the sprint's Review.
- **New sprint:** copy [templates/sprint.md](templates/sprint.md) to `sprints/S<next>-<slug>.md`. Keep the generated-stories markers; the script fails without them.
- **New decision:** add a row to the second table in [decisions.md](decisions.md).

## Validation

`board.mjs` fails with a clear message when a file has a bad status, owner, or priority, a missing or duplicate id, an unknown sprint, or a dependency that doesn't exist. It also fails when a sprint file is missing its generated-stories markers, and warns when a story is started before its dependencies are done, or marked done with unticked criteria. Once CI exists (US-008), add this step so a stale board or sprint story list fails the PR:

```
node pm/scripts/board.mjs --check
```
