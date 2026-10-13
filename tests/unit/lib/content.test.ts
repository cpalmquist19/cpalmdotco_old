import { copyFileSync, cpSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ContentError,
  getCommands,
  getExperience,
  getProfile,
  getProjects,
  isPlaceholder,
  loadContent,
} from "@/lib/content";
import {
  copyFixture,
  dropLine,
  FIXTURE_DIR,
  removeFolder,
  rewrite,
} from "@/tests/unit/helpers/content-fixture";

// The message of the error loadContent throws, so a test can check every line of it.
function thrownMessage(load: () => unknown): string {
  try {
    load();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("expected the load to throw");
}

describe("US-011", () => {
  let dir: string;

  beforeEach(() => {
    dir = copyFixture();
  });

  afterEach(() => {
    removeFolder(dir);
  });

  it("US-011: loadContent returns every file from valid content", () => {
    const content = loadContent(dir);

    expect(content.profile.name).toBe("Alex Sample");
    expect(content.commands.map((command) => command.command)).toEqual(["/about", "/projects"]);
    expect(content.skills.categories).toHaveLength(1);
    expect(content.experience.map((item) => item.company)).toEqual([
      "Northwind Systems",
      "Atlas Labs",
    ]);
    expect(content.projects.map((project) => project.slug)).toEqual(["atlas-api"]);
  });

  it("US-011: a missing required field throws an error naming the file and the field", () => {
    dropLine(dir, "profile.json", "role");

    expect(() => loadContent(dir)).toThrow(ContentError);
    expect(thrownMessage(() => loadContent(dir))).toMatch(/content\/profile\.json: role: /);
  });

  it("US-011: every problem is reported, one per line", () => {
    dropLine(dir, "profile.json", "role");
    dropLine(dir, "experience/atlas-labs.md", "start");

    const lines = thrownMessage(() => loadContent(dir)).split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^content\/profile\.json: role: /);
    expect(lines[1]).toMatch(/^content\/experience\/atlas-labs\.md: start: /);
  });

  it("US-011: a missing profile.json fails", () => {
    unlinkSync(path.join(dir, "profile.json"));

    expect(thrownMessage(() => loadContent(dir))).toContain(
      "content/profile.json: (file): is missing",
    );
  });

  it("US-011: a missing experience or projects folder loads as an empty list", () => {
    rmSync(path.join(dir, "experience"), { recursive: true });
    rmSync(path.join(dir, "projects"), { recursive: true });

    const content = loadContent(dir);

    expect(content.experience).toEqual([]);
    expect(content.projects).toEqual([]);
  });

  it("US-011: experience body must be a bullet list", () => {
    const file = "experience/northwind-qa.md";
    rewrite(
      dir,
      file,
      "- Ran the weekly smoke pass with the support team",
      "Ran the weekly smoke pass.",
    );

    expect(thrownMessage(() => loadContent(dir))).toMatch(
      /content\/experience\/northwind-qa\.md: body: .*"- "/,
    );
  });

  it("US-011: experience body needs at least one bullet", () => {
    rewrite(dir, "experience/northwind-qa.md", /^- .*$/gm, "");

    expect(thrownMessage(() => loadContent(dir))).toContain(
      "content/experience/northwind-qa.md: body: needs at least one bullet",
    );
  });

  it("US-011: project body needs the Problem, What I built, Numbers and Stack sections", () => {
    rewrite(dir, "projects/atlas-api.md", "## Numbers", "## Results");

    expect(thrownMessage(() => loadContent(dir))).toContain(
      "content/projects/atlas-api.md: body: needs exactly these ## sections, in order: Problem, What I built, Numbers, Stack",
    );
  });

  it("US-011: sidebar.askAbout naming an unknown command fails", () => {
    rewrite(dir, "profile.json", '"/projects"]', '"/missing"]');

    expect(thrownMessage(() => loadContent(dir))).toContain(
      'content/profile.json: sidebar.askAbout: "/missing" is not a command in commands.json',
    );
  });

  it("US-011: duplicate command names fail", () => {
    rewrite(dir, "commands.json", '"command": "/projects"', '"command": "/about"');

    expect(thrownMessage(() => loadContent(dir))).toContain(
      'content/commands.json: command: "/about" is defined more than once',
    );
  });

  it("US-011: duplicate project slugs fail", () => {
    copyFileSync(
      path.join(dir, "projects/atlas-api.md"),
      path.join(dir, "projects/atlas-api-copy.md"),
    );

    expect(thrownMessage(() => loadContent(dir))).toContain(
      '"atlas-api" is already used by content/projects/',
    );
  });

  it("US-011: a project slug that differs from its file name fails", () => {
    rewrite(dir, "projects/atlas-api.md", "slug: atlas-api", "slug: atlas-other");

    expect(thrownMessage(() => loadContent(dir))).toContain(
      'content/projects/atlas-api.md: slug: must equal the file name "atlas-api"',
    );
  });

  it("US-011: experience and commands come back sorted by order", () => {
    // The files sort by name the other way round, so only the order field can put them in this sequence.
    const content = loadContent(dir);

    expect(content.experience.map((item) => item.order)).toEqual([1, 2]);
    expect(content.experience[0]?.company).toBe("Northwind Systems");
    expect(content.commands.map((command) => command.order)).toEqual([1, 2]);
  });

  it("US-011: a file with Windows line endings loads", () => {
    rewrite(dir, "experience/northwind-qa.md", /\n/g, "\r\n");
    rewrite(dir, "profile.json", /\n/g, "\r\n");

    const content = loadContent(dir);

    expect(content.experience[0]?.bullets).toEqual([
      "Wrote the regression plan for the billing release",
      "Ran the weekly smoke pass with the support team",
    ]);
  });

  it("US-011: isPlaceholder is true for marked JSON and Markdown, false for unmarked, and true when any commands entry is marked", () => {
    expect(isPlaceholder("profile.json", dir)).toBe(false);
    expect(isPlaceholder("experience/northwind-qa.md", dir)).toBe(false);
    expect(isPlaceholder("commands.json", dir)).toBe(false);

    rewrite(dir, "profile.json", "{\n", '{\n  "placeholder": true,\n');
    rewrite(dir, "experience/northwind-qa.md", "---\n", "---\nplaceholder: true\n");
    expect(isPlaceholder("profile.json", dir)).toBe(true);
    expect(isPlaceholder("experience/northwind-qa.md", dir)).toBe(true);

    rewrite(dir, "commands.json", '"order": 1', '"order": 1,\n    "placeholder": true');
    expect(isPlaceholder("commands.json", dir)).toBe(true);
  });

  it("US-011: one bad file fails every getter, so it fails any page that reads content", () => {
    // The getters read process.cwd()/content, so point that at a copy of the fixture with one broken file.
    const root = mkdtempSync(path.join(os.tmpdir(), "content-root-"));
    cpSync(FIXTURE_DIR, path.join(root, "content"), { recursive: true });
    rewrite(
      path.join(root, "content"),
      "skills.json",
      '"items": ["Playwright", "Vitest"]',
      '"items": []',
    );
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(root);
    try {
      expect(() => getProfile()).toThrow(ContentError);
      expect(() => getCommands()).toThrow(ContentError);
      expect(() => getExperience()).toThrow(ContentError);
      expect(() => getProjects()).toThrow(ContentError);
    } finally {
      cwd.mockRestore();
      removeFolder(root);
    }
  });

  it("US-011: the committed content/ folder validates", () => {
    const content = loadContent();

    expect(content.profile.placeholder).toBe(true);
    expect(content.commands).toHaveLength(5);
  });
});

describe("US-014", () => {
  let dir: string;

  beforeEach(() => {
    dir = copyFixture();
  });

  afterEach(() => {
    removeFolder(dir);
  });

  it("US-014: about.md loads with its body", () => {
    const content = loadContent(dir);

    expect(content.about.placeholder).toBe(true);
    expect(content.about.body).toMatch(/^I started on a support desk/);
    expect(content.about.body).toContain("I test software");
  });

  it("US-014: about.md with an unknown frontmatter key fails", () => {
    rewrite(dir, "about.md", "placeholder: true", "placeholder: true\nnickname: Al");

    expect(thrownMessage(() => loadContent(dir))).toMatch(
      /content\/about\.md: nickname: is not a known field/,
    );
  });

  it("US-014: an empty about.md body fails", () => {
    writeFileSync(path.join(dir, "about.md"), "---\nplaceholder: true\n---\n\n   \n");

    expect(thrownMessage(() => loadContent(dir))).toMatch(/content\/about\.md: body: is empty/);
  });

  it("US-014: a missing about.md fails", () => {
    unlinkSync(path.join(dir, "about.md"));

    expect(thrownMessage(() => loadContent(dir))).toMatch(
      /content\/about\.md: \(file\): is missing/,
    );
  });
});
