import { expect, test } from "@playwright/test";
import profileData from "@/content/profile.json" with { type: "json" };

const { headlinePool: pool } = profileData;

test.describe("headline fit", () => {
  test("US-085 F1.2: every headline fact fits on one line with no ellipsis", async ({ page }) => {
    await page.goto("/");
    const newest = page.getByTestId("headline-fact").last();
    await expect(newest).toBeVisible();

    // Each fact is shown in a copy of the newest line, so the copy has the same classes, width and font size
    // (40 px on a phone, 64 px from `sm`). The copy is added and removed in one step, so React's own nodes
    // aren't touched. The line is `truncate`, so a fact that is too wide has a scrollWidth over its clientWidth.
    const tooWide = await newest.evaluate((line, facts) => {
      const wide: string[] = [];
      for (const fact of facts) {
        const copy = line.cloneNode(true);
        if (!(copy instanceof HTMLElement)) throw new Error("the headline line is not an element");
        for (const child of Array.from(copy.childNodes)) {
          if (child.nodeType === Node.TEXT_NODE) child.remove();
        }
        copy.prepend(document.createTextNode(fact));
        copy.style.visibility = "hidden";
        copy.removeAttribute("data-testid");
        line.after(copy);
        if (copy.scrollWidth > copy.clientWidth) wide.push(fact);
        copy.remove();
      }
      return wide;
    }, pool);

    expect(tooWide).toEqual([]);
  });
});
