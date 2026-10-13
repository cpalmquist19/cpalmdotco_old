import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const script = join(root, "pm", "scripts", "board.mjs");

type Story = {
  id: string;
  status?: string;
  owner?: string;
  dependsOn?: string[];
  files?: string[];
  scoped?: boolean;
};

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function storyFile(story: Story): string {
  const scoped = story.scoped ?? true;
  // A scoped story needs some file; one of its own can't overlap with another story's
  const files = (story.files ?? [`\`notes/${story.id}.md\``]).map((f) => `- ${f}`).join("\n");
  return [
    "---",
    `id: ${story.id}`,
    `title: Story ${story.id}`,
    "sprint: S01",
    `status: ${story.status ?? "todo"}`,
    `owner: ${story.owner ?? "Claude"}`,
    "points: 1",
    "priority: P1",
    `depends_on: [${(story.dependsOn ?? []).join(", ")}]`,
    "spec: —",
    "---",
    "",
    `# ${story.id}`,
    "",
    "## Acceptance criteria",
    "",
    "- [x] Something",
    "",
    "## Files to touch",
    "",
    scoped ? files : "-",
    "",
    "## Out of scope",
    "",
    scoped ? "- Nothing" : "-",
    "",
    "## Tests to add",
    "",
    scoped ? "- None" : "-",
    "",
    "## Log",
    "",
  ].join("\n");
}

// board.mjs finds pm/ from its own location, so a copy in a temp pm/scripts/ runs on test data.
function setUpPm(stories: Story[]): string {
  const dir = mkdtempSync(join(tmpdir(), "board-"));
  tempDirs.push(dir);
  const pm = join(dir, "pm");
  for (const sub of ["scripts", "sprints", "stories"]) mkdirSync(join(pm, sub), { recursive: true });
  copyFileSync(script, join(pm, "scripts", "board.mjs"));
  writeFileSync(
    join(pm, "sprints", "S01-test.md"),
    [
      "---",
      "id: S01",
      "name: Test",
      "status: active",
      "---",
      "",
      "<!-- BEGIN GENERATED STORIES: run `node pm/scripts/board.mjs`, do not edit by hand -->",
      "<!-- END GENERATED STORIES -->",
      "",
    ].join("\n"),
  );
  writeFileSync(join(pm, "decisions.md"), "# Decisions\n\n## Decisions for Caleb\n\n## Decisions made during the build\n");
  for (const story of stories) writeFileSync(join(pm, "stories", `${story.id}-test.md`), storyFile(story));
  return pm;
}

function runBoard(stories: Story[]): string[] {
  return sharedFileWarnings(join(setUpPm(stories), "scripts", "board.mjs"));
}

function generatedBoard(stories: Story[]): string {
  const pm = setUpPm(stories);
  spawnSync(process.execPath, [join(pm, "scripts", "board.mjs")], { encoding: "utf8" });
  return readFileSync(join(pm, "BOARD.md"), "utf8");
}

// The story ids listed in BOARD.md's "Refine next" section
function refineNext(stories: Story[]): string[] {
  const section =
    generatedBoard(stories)
      .split(/^## /m)
      .find((s) => s.startsWith("Refine next")) ?? "";
  return [...section.matchAll(/^\| \[(US-\d+)\]/gm)].flatMap((m) => (m[1] ? [m[1]] : []));
}

function sharedFileWarnings(scriptPath: string, args: string[] = []): string[] {
  const result = spawnSync(process.execPath, [scriptPath, ...args], { encoding: "utf8" });
  return result.stderr.split("\n").filter((line) => line.includes("both touch"));
}

describe("US-055: shared-file check", () => {
  it("US-055: warns when two open stories touch the same file and neither depends on the other", () => {
    const warnings = runBoard([
      { id: "US-001", files: ["`lib/a.ts`: does one thing"] },
      { id: "US-002", files: ["`lib/a.ts`, `lib/b.ts`"] },
    ]);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("US-001 and US-002 both touch `lib/a.ts`");
  });

  it("US-055: no warning when one depends on the other, directly or through another story", () => {
    expect(
      runBoard([
        { id: "US-001", files: ["`lib/a.ts`"] },
        { id: "US-002", dependsOn: ["US-001"], files: ["`lib/a.ts`"] },
      ]),
    ).toEqual([]);
    expect(
      runBoard([
        { id: "US-001", files: ["`lib/a.ts`"] },
        { id: "US-002", dependsOn: ["US-001"] },
        { id: "US-003", dependsOn: ["US-002"], files: ["`lib/a.ts`"] },
      ]),
    ).toEqual([]);
  });

  it("US-055: a glob matches the files under it", () => {
    expect(
      runBoard([
        { id: "US-001", files: ["`components/shell/*.tsx`: only some"] },
        { id: "US-002", files: ["`components/shell/Sidebar.tsx`"] },
      ]),
    ).toHaveLength(1);
    expect(
      runBoard([
        { id: "US-001", files: ["`tests/fixtures/**`"] },
        { id: "US-002", files: ["`tests/fixtures/content/profile.json`"] },
      ]),
    ).toHaveLength(1);
    // A single * stays within one folder
    expect(
      runBoard([
        { id: "US-001", files: ["`components/shell/*.tsx`"] },
        { id: "US-002", files: ["`components/shell/parts/Row.tsx`"] },
      ]),
    ).toEqual([]);
  });

  it("US-055: done stories and pm/ files are ignored", () => {
    expect(
      runBoard([
        { id: "US-001", status: "done", files: ["`lib/a.ts`"] },
        { id: "US-002", files: ["`lib/a.ts`"] },
      ]),
    ).toEqual([]);
    expect(
      runBoard([
        { id: "US-001", files: ["`pm/decisions.md`: a row"] },
        { id: "US-002", files: ["`pm/decisions.md`: another row"] },
      ]),
    ).toEqual([]);
  });

  it("US-055: only paths before the description count", () => {
    expect(
      runBoard([
        { id: "US-001", files: ["`lib/a.ts`: imports `lib/b.ts`, run `npm install zod`"] },
        { id: "US-002", files: ["`lib/b.ts`"] },
      ]),
    ).toEqual([]);
  });

  it("US-055: the committed stories have no unordered shared files", () => {
    expect(sharedFileWarnings(script, ["--check"])).toEqual([]);
  });
});

describe("US-056: Refine next", () => {
  it("US-056: an unscoped story whose dependency is ready is listed", () => {
    expect(refineNext([{ id: "US-001" }, { id: "US-002", dependsOn: ["US-001"], scoped: false }])).toEqual([
      "US-002",
    ]);
  });

  it("US-056: an unscoped story whose dependency is in progress is listed", () => {
    expect(
      refineNext([
        { id: "US-001", status: "in-progress" },
        { id: "US-002", dependsOn: ["US-001"], scoped: false },
      ]),
    ).toEqual(["US-002"]);
  });

  it("US-056: scoped, startable, Caleb-owned and two-steps-away stories aren't listed", () => {
    expect(
      refineNext([
        { id: "US-001" },
        { id: "US-002", dependsOn: ["US-001"] },
        { id: "US-003", scoped: false },
        { id: "US-004", dependsOn: ["US-001"], owner: "Caleb", scoped: false },
        { id: "US-005", dependsOn: ["US-002"], scoped: false },
      ]),
    ).toEqual([]);
  });

  it("US-056: the list says None when there's nothing to scope", () => {
    expect(generatedBoard([{ id: "US-001" }])).toMatch(/## Refine next\n\n.*\n\n_None\._/);
  });
});
