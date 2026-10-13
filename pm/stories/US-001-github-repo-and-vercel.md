---
id: US-001
title: Create the GitHub repo and link Vercel
sprint: S01
status: todo
owner: Caleb
points: 1
priority: P0
depends_on: []
spec: Inputs needed from you › Accounts; Phase 1
---

# US-001 · Create the GitHub repo and link Vercel

As the **builder**, I want the GitHub repo linked to a Vercel project, so that every push to `main` deploys and each sprint gate has a URL to check.

## Acceptance criteria

- [x] New, empty GitHub repo exists and Claude has push access
- [x] Vercel (or the chosen host, see D-006) account is linked to the repo
- [x] A push to `main` creates a Vercel deployment with a URL

## Notes

- The spec lists the hosting account under Phase 7, but Phase 1 needs a Vercel preview, so it is pulled forward here. Hosting decision D-006 must be settled first.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Caleb ticked the last criterion. Checked with `gh api`: pushes 9c80a10 (US-002) through bb4ec37 each have a Production deployment, and bb4ec37's status is `success` at https://cpalmgpt-8merclek3-caleb-palmquists-projects.vercel.app. Story left at `todo` for Caleb to close · this commit · deployment status success
2026-10-13 · Caleb installed the Vercel GitHub app and imported the repo (preset Next.js). Push of 22a2b57 triggered a Vercel build, so the link is verified. Build failed with "No Next.js version detected", as expected before US-002 adds `package.json`. Last criterion is ticked when US-002's push deploys with a URL · — · —
2026-10-13 · Last criterion changed from "preview for a test PR" to "deployment on push to `main`", because D-008 drops PRs · — · —
2026-10-12 · Repo https://github.com/cpalmquist19/cpalmdotco exists; Claude pushed the initial commit to `main` (53aa067), so the first criterion is verified. Vercel link and preview still to do · — · —
