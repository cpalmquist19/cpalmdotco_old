#!/usr/bin/env node
// Builds pm/BOARD.md, pm/WAITING-ON-CALEB.md and the generated Stories section of each pm/sprints/*.md
// from pm/sprints/*.md, pm/stories/*.md and pm/decisions.md.
//   node pm/scripts/board.mjs           regenerate BOARD.md, WAITING-ON-CALEB.md and the sprint story lists
//   node pm/scripts/board.mjs --check   exit 1 if any generated output is stale or any file is invalid (for CI)
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PM = join(dirname(fileURLToPath(import.meta.url)), "..");
const STORY_STATUSES = ["todo", "in-progress", "review", "blocked", "done", "cancelled"];
const SPRINT_STATUSES = ["planned", "active", "review", "closed"];
const OWNERS = ["Claude", "Caleb"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];
const DECISION_STATUSES = ["open", "decided", "decided (default)"];
// A Claude story can't start until these sections are filled in (the definition of ready)
const READY_SECTIONS = ["Files to touch", "Out of scope", "Tests to add"];
const BEGIN = "<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->";
const END = "<!-- END GENERATED STORIES -->";
const ICON = { todo: "⬜", "in-progress": "🔄", review: "👀", blocked: "⛔", done: "✅", cancelled: "➖" };

const errors = [];
const warnings = [];

function parse(file) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { errors.push(`${file}: missing frontmatter`); return null; }
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((x) => x.trim()).filter(Boolean);
    meta[kv[1]] = v;
  }
  const done = (m[2].match(/^- \[x\]/gim) || []).length;
  const open = (m[2].match(/^- \[ \]/gm) || []).length;
  // Only count checkboxes under "Acceptance criteria"
  const ac = m[2].split(/^## /m).find((sec) => sec.startsWith("Acceptance criteria"));
  meta._ac = ac
    ? { done: (ac.match(/^- \[x\]/gim) || []).length, total: (ac.match(/^- \[[ x]\]/gim) || []).length }
    : { done, total: done + open };
  // Section heading -> body with comments and bare "-" placeholder lines removed
  meta._sections = Object.fromEntries(m[2].split(/^## /m).slice(1).map((sec) => {
    const nl = sec.indexOf("\n");
    const body = nl === -1 ? "" : sec.slice(nl + 1).replace(/<!--[\s\S]*?-->/g, "").split("\n").filter((l) => !/^\s*-?\s*$/.test(l)).join("\n");
    return [sec.slice(0, nl === -1 ? undefined : nl).trim(), body];
  }));
  return meta;
}

function load(sub) {
  const dir = join(PM, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => {
    const meta = parse(join(dir, f));
    if (meta) meta._file = `${sub}/${f}`;
    return meta;
  }).filter(Boolean);
}

const sprints = load("sprints");
const stories = load("stories");
const sprintIds = new Set(sprints.map((s) => s.id));
const byId = new Map();

for (const sp of sprints) {
  if (!SPRINT_STATUSES.includes(sp.status)) errors.push(`${sp._file}: status "${sp.status}" not in ${SPRINT_STATUSES.join("|")}`);
}
for (const st of stories) {
  const f = st._file;
  if (!/^US-\d{3}$/.test(st.id ?? "")) errors.push(`${f}: id must look like US-001`);
  if (!f.includes(`/${st.id}-`)) errors.push(`${f}: filename must start with its id (${st.id})`);
  if (byId.has(st.id)) errors.push(`${f}: duplicate id ${st.id} (also ${byId.get(st.id)._file})`);
  byId.set(st.id, st);
  if (!STORY_STATUSES.includes(st.status)) errors.push(`${f}: status "${st.status}" not in ${STORY_STATUSES.join("|")}`);
  if (st.sprint !== "backlog" && !sprintIds.has(st.sprint)) errors.push(`${f}: sprint "${st.sprint}" has no file in sprints/`);
  if (!OWNERS.includes(st.owner)) errors.push(`${f}: owner "${st.owner}" not in ${OWNERS.join("|")}`);
  if (!PRIORITIES.includes(st.priority)) errors.push(`${f}: priority "${st.priority}" not in ${PRIORITIES.join("|")}`);
  if (!/^\d+$/.test(st.points ?? "")) errors.push(`${f}: points must be a whole number`);
  st.points = Number(st.points) || 0;
  st.depends_on = Array.isArray(st.depends_on) ? st.depends_on : st.depends_on ? [st.depends_on] : [];
}
for (const st of stories) {
  for (const d of st.depends_on) {
    if (!byId.has(d)) { errors.push(`${st._file}: depends_on ${d} does not exist`); continue; }
    if (["in-progress", "review", "done"].includes(st.status) && byId.get(d).status !== "done")
      warnings.push(`${st.id} is ${st.status} but its dependency ${d} is ${byId.get(d).status}`);
  }
  if (st.status === "done" && st._ac.done < st._ac.total)
    warnings.push(`${st.id} is done with ${st._ac.total - st._ac.done} unchecked acceptance criteria`);
  const startable = st.status === "in-progress" || (st.status === "todo" && st.depends_on.every((d) => byId.get(d)?.status === "done"));
  const missing = READY_SECTIONS.filter((h) => !st._sections[h]);
  if (st.owner === "Claude" && startable && missing.length)
    warnings.push(`${st.id} can start but isn't ready: fill in ${missing.join(", ")}`);
}

