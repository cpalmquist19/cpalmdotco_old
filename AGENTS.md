# AGENTS.md

Instructions for AI coding agents working in this repo. Read all of this file before you start. The rules are written to be followed literally.

## Project

A chat-first portfolio site for Caleb Palmquist: Next.js (App Router, TypeScript), with a grounded chat that answers only from the files in `content/`.

| Document | What it tells you |
| --- | --- |
| [docs/Chat-First Portfolio — Build Spec.md](docs/Chat-First%20Portfolio%20—%20Build%20Spec.md) | What to build. Read the sections your story's `spec:` field names before you write code |
| [docs/CODING.md](docs/CODING.md) | How to write the code. Follow it for every change |
| [pm/README.md](pm/README.md) | How stories, sprints and the board work. Read it once |
| [pm/decisions.md](pm/decisions.md) | Choices that override the spec's defaults. A `decided` row wins over the spec |
| [pm/WAITING-ON-CALEB.md](pm/WAITING-ON-CALEB.md) | Everything waiting for Caleb, in the order he should handle it |

If the story, the spec and a decision disagree in a way the table above doesn't settle, don't pick one. Stop and ask (see below).

## How to work a story

Do one story at a time, on its own branch, in this order:

1. **Pick the story.** Take the top Claude-owned row in *Next up* on [pm/BOARD.md](pm/BOARD.md). If Caleb named a story, take that one. If the task has no story, create one from [pm/templates/story.md](pm/templates/story.md) with the next free `US-###` id, and tell Caleb you did.
2. **Check it's ready.** Everything in `depends_on` must be `done`. The story must have filled-in **Files to touch**, **Out of scope** and **Tests to add** sections. If either check fails, stop and ask.
3. **Read before you write.** Read the whole story, the spec sections in its `spec:` field, any decisions it mentions, and [docs/CODING.md](docs/CODING.md).
4. **Start.** Create the branch `us-###-short-slug` from an up-to-date `main` (`git switch main && git pull`). If a story you did earlier is still `review` but its PR is merged (check with `gh pr list --state merged`), set it to `done` with a Log entry first. Then set your new story to `status: in-progress`, add a Log entry, and run `node pm/scripts/board.mjs`.
5. **Build.** Change only the files in **Files to touch**. If you need to change another file, note it in the Log with the reason. Nothing in **Out of scope**.
6. **Test.** Write the tests in **Tests to add**, one or more per acceptance criterion, named as [docs/CODING.md § 9](docs/CODING.md#9-tests) says.
7. **Verify.** Run `npm run verify`, plus `npm run test:e2e` if the story has Playwright tests. Both must pass with no errors and no warnings. (Before US-002 adds `package.json`, run `node pm/scripts/board.mjs --check` instead.)
8. **Tick and log.** Tick each acceptance criterion (`- [x]`) whose test passes. Add a Log entry with the commands you ran and their results.
9. **Open the PR.** Set `status: review`, run `node pm/scripts/board.mjs`, and commit the code, the story file and the regenerated pm files together. Push, and open a PR titled `US-###: Story title`. In the PR description, list each acceptance criterion and the test that covers it.
10. **Stop.** Don't start the next story until Caleb tells you to. Caleb reviews and merges. You mark the story `done` at step 4 of your next story.

## Never

These are the mistakes that cost the most to undo. None of them is ever the right fix:

- Delete, skip (`.skip`, `.only`, `fixme`) or weaken a test to make it pass.
- Add `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `any`, or loosen `tsconfig.json`, ESLint or Prettier settings.
- Install a package the spec or the story doesn't name.
- Invent a fact about Caleb (employer, date, number, skill, link), even as a placeholder that looks real.
- Commit a secret, a `.env` file, or ask for a key in chat.
- Edit `pm/BOARD.md`, `pm/WAITING-ON-CALEB.md` or anything between `GENERATED` markers by hand.
- Tick an acceptance criterion that has no passing test, or mark a story `done` before it's merged.
- Do a story owned by Caleb, tick "Approved by Caleb", set a sprint to `closed`, or settle an `open` decision.
- Push to `main`, force-push, or merge your own PR.
- Work on two stories in one branch.

## Stop and ask

Stop, set the story to `status: blocked`, write the question in its Log, run `node pm/scripts/board.mjs`, and ask Caleb when:

- The story, the spec and a decision disagree, or a requirement can be read two ways.
- An acceptance criterion can't be met as written, or its test can't pass without breaking a rule above.
- You need a file outside **Files to touch** for more than a small, obvious fix, or anything in **Out of scope**.
- You need a package, an account, a secret, real content or a design choice the spec doesn't give.
- A command fails twice for the same reason and you don't know why.

A blocked story shows up on [pm/WAITING-ON-CALEB.md](pm/WAITING-ON-CALEB.md), so Caleb sees it. A short question now costs less than a wrong guess.

## Work tracking

All work is tracked in [pm/](pm/). These rules apply to every task:

1. **Status lives only in the story's frontmatter:**
   - When you start: `status: in-progress`
   - When the PR is open, or the work is waiting on Caleb's check: `status: review`
   - When it's merged and every acceptance criterion is ticked: `status: done`
   - When you can't proceed: `status: blocked`, with the reason in the Log
2. **Tick acceptance criteria** (`- [x]`) only when they actually pass, with a test where the spec calls for one.
3. **Add a Log entry** for each meaningful step, newest first: `YYYY-MM-DD · what changed · PR/commit · test result`.
4. **Regenerate the generated files** after any change to a story, sprint or decision, and commit them with that change:
   ```
   node pm/scripts/board.mjs
   ```
   This rewrites `pm/BOARD.md`, `pm/WAITING-ON-CALEB.md` and the story list in each sprint file. If the script reports errors, fix the frontmatter before going on.
5. **Respect dependencies.** Don't start a story until everything in its `depends_on` is `done`, unless Caleb says so. The script warns when this happens.

## Boundaries

- **`owner: Claude`** means the AI builder, whichever agent is doing the work. **`owner: Caleb`** stories are Caleb's own inputs and approvals (content, accounts, secrets, sign-off). Don't do them or mark them done. Ask Caleb instead.
- **Review gates belong to Caleb.** You may set a sprint to `status: review` and fill in its preview URL. Never tick "Approved by Caleb" and never set a sprint to `closed`.
- **Decisions:** don't settle an `open` row in [pm/decisions.md](pm/decisions.md) on your own. If a sprint starts while one it needs is still open, go ahead with the recommended default and record it as `decided (default)` with the date. If you hit a new choice that Caleb should make, add it as an `open` row.
- **Scope:** if the work reveals something new, add it as a new story in `backlog`. Don't quietly widen the current story.
- **Secrets:** never commit API keys or ask for them in chat. They belong in hosting environment variables only.

## Conventions

- Branch: `us-###-short-slug`. PR title: `US-###: Story title`. Commit message: `US-###: imperative summary`.
- Commit the code change, the story file update and the regenerated pm files together.
