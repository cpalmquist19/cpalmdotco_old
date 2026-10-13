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

Do one story at a time, straight on `main` (decision D-008: no branches or PRs; every push must pass all checks), in this order:

1. **Pick the story.** Take the top Claude-owned row in *Next up* on [pm/BOARD.md](pm/BOARD.md). If Caleb named a story, take that one. If the task has no story, create one from [pm/templates/story.md](pm/templates/story.md) with the next free `US-###` id, and tell Caleb you did.
2. **Check it's ready.** Everything in `depends_on` must be `done`. The story must have filled-in **Files to touch**, **Out of scope** and **Tests to add** sections. If either check fails, stop and ask.
3. **Read before you write.** Read the whole story, the spec sections in its `spec:` field, any decisions it mentions, and [docs/CODING.md](docs/CODING.md).
4. **Start.** Run `git switch main && git pull`, and check `git status` is clean. Set the story to `status: in-progress`, add a Log entry, and run `node pm/scripts/board.mjs`. Don't commit yet.
5. **Build.** Change only the files in **Files to touch**. If you need to change another file, note it in the Log with the reason. Nothing in **Out of scope**.
6. **Test.** Write the tests in **Tests to add**, one or more per acceptance criterion, named as [docs/CODING.md § 9](docs/CODING.md#9-tests) says.
7. **Verify.** Run `npm run verify` and `npm run test:e2e`. Both must pass with no errors and no warnings. (Before US-002 adds `package.json`, run `node pm/scripts/board.mjs --check` instead.)
8. **Tick and log.** Tick each acceptance criterion (`- [x]`) whose test passes. Add a Log entry with the commands you ran and their results.
9. **Commit and push.** Set `status: done`, run `node pm/scripts/board.mjs`, and make one commit with the code, the story file and the regenerated pm files: `git commit -m "US-###: imperative summary"`. Then `git push origin main`. The pre-push hook (from US-002) runs `npm run verify` and `npm run test:e2e` and refuses the push if anything fails. Fix the failure and try again. Never bypass the hook.
10. **Check CI.** Run `gh run watch` (or `gh run list --branch main --limit 1`) until the run for your commit finishes. If it fails, fixing it is your next commit, before anything else. Note the run result in the Log in that fix commit, or in the next story's first commit.
11. **Stop.** Don't start the next story until Caleb tells you to.

## Never

These are the mistakes that cost the most to undo. None of them is ever the right fix:

- Delete, skip (`.skip`, `.only`, `fixme`) or weaken a test to make it pass.
- Add `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `any`, or loosen `tsconfig.json`, ESLint or Prettier settings.
- Install a package the spec or the story doesn't name.
- Invent a fact about Caleb (employer, date, number, skill, link), even as a placeholder that looks real.
- Commit a secret, a `.env` file, or ask for a key in chat.
- Edit `pm/BOARD.md`, `pm/WAITING-ON-CALEB.md` or anything between `GENERATED` markers by hand.
- Tick an acceptance criterion that has no passing test, or mark a story `done` while any check fails.
- Do a story owned by Caleb, tick "Approved by Caleb", set a sprint to `closed`, or settle an `open` decision.
- Push with `--no-verify` (the only exception is the throwaway `ci-check` branch in US-008), force-push, rewrite or revert history on `main`, or push with failing checks.
- Mix two stories in one commit.
- Throw away uncommitted work in the repo: `git clean`, `git reset --hard`, `git stash`, `git checkout -- .`, `git restore .`. To test a clean checkout, commit first, then `git clone` the repo into a temporary folder outside it and run the checks there.
- Stop processes by name or pattern (`taskkill /IM node.exe`, `Stop-Process -Name node`, `pkill node`, `killall node`). Stop only a process you started, by its PID (see *Servers and processes*).

## Stop and ask

Stop, set the story to `status: blocked`, write the question in its Log, run `node pm/scripts/board.mjs`, and ask Caleb. Don't commit or push half-done work; leave it in the working tree. Stop when:

- The story, the spec and a decision disagree, or a requirement can be read two ways.
- An acceptance criterion can't be met as written, or its test can't pass without breaking a rule above.
- You need a file outside **Files to touch** for more than a small, obvious fix, or anything in **Out of scope**.
- You need a package, an account, a secret, real content or a design choice the spec doesn't give.
- A command fails twice for the same reason and you don't know why.

A blocked story shows up on [pm/WAITING-ON-CALEB.md](pm/WAITING-ON-CALEB.md), so Caleb sees it. A short question now costs less than a wrong guess.

## Servers and processes

Caleb's machine runs other Node programs: his editor, other projects, and the agent itself. Touch only the processes you started.

1. **Don't start a server for the e2e tests.** `npm run test:e2e` starts its own and stops it when it finishes.
2. **When you start one yourself** (for example `npm run dev` to look at a page), run it in the background. Once it's up, find the PID listening on its port and write it down:
   ```
   Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
   ```
3. **Before you stop it, check it's yours.** Its command line should be the server you started:
   ```
   Get-CimInstance Win32_Process -Filter "ProcessId=<pid>" | Select-Object CommandLine
   ```
4. **Stop it by that PID only:** `Stop-Process -Id <pid>` in PowerShell, or `kill <pid>` in a POSIX shell.
5. **Check the port is free afterwards** (step 2's command prints nothing). Otherwise the next `npm run test:e2e` fails, because it won't reuse a server that's already running.

If something is already on the port before you start, or a process won't stop, or you can't tell whether you started it, don't kill it. Stop and ask.

## Work tracking

All work is tracked in [pm/](pm/). These rules apply to every task:

1. **Status lives only in the story's frontmatter:**
   - When you start: `status: in-progress`
   - When the work is waiting on a check only Caleb can do: `status: review`
   - When it's pushed to `main` with every acceptance criterion ticked and all checks passing: `status: done`
   - When you can't proceed: `status: blocked`, with the reason in the Log
2. **Tick acceptance criteria** (`- [x]`) only when they actually pass, with a test where the spec calls for one.
3. **Add a Log entry** for each meaningful step, newest first: `YYYY-MM-DD · what changed · PR/commit · test result`. In the commit that finishes the story, write `this commit` in the commit field: a commit can't contain its own hash, and `git log --grep US-###` finds it. Refer to earlier commits by their short hash.
4. **Record what the story didn't specify.** If you choose something the story and spec leave open, and it changes how the site or tooling behaves (a framework option, a different approach from what **Files to touch** implies), add a row to the "Decisions made during the build" table in [pm/decisions.md](pm/decisions.md) with the reason. For a smaller setting that isn't in the story's Notes, give the reason in the Log. You may edit `pm/decisions.md` in any story, even when its **Out of scope** limits other `pm/` files.
5. **Regenerate the generated files** after any change to a story, sprint or decision, and commit them with that change:
   ```
   node pm/scripts/board.mjs
   ```
   This rewrites `pm/BOARD.md`, `pm/WAITING-ON-CALEB.md` and the story list in each sprint file. If the script reports errors, fix the frontmatter before going on.
6. **Respect dependencies.** Don't start a story until everything in its `depends_on` is `done`, unless Caleb says so. The script warns when this happens.

## Boundaries

- **`owner: Claude`** means the AI builder, whichever agent is doing the work. **`owner: Caleb`** stories are Caleb's own inputs and approvals (content, accounts, secrets, sign-off). Don't do them or mark them done. Ask Caleb instead.
- **Review gates belong to Caleb.** You may set a sprint to `status: review` and fill in its preview URL. Never tick "Approved by Caleb" and never set a sprint to `closed`.
- **Decisions:** don't settle an `open` row in [pm/decisions.md](pm/decisions.md) on your own. If a sprint starts while one it needs is still open, go ahead with the recommended default and record it as `decided (default)` with the date. If you hit a new choice that Caleb should make, add it as an `open` row.
- **Scope:** if the work reveals something new, add it as a new story in `backlog`. Don't quietly widen the current story.
- **Secrets:** never commit API keys or ask for them in chat. They belong in hosting environment variables only.

## Conventions

- Work on `main` (D-008). Commit message: `US-###: imperative summary`.
- One commit per story: the code change, the story file update and the regenerated pm files together. A CI fix gets its own commit, `US-###: Fix CI <what>`.
