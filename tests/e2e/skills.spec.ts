import { expect, test } from "@playwright/test";
import { loadContent } from "@/lib/content";

// The skills as the files define them, read the same way the page reads them.
const { categories, inPractice = [] } = loadContent().skills;

test("US-017 F5.1: skills uses the template", async ({ page }) => {
  await page.goto("/skills/");

  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("/skills");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("US-017 F5.4: one heading and flat list per category", async ({ page }) => {
  await page.goto("/skills/");
  const main = page.getByRole("main");

  // Every category name is an h2, in file order. The In practice heading comes last, when there is one.
  const headings = [...categories.map((category) => category.name)];
  if (inPractice.length > 0) headings.push("In practice");
  await expect(main.getByRole("heading", { level: 2 })).toHaveText(headings);

  for (const category of categories) {
    const section = page.getByRole("region", { name: category.name, exact: true });
    await expect(section.getByRole("heading")).toHaveText([category.name]);
    await expect(section.getByRole("list")).toHaveCount(1);
    await expect(section.getByRole("listitem")).toHaveText(category.items);
  }
});

test("US-017 F5.4: no proficiency bars", async ({ page }) => {
  await page.goto("/skills/");

  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByRole("meter")).toHaveCount(0);
});

test("US-017 F5.4: in practice lists every pair", async ({ page }) => {
  expect(inPractice.length, "skills.json needs inPractice pairs for this test").toBeGreaterThan(0);
  await page.goto("/skills/");
  const section = page.getByRole("region", { name: "In practice", exact: true });

  await expect(section.getByRole("heading", { level: 2, name: "In practice" })).toBeVisible();
  await expect(section.getByRole("listitem")).toHaveText(
    inPractice.map((pair) => `${pair.tool} in ${pair.project}`),
  );
});
