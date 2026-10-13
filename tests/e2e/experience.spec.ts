import { expect, test } from "@playwright/test";
import { loadContent } from "@/lib/content";
import { formatRange } from "@/lib/dates";

// The roles as the files define them, read the same way the page reads them.
const roles = loadContent().experience;

test("US-015 F5.1: experience uses the template", async ({ page }) => {
  await page.goto("/experience/");

  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("/experience");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("US-015 F5.2: one numbered entry per role", async ({ page }) => {
  await page.goto("/experience/");
  const items = page.locator('ol[aria-label="Roles"] > li');

  await expect(items).toHaveCount(roles.length);
  for (const [index] of roles.entries()) {
    const number = String(index + 1).padStart(2, "0");
    await expect(items.nth(index).locator("span[aria-hidden='true']")).toHaveText(number);
  }
});

test("US-015 F5.2: each role shows title, company, dates, location, bullets and tags", async ({
  page,
}) => {
  await page.goto("/experience/");
  const items = page.locator('ol[aria-label="Roles"] > li');

  for (const [index, role] of roles.entries()) {
    const item = items.nth(index);
    await expect(item.getByRole("heading", { level: 2 })).toHaveText(role.title);
    await expect(item.getByText(role.company, { exact: true })).toBeVisible();
    await expect(item.getByText(formatRange(role.start, role.end), { exact: true })).toBeVisible();
    await expect(item.getByText(role.location, { exact: true })).toBeVisible();
    for (const bullet of role.bullets) {
      await expect(item.getByRole("listitem").filter({ hasText: bullet })).toBeVisible();
    }
    const tags = item.getByRole("list", { name: `Tags for ${role.title} at ${role.company}` });
    await expect(tags.getByRole("listitem")).toHaveText(role.tags);
  }
});

test("US-015 F5.2: tags use the mono font", async ({ page }) => {
  await page.goto("/experience/");
  const firstTag = page
    .locator('ol[aria-label="Roles"] > li')
    .first()
    .locator("ul[aria-label^='Tags'] > li")
    .first();

  // next/font names the family "__Geist_Mono_<hash>", so match Geist and Mono rather than the exact name.
  await expect(firstTag).toHaveCSS("font-family", /Geist[ _]Mono/);
});

test("US-015: roles appear in order", async ({ page }) => {
  await page.goto("/experience/");
  const titles = [...roles].sort((a, b) => a.order - b.order).map((role) => role.title);

  await expect(page.locator('ol[aria-label="Roles"] > li h2')).toHaveText(titles);
});