// Decisions: rows of the first table in decisions.md (the second table records choices already made)
const decisions = [];
{
  const path = join(PM, "decisions.md");
  const text = existsSync(path) ? readFileSync(path, "utf8").replace(/\r\n/g, "\n") : "";
  const section = text.split(/^## /m).find((sec) => sec.startsWith("Decisions for Caleb"));
  if (!section) errors.push(`decisions.md: missing the "## Decisions for Caleb" section`);
  for (const line of (section ?? "").split("\n").filter((l) => /^\|\s*D-\d+\s*\|/.test(l))) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length !== 8) { errors.push(`decisions.md: row "${cells[0]}" has ${cells.length} columns, expected 8`); continue; }
    const [id, decision, options, recommended, blocks, status, choice, date] = cells;
    const sprint = blocks.match(/S\d\d/)?.[0];
    if (!DECISION_STATUSES.includes(status)) errors.push(`decisions.md: ${id} status "${status}" not in ${DECISION_STATUSES.join("|")}`);
    if (!sprint || !sprintIds.has(sprint)) errors.push(`decisions.md: ${id} Blocks "${blocks}" must name a sprint like S01`);
    else if (status !== "open" && (!choice || !date)) errors.push(`decisions.md: ${id} is ${status} but Choice or Date is empty`);
    decisions.push({ id, decision, options, recommended, sprint, status });
  }
}

const isDone = (s) => s.status === "done";
const live = (s) => s.status !== "cancelled";
const ready = (s) => s.status === "todo" && s.depends_on.every((d) => byId.get(d)?.status === "done");
const link = (s, base = "") => `[${s.id}](${base}${s._file})`;
const bar = (n, d) => { const k = d ? Math.round((n / d) * 10) : 0; return "█".repeat(k) + "░".repeat(10 - k); };
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const prioRank = (s) => PRIORITIES.indexOf(s.priority);
const groups = [...sprints.map((sp) => ({ id: sp.id, name: sp.name, status: sp.status, file: sp._file })),
  { id: "backlog", name: "Backlog", status: "—", file: null }];

const row = (s, base) => {
  const deps = s.depends_on.map((d) => (byId.get(d)?.status === "done" ? `~~${d}~~` : d)).join(", ") || "—";
  return `| ${link(s, base)} | ${s.title} | ${ICON[s.status] ?? ""} ${s.status}${ready(s) ? " · ready" : ""} | ${s.owner} | ${s.priority} | ${s.points} | ${s._ac.done}/${s._ac.total} | ${deps} |`;
};
const table = (list, base = "") => list.length
  ? ["| ID | Story | Status | Owner | Pri | Pts | AC | Depends on |", "| --- | --- | --- | --- | --- | --- | --- | --- |", ...list.map((s) => row(s, base))].join("\n")
  : "_None._";

const allLive = stories.filter(live);
const out = [];
out.push("# Project board", "",
  "<!-- GENERATED by `node pm/scripts/board.mjs` — do not edit by hand. Edit story/sprint frontmatter instead. -->", "",
  `**Overall:** ${allLive.filter(isDone).length}/${allLive.length} stories · ${allLive.filter(isDone).reduce((a, s) => a + s.points, 0)}/${allLive.reduce((a, s) => a + s.points, 0)} points · ${bar(allLive.filter(isDone).reduce((a, s) => a + s.points, 0), allLive.reduce((a, s) => a + s.points, 0))}`, "",
  "## Sprints", "",
  "| Sprint | Status | Stories done | Points done | Progress |", "| --- | --- | --- | --- | --- |");
