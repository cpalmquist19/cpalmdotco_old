import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import profileData from "@/content/profile.json" with { type: "json" };
import { splitFrontmatter } from "@/lib/content";

// The text the About page should show, read from the same file the page reads.
const aboutSource = readFileSync(
  fileURLToPath(new URL("../../content/about.md", import.meta.url)),
  "utf8",
);
const aboutParts = splitFrontmatter(aboutSource);
if (!aboutParts) throw new Error("content/about.md has no frontmatter");
const [firstSentence = ""] = aboutParts.body.trim().split(/(?<=\.)\s/);

const aboutCommand = commandsData.find((item) => item.command === "/about");
if (!aboutCommand) throw new Error("commands.json has no /about command");

test("US-014 F5.1: about uses the template and shows the about.md text", async ({ page }) => {
  await page.goto("/about/");

  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(aboutCommand.description);
  await expect(page.getByRole("main").getByText(firstSentence)).toBeVisible();
});

test("US-014 F5.1: cv uses the template", async ({ page }) => {
  await page.goto("/cv/");

  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Résumé");
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("US-014: the CV link downloads the PDF", async ({ page }) => {
  await page.goto("/cv/");
  const link = page.getByRole("main").getByRole("link", { name: "Download CV (PDF)" });

  await expect(link).toHaveAttribute("href", profileData.links.cv);
  await expect(link).toHaveAttribute("download");

  const response = await page.request.get(profileData.links.cv);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
});
