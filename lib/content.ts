import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  commandsSchema,
  experienceFrontmatterSchema,
  profileSchema,
  projectFrontmatterSchema,
  skillsSchema,
  type Command,
  type Experience,
  type Profile,
  type Project,
  type ProjectSections,
  type Skills,
} from "@/lib/content-schemas";

// Read at build time (and in `next dev`, on every request: no caching, so content refreshes).
// Client components must import types from lib/content-schemas.ts, never from this file.
// Resolved on each call, so a test can point the getters at another folder.
export function contentDir(): string {
  return path.join(process.cwd(), "content");
}

const PROJECT_SECTIONS = ["Problem", "What I built", "Numbers", "Stack"];

export type Content = {
  profile: Profile;
  commands: Command[];
  skills: Skills;
  experience: Experience[];
  projects: Project[];
};

// One line per problem, so a build log shows every broken file at once.
export class ContentError extends Error {
  constructor(problems: string[]) {
    super(problems.join("\n"));
    this.name = "ContentError";
  }
}

function problem(file: string, field: string, message: string): string {
  return `content/${file}: ${field}: ${message}`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function zodProblems(file: string, error: z.ZodError): string[] {
  return error.issues.flatMap((issue) => {
    const at = issue.path.map(String);
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => problem(file, [...at, key].join("."), "is not a known field"));
    }
    return [problem(file, at.length > 0 ? at.join(".") : "(root)", issue.message)];
  });
}

// Returns the parsed value, or undefined after recording every problem in `problems`.
function check<T>(
  schema: z.ZodType<T>,
  value: unknown,
  file: string,
  problems: string[],
): T | undefined {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  problems.push(...zodProblems(file, result.error));
  return undefined;
}

function readText(dir: string, file: string, problems: string[]): string | undefined {
  const full = path.join(dir, file);
  if (!existsSync(full)) {
    problems.push(problem(file, "(file)", "is missing"));
    return undefined;
  }
  // Windows line endings are normal in this repo, so normalise before parsing.
  return readFileSync(full, "utf8").replace(/\r\n/g, "\n");
}

function readJson<T>(
  dir: string,
  file: string,
  schema: z.ZodType<T>,
  problems: string[],
): T | undefined {
  const text = readText(dir, file, problems);
  if (text === undefined) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    problems.push(problem(file, "(root)", `is not valid JSON: ${messageOf(error)}`));
    return undefined;
  }
  return check(schema, value, file, problems);
}

// Splits "---" frontmatter from the body. Returns undefined when there is no frontmatter block.
export function splitFrontmatter(text: string): { frontmatter: string; body: string } | undefined {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return undefined;
  const end = lines.indexOf("---", 1);
  if (end === -1) return undefined;
  return {
    frontmatter: lines.slice(1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
  };
}

function readMarkdown(
  dir: string,
  file: string,
  problems: string[],
): { frontmatter: unknown; body: string } | undefined {
  const text = readText(dir, file, problems);
  if (text === undefined) return undefined;
  const parts = splitFrontmatter(text);
  if (parts === undefined) {
    problems.push(problem(file, "(frontmatter)", "needs a --- frontmatter block"));
    return undefined;
  }
  try {
    return { frontmatter: parseYaml(parts.frontmatter), body: parts.body };
  } catch (error) {
    problems.push(problem(file, "(frontmatter)", `is not valid YAML: ${messageOf(error)}`));
    return undefined;
  }
}

// The Markdown files in a folder, sorted by file name. A missing folder is an empty list.
function markdownFiles(dir: string, folder: string): string[] {
  const full = path.join(dir, folder);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => `${folder}/${name}`);
}

type Bullets = { ok: true; items: string[] } | { ok: false; message: string };

function bulletsOf(body: string): Bullets {
  const items: string[] = [];
  for (const line of body.split("\n")) {
    if (line.trim() === "") continue;
    const item = /^[-*] (.+)$/.exec(line)?.[1]?.trim();
    if (!item)
      return {
        ok: false,
        message: `every line must be a "- " bullet, but "${line.trim()}" is not`,
      };
    items.push(item);
  }
  if (items.length === 0) return { ok: false, message: "needs at least one bullet" };
  return { ok: true, items };
}

type Sections = { ok: true; value: ProjectSections } | { ok: false; message: string };