for (const g of groups) {
  const list = allLive.filter((s) => s.sprint === g.id);
  const pd = list.filter(isDone).reduce((a, s) => a + s.points, 0), pt = list.reduce((a, s) => a + s.points, 0);
  const label = g.file ? `[${g.id} · ${g.name}](${g.file})` : g.name;
  out.push(`| ${label} | ${g.status} | ${list.filter(isDone).length}/${list.length} | ${pd}/${pt} | ${bar(pd, pt)} ${pct(pd, pt)}% |`);
}

const sprintOrder = (s) => (s.sprint === "backlog" ? 999 : groups.findIndex((g) => g.id === s.sprint));
const sortWork = (a, b) => sprintOrder(a) - sprintOrder(b) || prioRank(a) - prioRank(b) || a.id.localeCompare(b.id);
out.push("", "## In flight", "", table(allLive.filter((s) => ["in-progress", "review", "blocked"].includes(s.status)).sort(sortWork)));
out.push("", "## Next up", "", "Stories whose dependencies are all done, earliest sprint and highest priority first.", "",
  table(allLive.filter(ready).sort(sortWork).slice(0, 8)));

// Waiting on Caleb: first what has stalled work (blocked, review, sprint gates), then decisions and
// Caleb's own stories in the order their sprints need them.
const current = groups.findIndex((g) => g.id !== "backlog" && g.status !== "closed");
const sprintIdx = (id) => (id === "backlog" ? 999 : groups.findIndex((g) => g.id === id));
const when = (idx) => (idx <= current ? "🔴 now" : idx === current + 1 ? "🟡 next sprint" : idx === 999 ? "⚪ backlog" : "⚪ later");
const openWork = (s) => live(s) && !isDone(s);
const dependents = (id, seen = new Set()) => {
  for (const s of stories) if (openWork(s) && s.depends_on.includes(id) && !seen.has(s.id)) { seen.add(s.id); dependents(s.id, seen); }
  return seen;
};
const count = (n) => (n ? `${n} ${n === 1 ? "story" : "stories"}` : "—");
const waiting = [];
for (const s of allLive.filter((s) => s.status === "blocked"))
  waiting.push({ rank: [0, sprintIdx(s.sprint)], when: "🔴 now", what: `**Unblock** ${link(s)} ${s.title}: answer the question in its Log`, by: s.sprint, unblocks: dependents(s.id).size });
for (const s of allLive.filter((s) => s.status === "review"))
  waiting.push({ rank: [1, sprintIdx(s.sprint)], when: "🔴 now", what: `**Review** ${link(s)} ${s.title}: check the work (PR or preview URL), then merge or approve it`, by: s.sprint, unblocks: dependents(s.id).size });
for (const g of groups.filter((g) => g.status === "review"))
  waiting.push({ rank: [2, sprintIdx(g.id)], when: "🔴 now", what: `**Approve the gate** [${g.id} · ${g.name}](${g.file}): tick "Approved by Caleb"`, by: g.id, unblocks: allLive.filter((s) => openWork(s) && sprintIdx(s.sprint) > sprintIdx(g.id) && s.sprint !== "backlog").length });
for (const d of decisions.filter((d) => d.status === "open"))
  waiting.push({ rank: [3, sprintIdx(d.sprint), 0, d.id], when: when(sprintIdx(d.sprint)), what: `**Decide** [${d.id}](decisions.md) ${d.decision}. Default if you don't: ${d.recommended}`, by: d.sprint, unblocks: allLive.filter((s) => openWork(s) && s.sprint === d.sprint).length });
for (const s of allLive.filter((s) => s.owner === "Caleb" && ["todo", "in-progress"].includes(s.status))) {
  const n = dependents(s.id).size;
  waiting.push({ rank: [3, sprintIdx(s.sprint), 1, -n, prioRank(s), s.id], when: when(sprintIdx(s.sprint)), what: `**Do** ${link(s)} ${s.title} (${s._ac.done}/${s._ac.total} done)`, by: s.sprint, unblocks: n });
}
const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i] === b[i]) continue; if (a[i] === undefined) return -1; if (b[i] === undefined) return 1; return typeof a[i] === "number" ? a[i] - b[i] : String(a[i]).localeCompare(String(b[i])); } return 0; };
waiting.sort((a, b) => cmp(a.rank, b.rank));
const nowCount = waiting.filter((w) => w.when === "🔴 now").length;

