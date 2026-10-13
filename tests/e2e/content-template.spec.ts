import { expect, test, type Locator } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };

// The contact page is the template's first real user. Its command gives the eyebrow, H1 and intro.
const contact = commandsData.find((item) => item.command === "/contact");
if (!contact?.intro) throw new Error("commands.json needs a /contact command with an intro");

function commandFor(name: string) {
  const command = commandsData.find((item) => item.command === name);
  if (!command) throw new Error(`commands.json has no command ${name}`);
  return command;
}

// The two ASK ABOUT pages after /contact, wrapping round, in the order profile.json sets.
const askAbout = profileData.sidebar.askAbout.map(commandFor);
const index = askAbout.findIndex((command) => command.command === "/contact");
const expectedLinks = [...askAbout.slice(index + 1), ...askAbout.slice(0, index + 1)]
  .slice(0, 2)
  .map((command) => ({ label: command.label, href: command.answer }));

async function topOf(locator: Locator): Promise<number> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`no bounding box for ${locator}`);
  return box.y;
}

test.describe("content page template", () => {
  test("US-013 F5.1: breadcrumb is a nav with Home and the current page", async ({ page }) => {
    await page.goto("/contact/");
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

    await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(breadcrumb.locator("[aria-current='page']")).toHaveText("/contact");
  });

  test("US-013 F5.1: template parts appear in order", async ({ page }) => {
    await page.goto("/contact/");
    const main = page.getByRole("main");

    const positions = [
      await topOf(page.getByRole("navigation", { name: "Breadcrumb" })),
      await topOf(main.getByText(contact.label, { exact: true })),
      await topOf(page.getByRole("heading", { level: 1 })),
      await topOf(main.getByText(contact.intro, { exact: true })),
      await topOf(main.locator("dl")),
      await topOf(page.getByRole("navigation", { name: "Related pages" })),
      await topOf(page.getByRole("contentinfo")),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(new Set(positions).size).toBe(positions.length);
  });

  test("US-013 F5.1: cross-links are the next two ASK ABOUT pages", async ({ page }) => {
    await page.goto("/contact/");
    const links = page.getByRole("navigation", { name: "Related pages" }).getByRole("link");

    await expect(links).toHaveText(expectedLinks.map((link) => link.label));
    expect(await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual(
      expectedLinks.map((link) => link.href),
    );
  });

  test("US-013 F5.6: footer has the chat and CV buttons, the nav and the social links", async ({
    page,
  }) => {
    await page.goto("/contact/");
    const footer = page.getByRole("contentinfo");

    await expect(footer.getByRole("link", { name: "Ask me in the chat" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(footer.getByRole("link", { name: "CV (PDF)" })).toHaveAttribute(
      "href",
      profileData.links.cv,
    );
    await expect(footer.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveText(
      askAbout.map((command) => command.label),
    );
    await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      profileData.links.linkedin,
    );
    await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      profileData.links.github,
    );
  });

  test("US-013 F2.4: footer buttons are outlined", async ({ page }) => {
    await page.goto("/contact/");
    const footer = page.getByRole("contentinfo");
    // The colour a filled button would have in this theme, read from the same token.
    const filled = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--cta-bg)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });

    for (const name of ["Ask me in the chat", "CV (PDF)"]) {
      const background = await footer
        .getByRole("link", { name })
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(background, name).not.toBe(filled);
    }
  });
});
