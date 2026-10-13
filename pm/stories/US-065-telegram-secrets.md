---
id: US-065
title: Add the Telegram bot token and chat ID as GitHub secrets
sprint: backlog
status: done
owner: Caleb
points: 1
priority: P1
depends_on: []
spec: —
---

# US-065 · Add the Telegram bot token and chat ID as GitHub secrets

As the **site owner**, I want the Telegram bot's credentials stored as GitHub Actions secrets, so that the notification workflow in US-064 can message me and the token never reaches the repo or a chat.

## Acceptance criteria

- [x] Two repository secrets exist: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (GitHub → Settings → Secrets and variables → Actions → Repository secrets). `gh secret list` shows both names
- [x] The token was never pasted into chat or committed. If it was, it's revoked (`/revoke` to @BotFather) and the new token is the one stored

## Notes

- **Token.** It's the string @BotFather gave you when you made the bot. Store it with `gh secret set TELEGRAM_BOT_TOKEN`, which prompts for the value, or in the GitHub settings page. Don't paste it to Claude.
- **Chat ID.** Send any message to your bot in Telegram first. A bot can't find your chat until you've messaged it. Then open `https://api.telegram.org/bot<TOKEN>/getUpdates` in your browser and read `result[0].message.chat.id`. That URL contains the token, so don't share it or paste it anywhere. For a private chat the ID is a positive number; a group's is negative. The chat ID isn't secret, but it's stored as a secret to keep one place for both.
- **Why GitHub and not Vercel.** The values are read only by GitHub Actions (US-064), never by the site. See D-024.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Done on Caleb's word that he added the secrets. Checked: `gh secret list` shows `TELEGRAM_BOT_TOKEN` (19:18:37Z) and `TELEGRAM_CHAT_ID` (19:18:57Z); `git grep` finds no token-shaped string in tracked files; the token was not pasted in this session · this commit · `board.mjs --check` passes
2026-10-13 · Created with US-064 at Caleb's request: Telegram notifications for deployments and failed CI · this commit · `board.mjs --check` passes
