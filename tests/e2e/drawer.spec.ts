import { expect, test } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };

// Mirrors profile.sidebar.askAbout, which sets the order of the ASK ABOUT list.
const askLabels = profileData.sidebar.askAbout.map((name) => {
  const command = commandsData.find((item) => item.command === name);
  if (!command) throw new Error(`commands.json has no command ${name}`);
  return command.label;
});

test.describe("mobile drawer", () => {
  test("US-006 F0.3: menu button opens the drawer @mobile-only", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: "Sidebar" })).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();

    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("list", { name: "ASK ABOUT" }).getByRole("link")).toHaveText(
      askLabels,
    );
  });

  test("US-006 F0.3: focus is trapped in the drawer @mobile-only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    const closeButton = dialog.getByRole("button", { name: "Close menu" });

    // The last focusable element is the last social link.
    await dialog.getByRole("link").last().focus();
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link").last()).toBeFocused();
  });

  test("US-006 F0.3: Esc closes the drawer @mobile-only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
  });

  test("US-006: focus returns to the menu button @mobile-only", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open menu" });

    await menuButton.click();
    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();

    await menuButton.click();
    await page
      .getByRole("dialog", { name: "Menu" })
      .getByRole("button", { name: "Close menu" })
      .click();
    await expect(menuButton).toBeFocused();
  });

  test("US-006: following a link closes the drawer @mobile-only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });

    await dialog.getByRole("list", { name: "ASK ABOUT" }).getByRole("link").first().click();

    await expect(dialog).toBeHidden();
  });

  test("US-006: no menu button on desktop @desktop-only", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open menu" });

    // The breakpoint is 1024 px: the button is shown below it and hidden from it up.
    await page.setViewportSize({ width: 1023, height: 800 });
    await expect(menuButton).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(menuButton).toBeHidden();
  });
});
