---
id: US-039
title: Production deploy and smoke test
sprint: S07
status: todo
owner: Claude
points: 3
priority: P0
depends_on: [US-037, US-036, US-049]
spec: Deployment › Pipeline step 4
---

# US-039 · Production deploy and smoke test

As the **site owner**, I want the site live on my domain over HTTPS, so that I can share it.

## Acceptance criteria

- [ ] Pushing to `main` deploys to production on the launch domain
- [ ] Domain and HTTPS configured
- [ ] Spend cap confirmed
- [ ] Post-deploy smoke test checks `/`, `/api/chat` and the CV

## Notes

-

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-13 · Depends on US-049, so launch waits for real content (D-010); wording updated for D-008 · — · —
