import { expect, test } from "@playwright/test";
import profileData from "@/content/profile.json" with { type: "json" };

test("US-013: contact shows email, location, status and social links from profile.json", async ({
  page,
}) => {
  await page.goto("/contact/");
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: profileData.email })).toHaveAttribute(
    "href",
    `mailto:${profileData.email}`,
  );
  await expect(main.getByText(profileData.location, { exact: true })).toBeVisible();
  await expect(main.getByText(profileData.status, { exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    profileData.links.linkedin,
  );
  await expect(main.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    profileData.links.github,
  );
});
