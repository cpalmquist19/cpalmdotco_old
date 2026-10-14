import { expect, test } from "@playwright/test";

test("US-050: home page links an icon that loads as an image", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  if (href === null) throw new Error("the home page has no link[rel=icon]");

  const response = await request.get(href);

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^image\/png/);
});
