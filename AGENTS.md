# AGENTS.md

Instructions for AI coding agents working in this repo.

## Project

A chat-first portfolio site for Caleb Palmquist: Next.js (App Router, TypeScript), with a grounded chat that answers only from the files in `content/`. What to build is defined in [docs/Chat-First Portfolio — Build Spec.md](docs/Chat-First%20Portfolio%20—%20Build%20Spec.md). Read the sections relevant to your story before you write code.

## Work tracking (required)

All work is tracked in [pm/](pm/). Read [pm/README.md](pm/README.md) once for the full system. These rules apply to every task:

1. **Start from a story.** Find the story in `pm/stories/` that covers the task, using [pm/BOARD.md](pm/BOARD.md) (*Next up* and *In flight*). If the task has no story, create one from [pm/templates/story.md](pm/templates/story.md) with the next free `US-###` id before you start, and tell Caleb you did.
2. **Update the story as you go.** Its frontmatter is the only place status lives:
   - When you start: `status: in-progress`
   - When the PR is open, or the work is waiting on Caleb's check: `status: review`
   - When it's merged and every acceptance criterion is ticked: `status: done`
   - When you can't proceed: `status: blocked`, with the reason in the Log
3. **Tick acceptance criteria** (`- [x]`) only when they actually pass, with a test where the spec calls for one.
4. **Add a Log entry** in the story for each meaningful step, newest first: `YYYY-MM-DD · what changed · PR/commit · test result`.
5. **Regenerate the board** after any change to a story or sprint, and commit it with that change:
   ```
   node pm/scripts/board.mjs
   ```
   Never edit `pm/BOARD.md` by hand. If the script reports errors, fix the frontmatter before going on.
6. **Respect dependencies.** Don't start a story until everything in its `depends_on` is `done`, unless Caleb says so. The script warns when this happens.

## Boundaries

- **`owner: Claude`** means the AI builder, whichever agent is doing the work. **`owner: Caleb`** stories are Caleb's own inputs and approvals (content, accounts, secrets, sign-off). Don't do them or mark them done. Ask Caleb instead.
- **Review gates belong to Caleb.** You may set a sprint to `status: review` and fill in its preview URL. Never tick "Approved by Caleb" and never set a sprint to `closed`.
- **Decisions:** don't settle an `open` row in [pm/decisions.md](pm/decisions.md) on your own. If a sprint starts while one is still open, go ahead with the recommended default and record it as `decided (default)` with the date.
- **Scope:** if the work reveals something new, add it as a new story in `backlog`. Don't quietly widen the current story.
- **Secrets:** never commit API keys or ask for them in chat. They belong in hosting environment variables only.

## Conventions

- Branch: `us-###-short-slug`. PR title: `US-###: Story title`.
- Commit the code change, the story file update and the regenerated `BOARD.md` together.