const wait = ["# Waiting on Caleb", "",
  "<!-- GENERATED by `node pm/scripts/board.mjs` — do not edit by hand. Edit decisions.md, story or sprint files instead. -->", "",
  `Everything that needs your decision, input or approval, in the order to handle it. Work from the top. **${nowCount} of ${waiting.length}** ${nowCount === 1 ? "is" : "are"} needed now${current >= 0 && current < groups.length - 1 ? ` (current sprint: ${groups[current].id} · ${groups[current].name})` : ""}.`, "",
  "| # | When | What to do | Needed by | Unblocks |", "| --- | --- | --- | --- | --- |",
  ...waiting.map((w, i) => `| ${i + 1} | ${w.when} | ${w.what} | ${w.by} | ${count(w.unblocks)} |`)];
if (!waiting.length) wait.push("| — | — | _Nothing is waiting on you._ | — | — |");
wait.push("", "## How to clear an item", "",
  "- **Decide:** in [decisions.md](decisions.md), set the row's Status to `decided` and fill in Choice and Date. Or tell Claude your choice and it will record it.",
  "- **Do:** finish the story's acceptance criteria and tell Claude. Your stories are inputs and approvals only Caleb can give.",
  "- **Review:** check the PR and its preview URL, then merge it. If there's no PR, tell Claude it's approved. The builder marks it `done` afterwards.",
  "- **Unblock:** read the question at the top of the story's Log and answer it.",
  "- **Approve the gate:** check the sprint's preview URL against its gate, then tick \"Approved by Caleb\".", "",
  "Order: anything that has stopped work comes first (blocked, in review, sprint gates). Then decisions and your stories, by the sprint that needs them; within a sprint, decisions first, then the story that unblocks the most work.", "",
  "🔴 now = needed by the current sprint or earlier · 🟡 next sprint · ⚪ later. **Unblocks** = open stories waiting on the item (for a decision: open stories in the sprint it blocks).", "");

out.push("", "## Waiting on Caleb", "", `**${waiting.length}** items, **${nowCount}** needed now. See [WAITING-ON-CALEB.md](WAITING-ON-CALEB.md) for the list, in the order to handle it.`);
if (warnings.length) out.push("", "## Warnings", "", ...warnings.map((w) => `- ⚠️ ${w}`));
for (const g of groups) {
  const list = stories.filter((s) => s.sprint === g.id).sort((a, b) => a.id.localeCompare(b.id));
  out.push("", `## ${g.id === "backlog" ? "Backlog" : `${g.id} · ${g.name}`}`, "", table(list));
}
out.push("", "---", "", "Legend: " + STORY_STATUSES.map((s) => `${ICON[s]} ${s}`).join(" · ") +
  " · **ready** = todo with all dependencies done · ~~US-000~~ = dependency done · AC = acceptance criteria checked/total", "");

const board = out.join("\n");
const boardPath = join(PM, "BOARD.md");

// Each sprint file holds its story list between BEGIN and END; the rest of the file is hand-written and kept as is.
const outputs = [{ path: boardPath, name: "BOARD.md", text: board },
  { path: join(PM, "WAITING-ON-CALEB.md"), name: "WAITING-ON-CALEB.md", text: wait.join("\n") }];
for (const sp of sprints) {
  const path = join(PM, sp._file);
  const current = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const start = current.indexOf(BEGIN), end = current.indexOf(END);
  if (start === -1 || end < start) { errors.push(`${sp._file}: missing the generated stories markers (copy them from templates/sprint.md)`); continue; }
  const list = stories.filter((s) => s.sprint === sp.id).sort((a, b) => a.id.localeCompare(b.id));
  const text = current.slice(0, start) + [BEGIN, "", table(list, "../"), "", END].join("\n") + current.slice(end + END.length);
  outputs.push({ path, name: sp._file, text });
}

for (const w of warnings) console.warn(`warn: ${w}`);
if (errors.length) { for (const e of errors) console.error(`error: ${e}`); process.exit(1); }
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8").replace(/\r\n/g, "\n") : "");
if (process.argv.includes("--check")) {
  const stale = outputs.filter((o) => read(o.path) !== o.text);
  if (stale.length) {
    for (const o of stale) console.error(`stale: ${o.name}`);
    console.error("Generated files are stale; run: node pm/scripts/board.mjs");
    process.exit(1);
  }
  console.log("All generated files are up to date.");
} else {
  for (const o of outputs) if (read(o.path) !== o.text) writeFileSync(o.path, o.text);
  console.log(`Generated files written: ${stories.length} stories across ${sprints.length} sprints.`);
}
