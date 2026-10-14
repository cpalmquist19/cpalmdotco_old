import { expect, test, type Locator } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

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
    // require each to start above the sections that come after the row. The
    // collapse button comes first so it stays put when the sidebar collapses (US-061).
    // The avatar follows the name (US-070).
    const avatar = await boxOf(page.getByTestId("avatar"));
    const name = await boxOf(sidebar.getByText(profileData.name, { exact: true }));
    const collapse = await boxOf(page.getByRole("button", { name: "Collapse sidebar" }));
    expect(collapse.x).toBeLessThan(name.x);
    expect(name.x).toBeLessThan(avatar.x);

    const newChat = await boxOf(page.getByRole("link", { name: "New chat" }));
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
    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    await waitForHydration(collapse);
    await collapse.click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);

    await page.reload();

    // The server renders the sidebar expanded, and the stored choice is applied after hydration, so
    // the rail appears a moment late (Sidebar.tsx). Under load in WebKit that took over 5 s, which
    // was the whole budget of the width check. Wait for the restore first, then check the width.
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible({
      timeout: 15_000,
    });
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

  test("US-061 F0.3: no horizontal overflow, expanded or collapsed @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const overflow = () => sidebar.evaluate((element) => element.scrollWidth - element.clientWidth);

    expect(await overflow()).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);

    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test("US-061 F0.3: collapse button stays in the same place @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const expanded = await boxOf(page.getByRole("button", { name: "Collapse sidebar" }));

    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
    const collapsed = await boxOf(page.getByRole("button", { name: "Expand sidebar" }));

    expect(collapsed).toEqual(expanded);
  });

  test("US-061 F0.3: New chat and ASK ABOUT icons do not move @desktop-only", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const newChat = page.getByRole("link", { name: "New chat" });
    const firstAsk = page.getByRole("link", { name: askLabels[0] ?? "", exact: true });
    const expandedNewChat = await boxOf(newChat);
    const expandedAsk = await boxOf(firstAsk);

    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
    const collapsedNewChat = await boxOf(newChat);
    const collapsedAsk = await boxOf(firstAsk);

    // Only the vertical position matters here: the expanded items are wider
    // than the rail's, but they start at the same x and the same y.
    expect({ x: collapsedNewChat.x, y: collapsedNewChat.y }).toEqual({
      x: expandedNewChat.x,
      y: expandedNewChat.y,
    });
    expect({ x: collapsedAsk.x, y: collapsedAsk.y }).toEqual({
      x: expandedAsk.x,
      y: expandedAsk.y,
    });
  });

  test("US-062: avatar file is a square of at least 400 px @desktop-only", async ({ page }) => {
    await page.goto("/");

    const size = await page.evaluate(
      (src) =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error(`could not load ${src}`));
          image.src = src;
        }),
      "/avatar.webp",
    );

    expect(size.width).toBe(size.height);
    expect(size.width).toBeGreaterThanOrEqual(400);
  });

  test("US-062 F0.1: sidebar avatar shows the headshot @desktop-only", async ({ page }) => {
    await page.goto("/");
    const avatar = page.getByTestId("avatar");

    // The monogram was text in a span; the headshot is an image that has loaded.
    await expect(avatar).toHaveJSProperty("tagName", "IMG");
    await expect
      .poll(() =>
        avatar.evaluate((element) => element instanceof HTMLImageElement && element.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(avatar).toHaveText("");
  });

  test("US-063 F0.3: avatar shows in the rail, pinned to the bottom @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);

    const avatar = page.getByTestId("avatar");
    await expect(avatar).toBeVisible();
    await expect
      .poll(() =>
        avatar.evaluate((element) => element instanceof HTMLImageElement && element.naturalWidth),
      )
      .toBeGreaterThan(0);

    const sidebarBox = await boxOf(sidebar);
    const avatarBox = await boxOf(avatar);
    expect(avatarBox.x).toBeGreaterThanOrEqual(sidebarBox.x);
    expect(avatarBox.x + avatarBox.width).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width);
    const gap = sidebarBox.y + sidebarBox.height - (avatarBox.y + avatarBox.height);
    expect(gap).toBeLessThanOrEqual(32);
  });

  test("US-070 F0.1: the name and avatar are one link to the home page @desktop-only", async ({
    page,
  }) => {
    await page.goto("/about/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    const home = sidebar.getByRole("link", { name: profileData.name, exact: true });

    await expect(home).toHaveAttribute("href", "/");
    await expect(home.getByTestId("avatar")).toBeVisible();
    await home.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test("US-070 F0.1: the avatar in the rail links to the home page @desktop-only", async ({
    page,
  }) => {
    await page.goto("/about/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect.poll(async () => (await boxOf(sidebar)).width).toBe(64);
    const home = sidebar.getByRole("link", { name: profileData.name, exact: true });

    await expect(home).toHaveAttribute("href", "/");
    await expect(home.getByTestId("avatar")).toBeVisible();
    await home.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test("US-070 F0.2: New chat links to the home page @desktop-only", async ({ page }) => {
    await page.goto("/about/");
    const newChat = page.getByRole("link", { name: "New chat" });

    await expect(newChat).toHaveAttribute("href", "/");
    await newChat.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test("US-070 F0.1: the drawer closes when the name is followed @mobile-only", async ({
    page,
  }) => {
    await page.goto("/about/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });

    await dialog.getByRole("link", { name: profileData.name, exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
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
