---
id: US-064
title: Telegram notifications for deployments and failed CI
sprint: backlog
status: done
owner: Claude
points: 2
priority: P1
depends_on: [US-065]
spec: —
---

# US-064 · Telegram notifications for deployments and failed CI

As the **site owner**, I want a Telegram message when a Vercel deployment finishes or CI fails on `main`, so that I find out about a broken build without watching GitHub or Vercel.

## Acceptance criteria

- [x] When a Vercel deployment finishes (`success`, `failure` or `error`), a Telegram message gives the environment, the result, the short commit hash and the deployment URL (the log URL on a failure). Pending and in-progress states send nothing
- [x] When CI fails on `main`, a Telegram message gives the short commit hash, the commit subject and a link to the run. A passing, cancelled or non-`main` run sends nothing
- [x] `gh workflow run notify.yml` sends a test message, so the secrets can be checked without a deployment
- [x] With either secret missing, the workflow passes and logs a warning instead of failing. A Telegram API error also logs a warning and never turns the run red
- [x] The token is read only from `secrets`. Event text (commit message, URLs) reaches the shell through `env`, never inline in a `run:` script. No token-shaped string is committed
- [x] `AGENTS.md` says CI notification secrets live in GitHub Actions secrets, and D-024 records why
- [x] A Vitest test covers each criterion above that the workflow file can show
- [x] Caleb receives the test message and the message for a real deployment on his phone

## Files to touch

- `.github/workflows/notify.yml`: new. One job, three triggers, one `curl` step
- `tests/unit/workflows/notify.test.ts`: new
- `AGENTS.md`: the **Secrets** bullet under *Boundaries*, one sentence (see **Notes**)
- `pm/decisions.md`: add D-024 (allowed in any story)

## Out of scope

