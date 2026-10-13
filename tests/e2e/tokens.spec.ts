import { expect, test } from "@playwright/test";

test("US-003: light tokens apply by default", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // #f5f4f0
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 244, 240)");
});

test("US-003: dark tokens apply when data-theme is dark", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  });

  // #1a1a1c
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(26, 26, 28)");
});

test("US-003: radius tokens resolve to lengths", async ({ page }) => {
  await page.goto("/");

  // Tailwind's theme layer holds `--radius-pill: var(--radius-pill)`, a loop. It
  // is harmless only while the unlayered :root values win, so guard that here.
  const radii = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      pill: style.getPropertyValue("--radius-pill").trim(),
      box: style.getPropertyValue("--radius-box").trim(),
    };
  });

  expect(radii).toEqual({ pill: "999px", box: "12px" });
});

test("US-003: body text uses Geist", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toHaveCSS("font-family", /Geist/);
});
