import { expect, test } from "@playwright/test";

test("US-002: home page loads with one h1", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("main")).toBeVisible();
});
