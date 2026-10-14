import { expect, test, type Locator, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

// The chips are the chip entries of commands.json, in order (F2.1).
const chipCommands = commandsData
  .filter((command) => command.chip)
  .sort((a, b) => a.order - b.order);
const chipLabels = chipCommands.map((command) => command.label);

// The command named `name`. Only the chip tests use it, so a missing one fails the test.
function commandNamed(name: string) {
  const command = commandsData.find((item) => item.command === name);
  if (command === undefined) throw new Error(`commands.json has no ${name}`);
  return command;
}

const about = commandNamed("/about");
const skills = commandNamed("/skills");

const chipList = (page: Page) => page.getByRole("list", { name: "Suggested questions" });
const chipLink = (page: Page, label: string) => chipList(page).getByRole("link", { name: label });
// The rise-in and its hidden state are on each chip's list item, not on the link inside it.
const chipItem = (page: Page, index: number) => chipList(page).locator("li").nth(index);
const thread = (page: Page) => page.getByTestId("thread");
// A visitor's bubble has no role, so it's found by test id (CODING § 9). Its label also appears as a link in the answer.
const visitorMessages = (page: Page) => page.getByTestId("visitor-message");
const input = (page: Page) => page.getByRole("textbox", { name: "Ask about Caleb" });
const newestFact = (page: Page) => page.getByTestId("headline-fact").last();

// The fake clock stops just past the load, so headline timers only fire when a test calls runFor (CODING § 9).
async function loadWithFakeClock(page: Page) {
  await page.clock.install();
  await page.goto("/");
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}

// Text of a locator, read as a string so a test can compare it before and after.
async function textOf(locator: Locator): Promise<string> {
  return (await locator.textContent()) ?? "";
}

// Each clock step lets the headline move on by one timer. The timeout is long because a step can take a
// few tenths of a second when the whole suite shares the machine.
const clockStep = { timeout: 60_000, intervals: [0] };

test.describe("suggested chips", () => {
  test("US-023 F2.1: chips are the commands.json entries with chip true, in order", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(chipList(page).getByRole("link")).toHaveText(chipLabels);
  });

  test("US-023 F2.2: each chip is a link to its page with JavaScript off", async ({ page }) => {
    await page.goto("/");

    // The link's href is its page, so this holds with or without the click handler.
    for (const command of chipCommands) {
      await expect(chipLink(page, command.label)).toHaveAttribute("href", command.answer);
    }
  });

  test.describe("with JavaScript off", () => {
    test.use({ javaScriptEnabled: false });

    test("US-023 F2.2: a chip click loads its page", async ({ page }) => {
      await page.goto("/");

      await chipLink(page, about.label).click();

      await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
    });

    test("US-023 F2.5: with JavaScript off the chips are visible from the first paint", async ({
      page,
    }) => {
      await page.goto("/");

      await expect(chipLink(page, about.label)).toBeVisible();
      await expect(chipItem(page, 0)).toHaveCSS("opacity", "1");
    });
  });

  test("US-023 F2.3: a click shows the label and the inline answer, and pushes the page URL", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));

    await chipLink(page, about.label).click();

    // The visitor's message is the label, and the answer below it is the command's intro with a link to its page.
    await expect(visitorMessages(page)).toHaveText([about.label]);
    await expect(thread(page).getByText(about.intro ?? about.description)).toBeVisible();
    await expect(thread(page).getByRole("link", { name: about.label })).toHaveAttribute(
      "href",
      about.answer,
    );
    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
  });

  test("US-023 F2.3: Back restores the thread from before the click", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));
    await chipLink(page, about.label).click();
    await chipLink(page, skills.label).click();
    await expect(visitorMessages(page)).toHaveText([about.label, skills.label]);

    await page.goBack();

    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
    await expect(visitorMessages(page)).toHaveText([about.label]);
  });

  test("US-023 F2.3: a reload of the pushed URL shows the real page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));
    await chipLink(page, about.label).click();

    await page.reload();

    await expect(page).toHaveURL(new RegExp(`${about.answer}$`));
    await expect(chipList(page)).toHaveCount(0);
  });

  test("US-023 F2.3: a click with a modifier key is not intercepted", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));
    // Records whether the click's default action was cancelled. Our handler runs first, so this shows its decision.
    await page.evaluate(() => {
      document.addEventListener("click", (event) => {
        document.body.dataset.clickPrevented = String(event.defaultPrevented);
      });
    });

    await chipLink(page, about.label).click({ modifiers: ["Control"] });

    await expect(page.locator("body")).toHaveAttribute("data-click-prevented", "false");
    await expect(thread(page)).toBeEmpty();
  });

  test("US-023 F2.4: chips are centred under the input, outlined and fully rounded, each with an icon", async ({
    page,
  }) => {
    await page.goto("/");
    // The chips rise in once the page hydrates (D-033). Then they're offset by their transform, so wait for each to settle.
    await waitForHydration(chipLink(page, about.label));
    for (let index = 0; index < chipCommands.length; index += 1) {
      await expect(chipItem(page, index)).toHaveCSS("opacity", "1");
    }
    const inputBox = await input(page).boundingBox();
    const firstRow = await chipList(page)
      .getByRole("link")
      .evaluateAll((links) => {
        const boxes = links.map((link) => link.getBoundingClientRect());
        const top = boxes[0]?.top ?? 0;
        return boxes.filter((box) => Math.abs(box.top - top) < 1);
      });

    // The first row is centred: its left edge to its right edge has the input's centre.
    const first = firstRow[0];
    const last = firstRow[firstRow.length - 1];
    if (inputBox === null) throw new Error("the input has no box to centre under");
    if (first === undefined || last === undefined) throw new Error("no chips in the first row");
    const rowCentre = (first.left + last.right) / 2;
    expect(Math.abs(rowCentre - (inputBox.x + inputBox.width / 2))).toBeLessThan(1);

    for (const command of chipCommands) {
      const chip = chipLink(page, command.label);
      await expect(chip).toHaveCSS("border-top-width", "1px");
      await expect(chip).toHaveCSS("border-radius", "999px");
      // Icons have no role or name, so the test finds the SVG each chip renders.
      await expect(chip.locator("svg")).toHaveCount(1);
    }
  });

  test("US-023 F2.4: the top-bar CV is the only filled button", async ({ page }) => {
    await page.goto("/");

    // "Filled" means the solid --cta-bg fill. The outlined buttons have a surface background, which isn't filled.
    const filled = await page.locator("a, button").evaluateAll((elements) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--cta-bg)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return elements
        .filter((element) => getComputedStyle(element).backgroundColor === colour)
        .map((element) => element.textContent?.trim());
    });

    expect(filled).toEqual(["CV"]);
  });

  test("US-023 F2.5: chips are staggered by 40 ms", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));

    // Each chip's list item carries its index in --i, and the keyframes delay it by 40 ms times that index.
    const items = chipList(page).locator("li");
    for (let index = 0; index < chipCommands.length; index += 1) {
      await expect(items.nth(index)).toHaveCSS("animation-delay", `${(index * 40) / 1000}s`);
    }
  });

  test("US-023 F2.5: with reduced motion the chips show at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    for (let index = 0; index < chipCommands.length; index += 1) {
      await expect(chipItem(page, index)).toHaveCSS("opacity", "1");
      await expect(chipItem(page, index)).toHaveCSS("animation-name", "none");
    }
  });

  test("US-023 F1.4: the headline stops once a chip is clicked", async ({ page }) => {
    await loadWithFakeClock(page);
    await waitForHydration(chipLink(page, about.label));
    const newest = newestFact(page);
    const before = await textOf(newest);

    // The headline moves on by itself before the click, so a frozen headline after it is the chip's doing.
    await expect
      .poll(async () => {
        await page.clock.runFor(500);
        return textOf(newest);
      }, clockStep)
      .not.toBe(before);

    await chipLink(page, about.label).click();
    await expect(visitorMessages(page)).toHaveText([about.label]);
    const frozen = await textOf(newest);
    await page.clock.runFor(10_000);

    await expect(newest).toHaveText(frozen);
  });

  test("US-023: the answer region is aria-live polite", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));

    await chipLink(page, about.label).click();

    // The thread has no role or name, so it's found by test id (CODING § 9). Its live setting is what matters.
    await expect(thread(page)).toHaveAttribute("aria-live", "polite");
    await expect(thread(page)).toContainText(about.intro ?? about.description);
  });

  test("US-023 F1.7: the skip link is still there after a chip click, and not on /about/", async ({
    page,
  }) => {
    const skip = page.getByRole("link", { name: "Skip to the chat input" });
    await page.goto("/");
    await waitForHydration(chipLink(page, about.label));
    await chipLink(page, about.label).click();

    // The link is still on the page, and it moves focus to the input when used. Its place in the Tab order
    // is tested on the home page without a chip click, since Tab starts from the last clicked element.
    await expect(skip).toHaveCount(1);
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(input(page)).toBeFocused();

    await page.goto(about.answer);
    await expect(skip).toHaveCount(0);
  });
});
