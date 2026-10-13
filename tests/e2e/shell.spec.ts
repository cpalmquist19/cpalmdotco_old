import { expect, test, type Locator } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };

type Box = { x: number; y: number; width: number; height: number };

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`no bounding box for ${locator}`);
  return box;
}

function commandFor(name: string) {
  const command = commandsData.find((item) => item.command === name);
  if (!command) throw new Error(`commands.json has no command ${name}`);
  return command;
}

// Mirrors profile.sidebar.askAbout, which sets the order of the ASK ABOUT list.
const askAbout = profileData.sidebar.askAbout.map(commandFor);
const askLabels = askAbout.map((command) => command.label);
const projectLabels = profileData.sidebar.projects.map((project) => project.label);

test.describe("app shell and sidebar", () => {
  test("US-005 F0.1: sidebar is 320 px wide @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });

    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(320);
  });

  test("US-005 F0.1: sidebar sections appear in order @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await expect(sidebar).toBeVisible();

    // The identity row items sit side by side, so compare them left to right and
    // require each to start above the sections that come after the row.
    const avatar = await boxOf(page.getByTestId("avatar"));
    const name = await boxOf(sidebar.getByText(profileData.name, { exact: true }));
    const collapse = await boxOf(page.getByRole("button", { name: "Collapse sidebar" }));
    expect(avatar.x).toBeLessThan(name.x);
    expect(name.x).toBeLessThan(collapse.x);

    const newChat = await boxOf(page.getByRole("button", { name: "New chat" }));
    expect(Math.max(avatar.y, name.y, collapse.y)).toBeLessThan(newChat.y);

    const sectionTops = [
      newChat.y,
      (await boxOf(sidebar.getByRole("heading", { name: "ASK ABOUT" }))).y,
      (await boxOf(sidebar.getByRole("list", { name: "ASK ABOUT" }).getByRole("link").first())).y,
      (await boxOf(sidebar.getByRole("heading", { name: "PROJECTS" }))).y,
      (await boxOf(sidebar.getByRole("list", { name: "PROJECTS" }).getByRole("link").first())).y,
      (await boxOf(page.getByRole("navigation", { name: "Social" }))).y,
    ];
    for (let index = 1; index < sectionTops.length; index++) {
      expect(sectionTops[index]).toBeGreaterThan(sectionTops[index - 1] ?? 0);
    }
  });

  test("US-005 F0.1: social row is pinned to the bottom @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await expect(sidebar).toBeVisible();

    const sidebarBox = await boxOf(sidebar);
    const socialBox = await boxOf(page.getByRole("navigation", { name: "Social" }));
    const gap = sidebarBox.y + sidebarBox.height - (socialBox.y + socialBox.height);

    expect(gap).toBeLessThanOrEqual(32);
  });

  test("US-005 F0.1: ASK ABOUT comes from commands.json @desktop-only", async ({ page }) => {
    await page.goto("/");
    const askList = page.getByRole("list", { name: "ASK ABOUT" });

    await expect(askList.getByRole("link")).toHaveText(askLabels);
  });

  test("US-005 F0.1: PROJECTS comes from profile.json @desktop-only", async ({ page }) => {
    await page.goto("/");
    const projectList = page.getByRole("list", { name: "PROJECTS" });

    await expect(projectList.getByRole("link")).toHaveText(projectLabels);
  });

  test("US-005 F0.2: every item links to its page @desktop-only", async ({ page }) => {
    await page.goto("/");
    const askList = page.getByRole("list", { name: "ASK ABOUT" });
    const projectList = page.getByRole("list", { name: "PROJECTS" });

    for (const command of askAbout) {
      await expect(askList.getByRole("link", { name: command.label, exact: true })).toHaveAttribute(
        "href",
        command.answer,
      );
    }
    for (const project of profileData.sidebar.projects) {
      await expect(
        projectList.getByRole("link", { name: project.label, exact: true }),
      ).toHaveAttribute("href", project.href);
    }
  });

  test("US-005 F0.3: collapse to a 64 px rail @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();

    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // The labels are visually hidden in the rail, but each link keeps its name.
    for (const label of askLabels) {
      await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("US-005 F0.3: collapsed state survives reload @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);

    await page.reload();

    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
  });

  test("US-005 F0.3: collapse still works when storage is blocked @desktop-only", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });

    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();

    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
    expect(errors).toEqual([]);
  });

  test("US-005 F0.3: new tab starts expanded @desktop-only", async ({ context, page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Collapse sidebar" }).click();

    const newTab = await context.newPage();
    await newTab.goto("/");
    const sidebar = newTab.getByRole("complementary", { name: "Sidebar" });

    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(320);
  });
});
