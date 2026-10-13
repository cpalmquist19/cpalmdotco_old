import { expect, test } from "@playwright/test";
import { loadContent } from "@/lib/content";
import type { Project } from "@/lib/content-schemas";
import { formatRange } from "@/lib/dates";

// The projects as the files define them, read the same way the pages read them.
const projects = loadContent().projects;

// Newest start first, then title: the order the feed shows (F5.3).
const newestFirst = [...projects].sort(
  (a, b) => b.dates.start.localeCompare(a.dates.start) || a.title.localeCompare(b.title),
);

// The stats line as the card and the case study show it: "value label", joined with " · ".
function statsLine(project: Project): string {
  return project.stats.map((stat) => `${stat.value} ${stat.label}`).join(" · ");
}

// The text of a section without Markdown bullets, so each line can be found on the page.
function plainLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter((line) => line !== "");
}

test("US-016 F5.3: feed shows one card per project, newest first", async ({ page }) => {
  await page.goto("/projects/");
  const cards = page.locator('ol[aria-label="Projects"] > li > article');

  await expect(cards).toHaveCount(projects.length);
  await expect(cards.getByRole("heading", { level: 2 })).toHaveText(
    newestFirst.map((project) => project.title),
  );
});

test("US-016 F5.3: each card has a meta line, linked title, pitch and stats line", async ({
  page,
}) => {
  await page.goto("/projects/");
  const cards = page.locator('ol[aria-label="Projects"] > li > article');

  for (const [index, project] of newestFirst.entries()) {
    const card = cards.nth(index);
    await expect(
      card.getByText(
        `${project.category} · ${formatRange(project.dates.start, project.dates.end)}`,
        {
          exact: true,
        },
      ),
    ).toBeVisible();
    await expect(card.getByRole("link", { name: project.title })).toHaveAttribute(
      "href",
      `/projects/${project.slug}/`,
    );
    await expect(card.getByText(project.pitch, { exact: true })).toBeVisible();
    for (const stat of project.stats) {
      await expect(card).toContainText(stat.value);
      await expect(card).toContainText(stat.label);
    }
    await expect(card).toContainText(statsLine(project));
  }
});

test("US-016 F5.3: case study shows the four sections", async ({ page }) => {
  for (const project of projects) {
    await page.goto(`/projects/${project.slug}/`);
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { level: 2 })).toHaveText([
      "Problem",
      "What I built",
      "Numbers",
      "Stack",
    ]);
    const sections = [project.sections.problem, project.sections.built, project.sections.numbers];
    for (const [index, text] of sections.entries()) {
      const section = main.locator("section").nth(index);
      for (const line of plainLines(text)) {
        await expect(section).toContainText(line);
      }
    }
    await expect(main.locator("section").nth(3)).toContainText(project.sections.stack);
  }
});

test("US-016 F5.3: case study shows the stack as tags and the repo link when there is one", async ({
  page,
}) => {
  for (const project of projects) {
    await page.goto(`/projects/${project.slug}/`);
    const main = page.getByRole("main");

    await expect(main.getByRole("list", { name: "Stack" }).getByRole("listitem")).toHaveText(
      project.stack,
    );
    const repo = main.getByRole("link", { name: "View the code" });
    if (project.repo === undefined) {
      await expect(repo).toHaveCount(0);
    } else {
      await expect(repo).toHaveAttribute("href", project.repo);
    }
  }
});

test("US-016 F5.1: case study breadcrumb is Home / /projects / title", async ({ page }) => {
  const [project] = newestFirst;
  if (!project) throw new Error("content/projects has no project");
  await page.goto(`/projects/${project.slug}/`);
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(breadcrumb.getByRole("link", { name: "/projects" })).toHaveAttribute(
    "href",
    "/projects/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(project.title);
});

test("US-016 F5.5: an unknown slug is a 404", async ({ page }) => {
  const response = await page.goto("/projects/no-such-project/");

  expect(response?.status()).toBe(404);
});
