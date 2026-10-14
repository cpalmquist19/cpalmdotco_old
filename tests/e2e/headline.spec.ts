import { expect, test, type Locator, type Page } from "@playwright/test";
import profileData from "@/content/profile.json" with { type: "json" };

const { greeting, headlinePool: pool } = profileData;
const input = (page: Page) => page.getByRole("textbox", { name: "Ask about Caleb" });
const newestFact = (page: Page) => page.getByTestId("headline-fact").last();

// The page's colour for a token, read the same way the other specs do (topbar.spec.ts).
async function tokenColour(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, token);
}

// The fake clock stops at a time just past the load, so timers only fire when a test calls runFor (CODING § 9).
async function loadWithFakeClock(page: Page) {
  await page.clock.install();
  await page.goto("/");
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}

// Text of the newest fact line, read as a string so a test can compare it before and after.
async function textOf(locator: Locator): Promise<string> {
  return (await locator.textContent()) ?? "";
}

// Moves the fake clock in small steps until the newest fact changes. A single long runFor stalls after the
// first timer: React has to render before it sets the next one, and that needs a turn of the page's event
// loop, which expect.poll gives between steps.
async function clockUntilChanged(page: Page, locator: Locator, before: string) {
  await expect
    .poll(
      async () => {
        await page.clock.runFor(500);
        return textOf(locator);
      },
      { timeout: 15_000 },
    )
    .not.toBe(before);
}

test.describe("rotating headline", () => {
  test("US-020 F1.1: the h1 holds the greeting and every fact as sr-only text", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      `${greeting} ${pool.join(". ")}`,
    );
  });

  test("US-020 F1.2: the newest fact is in --text and the others in --text-faint", async ({
    page,
  }) => {
    // With reduced motion the fixed set stays put, so the colours can be checked without waiting.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const facts = page.getByTestId("headline-fact");

    await expect(facts).toHaveText(pool.slice(0, 3));
    const colours = await facts.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).color),
    );
    const faint = await tokenColour(page, "--text-faint");
    const text = await tokenColour(page, "--text");
    expect(colours).toEqual([faint, faint, text]);
  });

  test("US-020 F1.2: the facts are bold, −0.03em, and 64 px from sm up (40 px on phones, D-028)", async ({
    page,
  }) => {
    await page.goto("/");
    const fact = page.getByTestId("headline-fact").first();
    const style = await fact.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        letterSpacing: computed.letterSpacing,
        fontSizeInEm: parseFloat(computed.letterSpacing) / parseFloat(computed.fontSize),
      };
    });
    // The sm breakpoint is 640 px, so the same width decides which size applies.
    const wide = (page.viewportSize()?.width ?? 0) >= 640;

    expect(style.fontSize).toBe(wide ? "64px" : "40px");
    expect(style.fontWeight).toBe("700");
    expect(style.fontSizeInEm).toBeCloseTo(-0.03, 2);
  });

  test("US-020 F1.2: the caret sits after the newest fact and is hidden from assistive tech", async ({
    page,
  }) => {
    await page.goto("/");
    const caret = newestFact(page).getByTestId("caret");

    await expect(caret).toHaveAttribute("aria-hidden", "true");
    await expect(caret).toBeAttached();
  });

  test("US-020 F1.4: the headline stops while the input has focus, and resumes on blur", async ({
    page,
  }) => {
    await loadWithFakeClock(page);
    const before = await textOf(newestFact(page));

    await input(page).focus();
    // Long enough for a hold, a fade and several typed characters, if the cycle were running.
    await page.clock.runFor(10_000);
    await expect(newestFact(page)).toHaveText(before);

    await input(page).blur();
    await clockUntilChanged(page, newestFact(page), before);
  });

  test("US-020 F1.4: the headline stops while the tab is hidden, and resumes when it's shown", async ({
    page,
  }) => {
    // `visibilityState` is read-only, so the test sets it and fires the event that the component listens for.
    await page.addInitScript(
      `window.__hidden = false;
       Object.defineProperty(document, "visibilityState", {
         configurable: true,
         get: () => (window.__hidden ? "hidden" : "visible"),
       });`,
    );
    await loadWithFakeClock(page);
    const before = await textOf(newestFact(page));

    await page.evaluate(
      "window.__hidden = true; document.dispatchEvent(new Event('visibilitychange'));",
    );
    await page.clock.runFor(10_000);
    await expect(newestFact(page)).toHaveText(before);

    await page.evaluate(
      "window.__hidden = false; document.dispatchEvent(new Event('visibilitychange'));",
    );
    await clockUntilChanged(page, newestFact(page), before);
  });

  test("US-020 F1.5: the headline and the input keep their positions as the facts change", async ({
    page,
  }) => {
    await loadWithFakeClock(page);
    const headline = page.getByRole("heading", { level: 1 });
    const headlineBefore = await headline.boundingBox();
    const inputBefore = await input(page).boundingBox();
    const factBefore = await textOf(newestFact(page));

    // Run until a new fact is typing, then check that nothing has moved.
    await clockUntilChanged(page, newestFact(page), factBefore);

    expect(await headline.boundingBox()).toEqual(headlineBefore);
    expect(await input(page).boundingBox()).toEqual(inputBefore);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("US-020 F1.6: the fixed set shows, with no typing, fading or caret", async ({ page }) => {
      await page.clock.install();
      await page.goto("/");
      const facts = page.getByTestId("headline-fact");
      await expect(facts).toHaveText(pool.slice(0, 3));
      const before = await facts.allTextContents();

      await page.clock.runFor(60_000);

      expect(await facts.allTextContents()).toEqual(before);
      await expect(page.getByTestId("caret")).toHaveCount(0);
    });
  });
});

test("US-020 F1.7: the skip link is the first Tab stop and moves focus to the input", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to the chat input" });

  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(input(page)).toBeFocused();
});
