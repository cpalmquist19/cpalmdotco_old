import type { Command, Project } from "@/lib/content-schemas";
import type { KnowledgeSource } from "@/lib/knowledge";

// The page links that end an answer (F4.4). The model never writes a URL: these come from the sources it cited.
export type AnswerLink = { label: string; href: string };

// An answer with no valid citation links here, so no answer is a dead end (F4.4, D-047).
const CONTACT_PAGE = "/contact/";

// The label for a page: a project's title, or the label of the commands.json entry that answers with that page.
// A page with neither is left out, since a made-up label would be a fact the content doesn't hold (CODING § 7).
function labelFor(href: string, commands: readonly Command[], projects: readonly Project[]) {
  const project = projects.find((item) => `/projects/${item.slug}/` === href);
  if (project !== undefined) return project.title;
  return commands.find((command) => command.answer === href)?.label;
}

// Walks the cited ids in order, skips unknown ids and a page already linked, and stops at two (D-047).
export function linksFor(
  cited: readonly string[],
  {
    sources,
    commands,
    projects,
  }: {
    sources: readonly Pick<KnowledgeSource, "id" | "href">[];
    commands: readonly Command[];
    projects: readonly Project[];
  },
): AnswerLink[] {
  const byId = new Map(sources.map((source) => [source.id, source.href]));
  const pages = cited.flatMap((id) => {
    const href = byId.get(id);
    return href === undefined ? [] : [href];
  });
  // Nothing valid was cited, so the answer behaves as if it had cited the profile, whose page is Contact.
  const candidates = pages.length > 0 ? pages : [CONTACT_PAGE];

  const links: AnswerLink[] = [];
  for (const href of candidates) {
    if (links.length === 2) break;
    if (links.some((link) => link.href === href)) continue;
    const label = labelFor(href, commands, projects);
    if (label !== undefined) links.push({ label, href });
  }
  return links;
}