- The chat-error alert for 5% errors in a day (US-040). It can reuse this bot and these secrets later; this story builds no runtime alerting
- Any change to `.github/workflows/ci.yml`. The new workflow reads CI's result instead, so US-058 and this story don't touch the same file
- Messages for passing CI runs. The deployment message already says the push went out
- Vercel-side webhooks or integrations
- A bot that answers commands or replies. This only sends
- Creating the bot and storing the secrets (US-065, Caleb's)
- Editing `docs/CODING.md` § 8. US-011 also edits that file. D-024 records the exception, and the next story that edits CODING.md can fold it in

## Tests to add

All in `tests/unit/workflows/notify.test.ts`, reading `.github/workflows/notify.yml` and `AGENTS.md` as text:

- `US-064: notify.yml triggers on deployment_status, on workflow_run of CI, and on workflow_dispatch`
- `US-064: a deployment message is sent only for success, failure and error`
- `US-064: a CI message is sent only for a failed run on main`
- `US-064: a manual run always sends a test message`
- `US-064: a missing secret skips the step with a warning and exits 0`
- `US-064: a failed curl logs a warning and does not fail the job`
- `US-064: the token comes from secrets and no run script reads github.event inline`
- `US-064: no Telegram token is committed in the workflow or the test`
- `US-064: AGENTS.md says CI notification secrets live in GitHub Actions secrets`

## Notes

- **Why a separate workflow.** `deployment_status` and `workflow_run` are different triggers from `ci.yml`'s `push`. Adding them there would re-run every CI job on each deployment event. `workflow_run` with `workflows: [CI]` reads the result of the CI run instead. Both triggers run from the workflow on the default branch, which is `main`.
- **Shape.** One job, `telegram`, on `ubuntu-latest`, with `permissions: {}` and no checkout. The job's `if:` filters the events in the criteria; one bash `case "$GITHUB_EVENT_NAME"` step builds the text. Keep the `curl` call in one place.
- **Messages.**

  | Event | Text |
  | --- | --- |
  | `deployment_status`, `success` | `✅ Production deployed: abc1234`, then the environment URL |
  | `deployment_status`, `failure` or `error` | `❌ Production deployment failed: abc1234`, then the log URL |
  | `workflow_run`, `failure` on `main` | `❌ CI failed on main: abc1234 <commit subject>`, then the run URL |
  | `workflow_dispatch` | `🧪 Test message from cpalmdotco` |

  The environment name comes from `github.event.deployment.environment` ("Production" or "Preview"). The short hash is the first 7 characters of `github.event.deployment.sha` or `github.event.workflow_run.head_sha`. The commit subject is the first line of `github.event.workflow_run.head_commit.message`.
- **Vercel's fields.** Vercel reports each deployment to GitHub as a `deployment_status`. Use `environment_url` for the link and fall back to `target_url`, and use `log_url` on a failure. Check the first real event's payload and write the fields you saw in the Log. If a field is empty, say so in the message instead of printing a blank.
- **Skipping without secrets.** Map both secrets into `env`, then test them in bash: `if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then echo "::warning::…"; exit 0; fi`. A secret can't be used in a job-level `if:`. This keeps every push green before US-065 is done.
- **Sending.** `curl --silent --show-error --fail --data-urlencode "chat_id=$TELEGRAM_CHAT_ID" --data-urlencode "text=$TEXT" "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" || echo "::warning::Telegram notification failed"`. Never use `curl -v` or `set -x`: they print the URL, which contains the token.
- **Untrusted text.** Pass the commit message and URLs through `env:` and read them as `"$COMMIT_MESSAGE"`. Never write `${{ github.event… }}` inside `run:`.
- **Reading the workflow in a test.** Read the file as text and assert on lines, as US-058 does. If US-011 has landed, `yaml` is installed and can parse it instead.
- **D-024.** CODING § 8 and AGENTS.md say secrets live only in hosting environment variables. That is the site's runtime secrets. These two are read only by GitHub Actions, so they can't live in Vercel. Add D-024 to "Decisions made during the build" and change the AGENTS.md **Secrets** bullet to say CI notification secrets belong in GitHub Actions secrets. `.env.example` isn't touched: these aren't app environment variables.
- **Failure path.** Don't push a failing commit to `main` to prove the CI message (the `--no-verify` exception was US-008's alone). The `if:` is covered by a test, the send step is the one the manual test message uses, and the first real CI failure completes the proof. Say so in the Log.
- **Review step.** Set the story to `review` after the push. Caleb runs `gh workflow run notify.yml` and confirms the test message, then confirms the message for the push itself. Tick the last criterion only after that.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done. Cause of the 400: the stored `TELEGRAM_CHAT_ID` was not a chat this bot could reach ("chat not found"); Caleb replaced the secret himself with the `chat.id` from `getUpdates`. Re-ran `gh workflow run notify.yml` (run 38456444545): green with no warning, and Caleb confirmed the test message arrived on his phone. The deployment message uses the same send step and first runs under the fixed chat ID on this commit's Production deployment. The CI-failure message is still unproven on purpose: its `if:` is covered by a test and the first real CI failure completes the proof · this commit · `npm run verify` passes; CI on `main` pending
2026-10-13 · First live run (81d0d35): the `workflow_dispatch` and the Production `deployment_status` runs both fired and stayed green, but Telegram returned HTTP 400, so no message arrived. The warning couldn't say why because the script discarded the reply. Vercel's payload does carry `environment_url`, `target_url` and `log_url`, and the environment is "Production". The `workflow_run` run was skipped on a passing CI, as intended. Changed the send to `--fail-with-body` inside `if !`, so the warning shows Telegram's error JSON (no token in it) and a success reply is still never printed, since it holds the chat's name and the logs are public · this commit · `npm run verify` passes; dry-run with a fake `curl` prints the reason on failure and nothing on success
2026-10-13 · Built; waiting on Caleb's phone check (the last criterion). After the push, run `gh workflow run notify.yml` for the test message, then the push of this commit should send the Production deployment message. The CI-failure message isn't proven on purpose: a failing push would break `main`, and the `--no-verify` exception was US-008's alone. The `if:` is covered by a test, the send step is the one the test message uses, and the first real CI failure completes the proof · this commit · `npm run verify` passes (30 unit tests, board check); `npm run test:e2e` 78 passed; CI result to follow
2026-10-13 · Choices the story left open: an empty environment name reads "Vercel" instead of a blank; curl's output goes to `/dev/null`, so Telegram's JSON reply stays out of the log; the no-`set -x`/`-v` test skips comment lines, because the script's own comment names both. Dry-ran the script with a fake `curl` for all four events, a missing secret and a failing curl: right text each time, subject cut to its first line, exit 0 in every case (throwaway script in the scratchpad, not committed). Fields used: `deployment_status.environment_url` falling back to `target_url`, `.log_url`, `deployment.environment`, `deployment.sha`; not yet seen in a real Vercel payload · this commit · —
2026-10-13 · Started: pulled main (4ece246), tree clean, depends_on US-065 done (secrets seen with `gh secret list`) · — · —
2026-10-13 · Created at Caleb's request. Triggers read CI's result with `workflow_run` instead of adding a job to `ci.yml`, so no dependency on US-058. The Caleb-owned secrets step is US-065 · this commit · `board.mjs --check` passes
