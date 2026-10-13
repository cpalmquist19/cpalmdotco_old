import { expect, test, type Page } from "@playwright/test";
import profileData from "@/content/profile.json" with { type: "json" };

const shareName = "Copy link to this page";
const themeName = "Switch theme";

// Replaces the clipboard before the page loads. `copied` collects every URL written to it.
// The stub awaits the call back to Node, so a URL is recorded before the toast shows.
async function stubClipboard(page: Page, copied: string[], mode: "copy" | "fail") {
  await page.exposeFunction("recordCopy", (text: string) => {
    copied.push(text);
  });
  const writeText =
    mode === "fail"
      ? "async () => { throw new Error('blocked'); }"
      : "async (text) => { await window.recordCopy(text); }";
  await page.addInitScript(
    `Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: ${writeText} } });`,
  );
}

// The background a filled button would have in this theme, read from the same token.
// Lists every visible link or button whose background matches it.
async function filledControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--cta-bg)";
    document.body.append(probe);
    const filled = getComputedStyle(probe).backgroundColor;
    probe.remove();

    return [...document.querySelectorAll("a, button")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== "hidden" &&
          style.backgroundColor === filled
        );
      })
      .map((element) => (element.textContent ?? "").trim());
  });
}

test.describe("status dot motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("US-007 F0.4: status dot stops pulsing under reduced motion", async ({ page }) => {
    await page.goto("/");
    const dot = page.getByTestId("status-dot");

    await expect(dot).toBeVisible();
    expect(await dot.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });
});

test.describe("status dot motion without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("US-007 F0.4: status dot pulses without reduced motion", async ({ page }) => {
    await page.goto("/");
    const dot = page.getByTestId("status-dot");

    await expect(dot).toBeVisible();
    expect(await dot.evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none");
  });
});

test.describe("top bar", () => {
  test("US-007 F0.4: status pill shows the profile status", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("banner").getByText(profileData.status, { exact: true }),
    ).toBeVisible();
  });

  test("US-007 F0.4: share copies the URL and shows a toast", async ({ page }) => {
    const copied: string[] = [];
    await stubClipboard(page, copied, "copy");
    await page.goto("/");

    await page.getByRole("button", { name: shareName }).click();

    await expect(page.getByRole("status")).toHaveText("Link copied");
    expect(copied).toEqual([page.url()]);
  });

  test("US-007 F0.4: toast hides after 2 seconds", async ({ page }) => {
    await stubClipboard(page, [], "copy");
    await page.clock.install();
    await page.goto("/");
    // Stop the clock so only the calls below move time, which makes the 2 s exact.
    await page.clock.pauseAt(new Date(Date.now() + 1000));

    await page.getByRole("button", { name: shareName }).click();
    await expect(page.getByRole("status")).toHaveText("Link copied");

    await page.clock.runFor(1999);
    await expect(page.getByRole("status")).toHaveText("Link copied");

    await page.clock.runFor(1);
    await expect(page.getByRole("status")).toBeEmpty();
  });

  test("US-007 F0.4: toast sits just below the copy button", async ({ page }) => {
    await stubClipboard(page, [], "copy");
    await page.goto("/");
    const button = page.getByRole("button", { name: shareName });

    await button.click();
    await expect(page.getByRole("status")).toHaveText("Link copied");

    const buttonBox = await button.boundingBox();
    const toastBox = await page.getByRole("status").locator("p").boundingBox();
    if (!buttonBox || !toastBox) throw new Error("copy button or toast has no box");

    // Below the button, centred on it.
    expect(toastBox.y).toBeGreaterThanOrEqual(buttonBox.y + buttonBox.height);
    const buttonCentre = buttonBox.x + buttonBox.width / 2;
    const toastCentre = toastBox.x + toastBox.width / 2;
    expect(Math.abs(toastCentre - buttonCentre)).toBeLessThan(1);
  });

  test("US-007: failed copy shows an error toast", async ({ page }) => {
    await stubClipboard(page, [], "fail");
    await page.goto("/");

    await page.getByRole("button", { name: shareName }).click();

    await expect(page.getByRole("status")).toHaveText("Couldn't copy the link");
  });

  test("US-007 F0.4: CV link downloads the CV", async ({ page }) => {
    await page.goto("/");
    const cv = page.getByRole("link", { name: "CV", exact: true });

    await expect(cv).toHaveAttribute("href", profileData.links.cv);
    await expect(cv).toHaveAttribute("download", "");
  });

  test("US-007 F0.4: theme toggle is in the top bar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("banner").getByRole("button", { name: themeName })).toBeVisible();
  });

  test("US-007 F0.4: theme toggle sits left of the CV link", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: themeName });
    const cv = page.getByRole("link", { name: "CV", exact: true });

    const toggleBox = await toggle.boundingBox();
    const cvBox = await cv.boundingBox();
    if (!toggleBox || !cvBox) throw new Error("theme toggle or CV link has no box");

    expect(toggleBox.x + toggleBox.width).toBeLessThanOrEqual(cvBox.x);
  });

  test("US-007 F2.4: CV is the only filled button", async ({ page }) => {
    await page.goto("/");
    expect(await filledControls(page)).toEqual(["CV"]);

    await page.getByRole("button", { name: themeName }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await filledControls(page)).toEqual(["CV"]);
  });

  test("US-007: menu button is in the top bar on mobile @mobile-only", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("banner");
    const menu = banner.getByRole("button", { name: "Open menu" });
    const pill = banner.getByText(profileData.status, { exact: true });

    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    const pillBox = await pill.boundingBox();
    if (!menuBox || !pillBox) throw new Error("menu button or status pill has no box");

    // The menu sits to the left of the pill on the same row.
    expect(menuBox.x).toBeLessThan(pillBox.x);
    expect(Math.abs(menuBox.y - pillBox.y)).toBeLessThan(pillBox.height);
  });
});
