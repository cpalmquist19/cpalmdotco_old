# Project management

Sprints, user stories, and their status for the chat-first portfolio. Everything is plain Markdown in the repo, so plans change in the same PRs as the code. The source of truth for *what* to build is [docs/Chat-First Portfolio — Build Spec.md](../docs/Chat-First%20Portfolio%20—%20Build%20Spec.md). This folder tracks *when* and *how far along* it is.

```
pm/
  README.md          how the system works (this file)
  BOARD.md           generated status board; never edit by hand
  WAITING-ON-CALEB.md generated list of everything waiting for Caleb, in order; never edit by hand
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
| Everything Caleb needs to do, in order | [WAITING-ON-CALEB.md](WAITING-ON-CALEB.md) (generated) |
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
- `in-progress`: being built (uncommitted, on `main`).
- `review`: waiting on a check only Caleb can do, e.g. on the deployed site.
- `blocked`: can't move. Say why in the story's Log.
- `done`: pushed to `main`, every acceptance criterion ticked, and all checks pass.
- `cancelled`: dropped. Keep the file and note why in the Log.

**Definition of ready:** a Claude story can start only when its dependencies are `done` and its **Files to touch**, **Out of scope** and **Tests to add** sections are filled in. `board.mjs` warns about any startable story that isn't ready. Don't wait for that warning, or for the story's sprint to start: a story in a later sprint can become startable early, the way US-011 did. Instead, scope each story when it appears under **Refine next** on [BOARD.md](BOARD.md), which lists unscoped Claude stories one story away from starting. Several can be scoped in one story (US-054 did all of S02). Check that a sprint's stories are all ready before it starts.

**Definition of done:** every acceptance criterion is checked, each one has a passing automated test where the spec calls for one, and it's pushed to `main` with the pre-push hook and CI both green. Per decision D-008 there are no branches or PRs: every story goes straight to `main`, and the hook refuses any push with a failing check.

## Workflow

1. **Plan the sprint.** Set the sprint file's `status: active` and `start:` date. Clear its items on [WAITING-ON-CALEB.md](WAITING-ON-CALEB.md), and make sure its Claude stories are ready (see *Definition of ready*).
2. **Pick work** from *Next up* on [BOARD.md](BOARD.md). Set the story to `in-progress`.
3. **Build it.** Tick acceptance criteria as they pass. Add dated entries to the story's **Log** (commit hashes, test results, scope changes). The commit that finishes a story writes `this commit`, because a commit can't contain its own hash.
4. **Push.** Set `status: done`, then commit everything for the story in one commit (`US-012: Author the content files`) and `git push origin main`. The pre-push hook runs every check first.
5. **Watch CI.** If the run on `main` fails, the fix is the next commit.
6. **Regenerate the board** after any change to a story, sprint or decision, in the same commit. This rewrites `BOARD.md`, `WAITING-ON-CALEB.md` and the story list in every sprint file:
   ```
   node pm/scripts/board.mjs
   ```
7. **Close the sprint at its gate.** Set `status: review`, fill **Gate** with the site's Vercel URL, and wait for Caleb's approval. Then write **Review** and **Retro**, set `status: closed` and `end:` date. Move unfinished stories to the next sprint by changing their `sprint:` field, and say so in Review.

**Sprint statuses:** `planned` → `active` → `review` (at the gate) → `closed`.

## Sprint story lists

Each sprint file has a `## Stories` table between `<!-- BEGIN GENERATED STORIES … -->` and `<!-- END GENERATED STORIES -->`. `board.mjs` writes that table from the `sprint:` field of every story. A story's `sprint:` field is the only place its sprint is set:

- To add a story to a sprint, or move it to another one, change its `sprint:` field and run the script.
- Never edit between the markers. The next run overwrites it.
- Story ids and filenames never include the sprint, because stories move between sprints.

## Waiting on Caleb

[WAITING-ON-CALEB.md](WAITING-ON-CALEB.md) is the one list of everything that needs Caleb, built from:

| Source | Shows up as |
| --- | --- |
| Story with `status: blocked` | **Unblock**: answer the question in its Log |
| Story with `status: review` | **Review**: check it and approve |
| Sprint with `status: review` | **Approve the gate** |
| `open` row in [decisions.md](decisions.md) | **Decide** |
| Story with `owner: Caleb` that isn't done | **Do** |

Items that have stopped work come first, then the rest in the order their sprints need them. To put something in front of Caleb, use one of those sources. Don't write to the file.

## Adding work

- **New story:** copy [templates/story.md](templates/story.md) to `stories/US-<next id>-<slug>.md`, fill in the frontmatter, and regenerate the board.
- **Scope change mid-sprint:** add the story to `backlog`, or to the current sprint if Caleb agrees. Note it in the sprint's Review.
- **New sprint:** copy [templates/sprint.md](templates/sprint.md) to `sprints/S<next>-<slug>.md`. Keep the generated-stories markers; the script fails without them.
- **New decision:** if Caleb should make it, add an `open` row to the first table in [decisions.md](decisions.md); it appears on WAITING-ON-CALEB.md. If it's a choice you made within a story, record it in the second table.

## Validation

`board.mjs` fails with a clear message when a file has a bad status, owner, or priority, a missing or duplicate id, an unknown sprint, a dependency that doesn't exist, or a malformed decision row. It also fails when a sprint file is missing its generated-stories markers, and warns when a startable Claude story isn't ready, when a story is started before its dependencies are done, or marked done with unticked criteria. It also warns when two unfinished stories name the same file in **Files to touch** and neither depends on the other: add the missing dependency. A unit test turns that warning into a failure of `npm run verify`. CI runs this step (from US-008), so a stale board or sprint story list fails the build:

```
node pm/scripts/board.mjs --check
```
