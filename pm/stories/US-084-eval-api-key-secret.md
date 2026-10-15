---
id: US-084
title: Add the eval's API key as a GitHub secret
sprint: S06
status: todo
owner: Caleb
points: 1
priority: P0
depends_on: []
spec: Testing › Grounded-answer eval
---

# US-084 · Add the eval's API key as a GitHub secret

As the **site owner**, I want a model API key stored as a GitHub Actions secret, so that the grounded-answer eval in US-034 can run in CI on content changes and nightly, and the key never reaches the repo or a chat.

## Acceptance criteria

- [ ] A repository secret named `ANTHROPIC_API_KEY` exists (GitHub → Settings → Secrets and variables → Actions → Repository secrets). `gh secret list` shows the name
- [ ] The key was never pasted into chat or committed. If it was, it's revoked in the Anthropic console and the new key is the one stored

## Notes

- **Decision first.** D-064 asks whether the eval uses the site's key or a separate one. The recommended default is a separate key, so the eval has its own monthly spend limit and the site's key never leaves Vercel. Settle D-064, then add the key it names.
- **Cost.** A run is about 50 answers from the small model and about 40 judgments from the larger one, each with the content pack (a few thousand tokens) in the prompt. That is cents a run, so a nightly run plus content pushes stays well under a dollar a month. Set the key's monthly limit to a small number anyway.
- **How.** Run `gh secret set ANTHROPIC_API_KEY`, which prompts for the value, or use the GitHub settings page. Don't paste the key to Claude.
- **Why GitHub and not Vercel.** Only the eval workflow (US-034) reads it, and that runs on GitHub, where Vercel's variables don't exist. See D-024, which it extends.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
