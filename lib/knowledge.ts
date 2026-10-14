import { loadContent, type Content } from "@/lib/content";
import type { Experience, Project } from "@/lib/content-schemas";

// One fact file, as the model reads it and as US-030 turns a citation into a link.
export type KnowledgeSource = {
  // The file path under content/ without its extension: "profile", "about", "projects/<slug>" (D-035).
  id: string;
  // The page that shows this source, always ending in a slash.
  href: string;
  // The section's text, without its tag line.
  text: string;
};

export type Knowledge = {
  // Every section, each starting with its `[src:<id>]` tag line. This is what the model and knowledge.txt get.
  text: string;
  sources: KnowledgeSource[];
};

// These are routes, not facts, so they can live here (D-035). A profile's email, location, socials and
// status are shown on the contact page, and an experience entry on the experience page.
const PROFILE_PAGE = "/contact/";
const ABOUT_PAGE = "/about/";
const SKILLS_PAGE = "/skills/";
const EXPERIENCE_PAGE = "/experience/";

// A fact that holds "[src:x]" would read as a section tag or a citation, to the model and to US-030's
// parser. The bracket becomes a parenthesis, so no pattern for a tag matches it.
function neutralise(text: string): string {
  return text.replace(/\[\s*src\s*:/gi, "(src:");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "Label: value" lines, leaving out a field that has no value.
function fields(entries: [label: string, value: string | undefined][]): string[] {
  return entries.flatMap(([label, value]) =>
    value === undefined || value === "" ? [] : [`${label}: ${value}`],
  );
}

function bulletList(heading: string, items: string[]): string[] {
  return items.length === 0 ? [] : [`${heading}:`, ...items.map((item) => `- ${item}`)];
}

function profileText({ profile }: Content): string {
  return [
    ...fields([
      ["Name", profile.name],
      ["Role", profile.role],
      ["Status", profile.status],
      ["Location", profile.location],
      ["Email", profile.email],
      ["CV", profile.links.cv],
      ["LinkedIn", profile.links.linkedin],
      ["GitHub", profile.links.github],
    ]),
    ...bulletList(
      "Elsewhere",
      profile.socials.map((social) => `${social.label}: ${social.href}`),
    ),
    // The headline pool holds stated facts, so it is part of what the site says about Caleb.
    ...bulletList("Highlights", profile.headlinePool),
  ].join("\n");
}

function skillsText({ skills }: Content): string {
  return [
    ...skills.categories.map((category) => `${category.name}: ${category.items.join(", ")}`),
    ...bulletList(
      "In practice",
      (skills.inPractice ?? []).map((entry) => `${entry.tool}: ${entry.project}`),
    ),
  ].join("\n");
}

function experienceText(entry: Experience): string {
  return [
    ...fields([
      ["Title", entry.title],
      ["Company", entry.company],
      ["Location", entry.location],
      ["Dates", `${entry.start} to ${entry.end}`],
      ["Tags", entry.tags.join(", ")],
    ]),
    ...entry.bullets.map((bullet) => `- ${bullet}`),
  ].join("\n");
}

function projectText(project: Project): string {
  const { problem, built, numbers, stack } = project.sections;
  return [
    ...fields([
      ["Title", project.title],
      ["Category", project.category],
      ["Dates", `${project.dates.start} to ${project.dates.end}`],
      ["Pitch", project.pitch],
    ]),
    ...bulletList(
      "Stats",
      project.stats.map((stat) => `${stat.value} ${stat.label}`),
    ),
    ...fields([
      ["Stack", project.stack.join(", ")],
      ["Repo", project.repo],
    ]),
    "## Problem",
    problem,
    "## What I built",
    built,
    "## Numbers",
    numbers,
    "## Stack",
    stack,
  ].join("\n");
}

// An experience entry has no file name once loaded, so its id comes from its company and title. It reads
// the same as the file name does for every current entry, and a repeat gets a number (D-042).
function experienceIds(content: Content): string[] {
  const used = new Set<string>();
  return content.experience.map((entry) => {
    const base = `experience/${slugify(`${entry.company} ${entry.title}`)}`;
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    return id;
  });
}

// Every fact file as one tagged section (Grounding 1). `commands.json` is navigation copy and `offlimits.md`
// goes into the prompt on its own, so neither is a source (D-035). The output depends only on `content`.
export function buildKnowledge(content: Content): Knowledge {
  const sources: KnowledgeSource[] = [
    { id: "profile", href: PROFILE_PAGE, text: profileText(content) },
    { id: "about", href: ABOUT_PAGE, text: content.about.body },
    { id: "skills", href: SKILLS_PAGE, text: skillsText(content) },
  ];

  const ids = experienceIds(content);
  content.experience.forEach((entry, index) => {
    sources.push({
      id: ids[index] ?? `experience/${index + 1}`,
      href: EXPERIENCE_PAGE,
      text: experienceText(entry),
    });
  });

  // Sorted by slug, so the pack doesn't depend on the order the files were read in.
  const projects = [...content.projects].sort((a, b) => a.slug.localeCompare(b.slug, "en"));
  for (const project of projects) {
    sources.push({
      id: `projects/${project.slug}`,
      href: `/projects/${project.slug}/`,
      text: projectText(project),
    });
  }

  const safe = sources.map((source) => ({ ...source, text: neutralise(source.text) }));
  const text = safe.map((source) => `[src:${source.id}]\n${source.text}`).join("\n\n") + "\n";
  return { text, sources: safe };
}

let cached: Knowledge | undefined;

// The pack for this server instance, built once. /api/chat (US-029) and the eval (US-034) both read it.
export function getKnowledge(): Knowledge {
  cached ??= buildKnowledge(loadContent());
  return cached;
}
