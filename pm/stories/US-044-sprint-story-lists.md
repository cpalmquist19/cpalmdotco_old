---
id: US-044
title: List each sprint's stories in its sprint file
sprint: backlog
status: done
owner: Claude
points: 1
priority: P2
depends_on: []
spec: Process (pm/ tooling, not in the build spec)
---

# US-044 · List each sprint's stories in its sprint file

As **Caleb**, I want each sprint file to list its stories, so that I can see what a sprint covers without opening every story file.

## Acceptance criteria

- [x] Every sprint file has a `## Stories` section whose table is written by `node pm/scripts/board.mjs` from the stories' `sprint:` field
- [x] Adding, removing or moving a story (changing its `sprint:`) updates the sprint tables on the next script run; text outside the markers is left untouched
- [x] `--check` fails, naming the file, when BOARD.md or any sprint's story list is stale
- [x] The script fails with a clear error when a sprint file is missing the markers
- [x] `templates/sprint.md` and `pm/README.md` describe the generated section

## Notes

- Story ids and filenames stay as they are (`US-###-slug`) and don't include the sprint. Stories move between sprints, and renaming on every move would break `depends_on`, branch names and links.
- No automated test: `pm/` has no test runner yet. Verified by running the script by hand (see Log).

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Approved by Caleb · initial commit 53aa067 · `board.mjs --check` passes
2026-10-12 · board.mjs writes a Stories table into each sprint file between markers; markers added to S01–S07 and the template; README updated · no commit (repo not initialised yet) · manual: moving US-008 to S02 made `--check` fail naming 3 stale files, and a rerun moved the row; removing S02's markers errors; restored state passes `--check`
