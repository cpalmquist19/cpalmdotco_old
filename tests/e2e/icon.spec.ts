import { expect, test, type Page } from "@playwright/test";

async function getIconHref(page: Page): Promise<string> {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  if (href === null) throw new Error("the home page has no link[rel=icon]");
  return href;
}

test("US-050: home page links an icon that loads as an image", async ({ page, request }) => {
  const href = await getIconHref(page);

  const response = await request.get(href);

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^image\/png/);
});

test("US-069: the linked icon is served in one request, with no redirect", async ({
  page,
  request,
}) => {
  const href = await getIconHref(page);

  const response = await request.get(href, { maxRedirects: 0 });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\/png/);
});

test("US-069: /about still redirects to /about/", async ({ request }) => {
  const response = await request.get("/about", { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toMatch(/\/about\/$/);
});
