import { expect, test } from "@playwright/test";

const toggleName = "Switch theme";
const themeColorMeta = 'meta[name="theme-color"]';

test.describe("OS prefers dark", () => {
  test.use({ colorScheme: "dark" });

  test("US-004 F0.5: light is the default when the OS prefers dark", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test("US-004 F0.5: toggle sets data-theme and saves it", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: toggleName });

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
});

test("US-004 F0.5: saved theme applies before any bundle runs", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  // With every script bundle blocked, React never hydrates, so only the inline
  // <head> script could have set data-theme.
  await page.route(/\/_next\/static\/.*\.js(\?.*)?$/, (route) => route.abort());

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(themeColorMeta)).toHaveAttribute("content", "#1a1a1c");
});

test("US-004 F0.5: theme persists across reload", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: toggleName }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("US-004 F0.4: moon in light, sun in dark", async ({ page }) => {
  await page.goto("/");
  // The icons are aria-hidden, so a CSS selector is the only way to tell them apart.
  const moon = page.locator("svg.lucide-moon");
  const sun = page.locator("svg.lucide-sun");

  await expect(moon).toBeVisible();
  await expect(sun).toBeHidden();

  await page.getByRole("button", { name: toggleName }).click();

  await expect(sun).toBeVisible();
  await expect(moon).toBeHidden();
});

test("US-004 F0.6: theme-color follows the theme", async ({ page }) => {
  await page.goto("/");
  const meta = page.locator(themeColorMeta);

  await expect(meta).toHaveAttribute("content", "#f5f4f0");

  await page.getByRole("button", { name: toggleName }).click();

  await expect(meta).toHaveAttribute("content", "#1a1a1c");
});

test("US-004: invalid saved value falls back to light", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "purple"));

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(themeColorMeta)).toHaveAttribute("content", "#f5f4f0");
});

test("US-004: unreadable storage falls back to light without an error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // The toggle must still work for this page view when it can't save.
  await page.getByRole("button", { name: toggleName }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  expect(errors).toEqual([]);
});
