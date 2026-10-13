---
id: US-051
title: Agent rules and follow-ups from the US-002 review
sprint: backlog
status: done
owner: Claude
points: 1
priority: P1
depends_on: []
spec: Process (AGENTS.md)
---

# US-051 · Agent rules and follow-ups from the US-002 review

As **Caleb**, I want the problems found in the US-002 review turned into rules and stories, so that the next builder doesn't repeat them.

## Acceptance criteria

- [x] AGENTS.md says how to start and stop servers and processes: only by the PID the agent started, never by name (the US-002 build ran `taskkill` on every `node.exe`)
- [x] New story US-050 adds a site icon, so no page requests a missing `/favicon.ico` (US-002 dropped the template's icon); US-035 depends on it, because Lighthouse counts the 404 against Best Practices
- [x] US-002's Log records its pushed commit and the Vercel result, which AGENTS.md step 10 left owed

## Files to touch

- `AGENTS.md`: a *Servers and processes* section and a *Never* bullet
- `pm/stories/US-050-site-icon.md` (new), `pm/stories/US-035-a11y-and-lighthouse-ci.md` (`depends_on`)
- `pm/stories/US-002-scaffold-nextjs.md` (Log only), this story, and the generated pm files

## Out of scope

- The other review findings (decisions table, local e2e server reuse, commit hash in the Log, clean-checkout steps, extras in config, independence of Caleb's stories). They wait for Caleb's answer
- Any code change

## Tests to add

- None: documents only. `npm run verify` passes, and `npm run test:e2e` passes in the pre-push hook.

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · AGENTS.md process rules added (PowerShell commands tried on this machine), US-050 created, US-035 depends on it, US-002 Log completed · this commit · `npm run verify` ✔, `npm run test:e2e` ✔ in the pre-push hook
2026-10-13 · Started at Caleb's request after reviewing US-002 · — · —
