# Decision log

Decisions from the build spec's *Decisions to make before Phase 1*. The recommended default goes ahead if nothing is chosen by the time the blocked sprint starts. When one is settled, set **Status** to `decided`, fill **Choice** and **Date**, and note anything that changes in the affected stories.

| ID | Decision | Options | Recommended default | Blocks | Status | Choice | Date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | Chat backend | Next.js API route · FastAPI service | Next.js route for v1; FastAPI as stretch (US-042) | S05 | open | | |
| D-002 | Model provider | Claude API · OpenAI · self-hosted Ollama | Claude API with a small, fast model | S05 | open | | |
| D-003 | Base palette | Warm off-white · cooler gray · your pick | Warm off-white `#f5f4f0`, monochrome, green status dot | S01 | open | | |
| D-004 | Headline pool | Report's drafted pool · your own facts | The report's pool, edited by you | S03 | open | | |
| D-005 | Domain | Your own · host's free subdomain | Your own if you have one; else host subdomain | S07 | open | | |
| D-006 | Hosting | Vercel · Cloudflare Pages | Vercel | S01* | open | | |

\* The spec lists hosting as blocking Phase 7, but Phase 1 links a Vercel preview, so it is needed by S01 (see US-001).

## Decisions made during the build

Add new rows here as `D-007`, `D-008`, … with the date, the choice and the reason.

| ID | Date | Decision | Choice | Why | Stories affected |
| --- | --- | --- | --- | --- | --- |
