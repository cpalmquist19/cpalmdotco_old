import { expect, test, type Locator, type Page } from "@playwright/test";
import { loadContent, type Content } from "@/lib/content";
import type { Command } from "@/lib/content-schemas";

const { profile, commands, projects }: Content = loadContent();

// The ASK ABOUT pages in the order profile.json sets. loadContent() has already checked each name.
const askAbout = profile.sidebar.askAbout.flatMap((name) =>
  commands.filter((command) => command.command === name),
);

// Every content page: the ASK ABOUT pages, /cv/, and each case study.
const routes = [
  ...askAbout.map((command) => command.answer),
  "/cv/",
  ...projects.map((project) => `/projects/${project.slug}/`),
];

function commandFor(name: string): Command {
  const command = commands.find((item) => item.command === name);
  if (!command) throw new Error(`commands.json has no command ${name}`);
  return command;
}

// The background a filled button would have in this theme, read from the same token.
// Lists every visible link or button whose background matches it (the same check as topbar.spec.ts).
async function filledControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--cta-bg)";
    document.body.append(probe);
    const filled = getComputedStyle(probe).backgroundColor;
    probe.remove();

    return [...document.querySelectorAll("a, button")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== "hidden" &&
          style.backgroundColor === filled
        );
      })
      .map((element) => (element.textContent ?? "").trim());
  });
}

// Clicks the link, then checks the page it opens is `href` and its H1 is `heading`.
async function followLink(page: Page, link: Locator, href: string, heading: string) {
  const target = new URL(href, page.url()).href;
  await link.click();
  await expect(page).toHaveURL(target);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
}

for (const route of routes) {
  test(`US-018 F5.1: ${route} has the template`, async ({ page }) => {
    await page.goto(route);

    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test(`US-018 F5.6: ${route} footer has the chat and CV buttons, the nav and the social links`, async ({
    page,
  }) => {
    await page.goto(route);
    const footer = page.getByRole("contentinfo");

    await expect(footer.getByRole("link", { name: "Ask me in the chat" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(footer.getByRole("link", { name: "CV (PDF)" })).toHaveAttribute(
      "href",
      profile.links.cv,
    );
    await expect(footer.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveText(
      askAbout.map((command) => command.label),
    );
    await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      profile.links.linkedin,
    );
    await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      profile.links.github,
    );
  });
}

test.describe("content pages in light", () => {
  // The F2.4 check is about the light theme. US-007 covers both themes on the home page.
  test.use({ colorScheme: "light" });

  for (const route of routes) {
    test(`US-018 F2.4: ${route} has one filled button, the top-bar CV`, async ({ page }) => {
      await page.goto(route);

      expect(await filledControls(page)).toEqual(["CV"]);
    });
  }
});

// Runs in every project. The no-js project is the one where JavaScript is off (F5.5).
test("US-018 F5.5: links work with JavaScript off", async ({ page }) => {
  const about = commandFor("/about");
  const experience = commandFor("/experience");

  await page.goto("/about/");
  await followLink(
    page,
    page.getByRole("navigation", { name: "Related pages" }).getByRole("link", {
      name: experience.label,
    }),
    experience.answer,
    experience.description,
  );

  await page.goto("/skills/");
  await followLink(
    page,
    page
      .getByRole("contentinfo")
      .getByRole("navigation", { name: "Footer" })
      .getByRole("link", { name: about.label }),
    about.answer,
    about.description,
  );

  await page.goto("/projects/");
  const firstProject = page.getByRole("list", { name: "Projects" }).getByRole("link").first();
  const href = await firstProject.getAttribute("href");
  const title = await firstProject.textContent();
  if (href === null || title === null) throw new Error("the first project title has no link");
  await followLink(page, firstProject, href, title.trim());
});