function sectionsOf(body: string): Sections {
  const headings: { name: string; lines: string[] }[] = [];
  for (const line of body.split("\n")) {
    const heading = /^## (.+)$/.exec(line)?.[1];
    if (heading !== undefined) {
      headings.push({ name: heading.trim(), lines: [] });
      continue;
    }
    const current = headings[headings.length - 1];
    if (current === undefined) {
      if (line.trim() !== "") return { ok: false, message: "has text before the first ## section" };
      continue;
    }
    current.lines.push(line);
  }

  const names = headings.map((heading) => heading.name);
  if (
    names.length !== PROJECT_SECTIONS.length ||
    names.some((name, index) => name !== PROJECT_SECTIONS[index])
  ) {
    return {
      ok: false,
      message: `needs exactly these ## sections, in order: ${PROJECT_SECTIONS.join(", ")}`,
    };
  }

  const text = (name: string): string =>
    (headings.find((heading) => heading.name === name)?.lines ?? []).join("\n").trim();
  const value = {
    problem: text("Problem"),
    built: text("What I built"),
    numbers: text("Numbers"),
    stack: text("Stack"),
  };
  const empty = PROJECT_SECTIONS.filter((name) => text(name) === "");
  if (empty.length > 0)
    return { ok: false, message: `these sections are empty: ${empty.join(", ")}` };
  return { ok: true, value };
}

function readExperience(dir: string, file: string, problems: string[]): Experience | undefined {
  const doc = readMarkdown(dir, file, problems);
  if (doc === undefined) return undefined;
  const bullets = bulletsOf(doc.body);
  if (!bullets.ok) problems.push(problem(file, "body", bullets.message));
  const frontmatter = check(experienceFrontmatterSchema, doc.frontmatter, file, problems);
  if (!bullets.ok || frontmatter === undefined) return undefined;
  return { ...frontmatter, bullets: bullets.items };
}

function readProject(dir: string, file: string, problems: string[]): Project | undefined {
  const doc = readMarkdown(dir, file, problems);
  if (doc === undefined) return undefined;
  const sections = sectionsOf(doc.body);
  if (!sections.ok) problems.push(problem(file, "body", sections.message));
  const frontmatter = check(projectFrontmatterSchema, doc.frontmatter, file, problems);
  if (frontmatter === undefined || !sections.ok) return undefined;
  const fileName = path.basename(file, ".md");
  if (frontmatter.slug !== fileName) {
    problems.push(problem(file, "slug", `must equal the file name "${fileName}"`));
  }
  return { ...frontmatter, sections: sections.value };
}

function commandProblems(profile: Profile, commands: Command[]): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];
  for (const { command } of commands) {
    if (seen.has(command))
      problems.push(problem("commands.json", "command", `"${command}" is defined more than once`));
    seen.add(command);
  }
  for (const name of profile.sidebar.askAbout) {
    if (!seen.has(name)) {
      problems.push(
        problem("profile.json", "sidebar.askAbout", `"${name}" is not a command in commands.json`),
      );
    }
  }
  return problems;
}

export function loadContent(dir = contentDir()): Content {
  const problems: string[] = [];
  const profile = readJson(dir, "profile.json", profileSchema, problems);
  const commands = readJson(dir, "commands.json", commandsSchema, problems);
  const skills = readJson(dir, "skills.json", skillsSchema, problems);

  const experience: Experience[] = [];
  for (const file of markdownFiles(dir, "experience")) {
    const item = readExperience(dir, file, problems);
    if (item !== undefined) experience.push(item);
  }

  const projects: Project[] = [];
  const projectFileBySlug = new Map<string, string>();
  for (const file of markdownFiles(dir, "projects")) {
    const project = readProject(dir, file, problems);
    if (project === undefined) continue;
    const first = projectFileBySlug.get(project.slug);
    if (first === undefined) {
      projectFileBySlug.set(project.slug, file);
    } else {
      problems.push(problem(file, "slug", `"${project.slug}" is already used by content/${first}`));
    }
    projects.push(project);
  }

  if (profile !== undefined && commands !== undefined) {
    problems.push(...commandProblems(profile, commands));
  }
  if (
    problems.length > 0 ||
    profile === undefined ||
    commands === undefined ||
    skills === undefined
  ) {
    throw new ContentError(problems);
  }

  return {
    profile,
    commands: commands.sort((a, b) => a.order - b.order),
    skills,
    experience: experience.sort((a, b) => a.order - b.order),
    projects,
  };
}

export function getProfile(): Profile {
  return loadContent().profile;
}

export function getCommands(): Command[] {
  return loadContent().commands;
}

export function getSkills(): Skills {
  return loadContent().skills;
}

export function getExperience(): Experience[] {
  return loadContent().experience;
}

export function getProjects(): Project[] {
  return loadContent().projects;
}

function isMarked(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "placeholder" in value &&
    value.placeholder === true
  );
}

// Reads the file without validating it, so it also works for about.md and offlimits.md.
export function isPlaceholder(file: string, dir = contentDir()): boolean {
  const text = readFileSync(path.join(dir, file), "utf8");
  if (file.endsWith(".json")) {
    const data: unknown = JSON.parse(text);
    // commands.json is an array, so a placeholder entry marks the whole file (D-016).
    return Array.isArray(data) ? data.some(isMarked) : isMarked(data);
  }
  const parts = splitFrontmatter(text);
  if (parts === undefined) return false;
  return isMarked(parseYaml(parts.frontmatter));
}
