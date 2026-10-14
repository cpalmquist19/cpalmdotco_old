import { expect, test, type Locator, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

// The command named `name`. A missing one fails the test.
function commandNamed(name: string) {
  const command = commandsData.find((item) => item.command === name);
  if (command === undefined) throw new Error(`commands.json has no ${name}`);
  return command;
}

const about = commandNamed("/about");
const skills = commandNamed("/skills");
const firstProject = profileData.sidebar.projects[0];
if (firstProject === undefined) throw new Error("profile.json has no sidebar project");

// The chips on the home page reuse the ASK ABOUT names, so every lookup is scoped to the sidebar or the drawer.
const sidebar = (page: Page) => page.getByRole("complementary", { name: "Sidebar" });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Menu" });
const askItem = (scope: Locator, label: string) =>
  scope.getByRole("list", { name: "ASK ABOUT" }).getByRole("link", { name: label, exact: true });
const thread = (page: Page) => page.getByTestId("thread");
// A visitor's bubble has no role, so it's found by test id (CODING § 9).
const visitorMessages = (page: Page) => page.getByTestId("visitor-message");

// Clicks a link and waits for the page to move on, clicking again if it hasn't. In WebKit, on a machine
// busy with all three browsers, a click on a hydrated next/link was twice dropped with no navigation and
// no error (US-079). A link that works moves on at the first click, so this costs nothing then.
async function clickUntilAt(page: Page, link: Locator, url: RegExp) {
  await expect(async () => {
    await link.click();
    await expect(page).toHaveURL(url, { timeout: 3_000 });
  }).toPass({ timeout: 20_000 });
}

test.describe("sidebar items ask in the chat", () => {
  test("US-024 F0.2: a sidebar click shows the label and the inline answer, and pushes the page URL @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(askItem(sidebar(page), about.label));

    await askItem(sidebar(page), about.label).click();

    // The same content as a chip click (F2.3): the label, then the intro with a link to the page.
    await expect(visitorMessages(page)).toHaveText([about.label]);
    await expect(thread(page).getByText(about.intro ?? about.description)).toBeVisible();
    await expect(thread(page).getByRole("link", { name: about.label })).toHaveAttribute(
      "href",
      about.answer,
    );
    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
    // The home page is still on screen: the item asked, it didn't load the page.
    await expect(page.getByRole("combobox", { name: "Ask about Caleb" })).toBeVisible();
  });

  test("US-024 F0.2: Back restores the thread from before the sidebar click @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(askItem(sidebar(page), about.label));
    await askItem(sidebar(page), about.label).click();
    await askItem(sidebar(page), skills.label).click();
    await expect(visitorMessages(page)).toHaveText([about.label, skills.label]);

    await page.goBack();

    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
    await expect(visitorMessages(page)).toHaveText([about.label]);
  });

  test("US-024 F0.2: a sidebar item still has its href after a click @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(askItem(sidebar(page), about.label));

    await askItem(sidebar(page), about.label).click();

    await expect(visitorMessages(page)).toHaveText([about.label]);
    await expect(askItem(sidebar(page), about.label)).toHaveAttribute("href", about.answer);
  });

  test("US-024 F0.2: a click with a modifier key is not intercepted @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(askItem(sidebar(page), about.label));
    // Records whether the click's default action was cancelled. Our handler runs first, so this shows its decision.
    await page.evaluate(() => {
      document.addEventListener("click", (event) => {
        document.body.dataset.clickPrevented = String(event.defaultPrevented);
      });
    });

    await askItem(sidebar(page), about.label).click({ modifiers: ["Control"] });

    await expect(page.locator("body")).toHaveAttribute("data-click-prevented", "false");
    await expect(thread(page)).toBeEmpty();
  });

  test("US-024 F0.2: in the collapsed rail an item asks in the chat @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(page.getByRole("button", { name: "Collapse sidebar" }));
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();

    await askItem(sidebar(page), skills.label).click();

    await expect(visitorMessages(page)).toHaveText([skills.label]);
    await expect(page).toHaveURL(new RegExp(`${skills.answer}$`));
  });

  test("US-024 F0.2: on a real content page an item loads its page and shows no thread @desktop-only", async ({
    page,
  }) => {
    await page.goto(about.answer);
    await waitForHydration(askItem(sidebar(page), skills.label));

    await clickUntilAt(page, askItem(sidebar(page), skills.label), new RegExp(`${skills.answer}$`));

    // The page's H1 is the command's description (D-018), so this is the real page, not an inline answer.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(skills.description);
    await expect(thread(page)).toHaveCount(0);
  });

  test("US-024 F0.2: a PROJECTS item still loads its case study @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    const link = sidebar(page)
      .getByRole("list", { name: "PROJECTS" })
      .getByRole("link", { name: firstProject.label, exact: true });
    await waitForHydration(link);

    await clickUntilAt(page, link, new RegExp(`${firstProject.href}$`));

    await expect(thread(page)).toHaveCount(0);
  });

  test.describe("with JavaScript off", () => {
    test.use({ javaScriptEnabled: false });

    test("US-024 F0.2: with JavaScript off a sidebar item loads its page @desktop-only", async ({
      page,
    }) => {
      await page.goto("/");

      await askItem(sidebar(page), about.label).click();

      await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(about.description);
    });
  });

  test("US-024 F0.2: in the drawer an item asks in the chat and closes the drawer @mobile-only", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(page.getByRole("button", { name: "Open menu" }));
    await page.getByRole("button", { name: "Open menu" }).click();
    await waitForHydration(askItem(drawer(page), about.label));

    await askItem(drawer(page), about.label).click();

    await expect(drawer(page)).toBeHidden();
    await expect(visitorMessages(page)).toHaveText([about.label]);
    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
  });
});
