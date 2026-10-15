import { expect, test, type Locator } from "@playwright/test";
import profileData from "@/content/profile.json" with { type: "json" };

async function leftOf(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`no bounding box for ${locator}`);
  return box.x;
}

test.describe("sidebar alignment", () => {
  test("US-085 F0.1: the sidebar name starts where the item labels start @desktop-only", async ({
    page,
  }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await expect(sidebar).toBeVisible();

    const name = await leftOf(sidebar.getByRole("link", { name: profileData.name }));
    const newChat = await leftOf(sidebar.getByText("New chat"));
    const about = await leftOf(sidebar.getByText("About", { exact: true }));
    expect(name).toBeCloseTo(newChat, 0);
    expect(name).toBeCloseTo(about, 0);
  });
});
