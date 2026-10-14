import { expect, test, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

// Every command in commands.json, in order. The palette lists all of them, chip or not (F3.2).
const commands = [...commandsData].sort((a, b) => a.order - b.order);

// The command named `name`. The tests that run one use it, so a missing one fails the test.
function commandNamed(name: string) {
  const command = commands.find((item) => item.command === name);
  if (command === undefined) throw new Error(`commands.json has no ${name}`);
  return command;
}

const about = commandNamed("/about");
const experience = commandNamed("/experience");
const projects = commandNamed("/projects");

const input = (page: Page) => page.getByRole("combobox", { name: "Ask about Caleb" });
const listbox = (page: Page) => page.getByRole("listbox", { name: "Commands" });
const options = (page: Page) => page.getByRole("option");
const moreChip = (page: Page) => page.getByRole("button", { name: "More" });
const visitorMessages = (page: Page) => page.getByTestId("visitor-message");
const thread = (page: Page) => page.getByTestId("thread");

// Loads the home page and waits for React to hydrate the input, so the keys reach its handlers (D-038).
async function openHome(page: Page) {
  await page.goto("/");
  await waitForHydration(input(page));
}

test.describe("slash palette", () => {
  test("US-025 F3.1: typing / in an empty input opens the palette above the input @desktop-only", async ({
    page,
  }) => {
    await openHome(page);

    await input(page).pressSequentially("/");

    await expect(listbox(page)).toBeVisible();
    const sheet = await listbox(page).boundingBox();
    const field = await input(page).boundingBox();
    if (sheet === null || field === null) throw new Error("the palette or the input has no box");
    expect(sheet.y + sheet.height).toBeLessThanOrEqual(field.y);
  });

  test("US-025 F3.1: the palette is a bottom sheet under 640 px @mobile-only", async ({ page }) => {
    await openHome(page);

    await input(page).pressSequentially("/");

    await expect(listbox(page)).toBeVisible();
    const sheet = await listbox(page).boundingBox();
    const viewport = page.viewportSize();
    if (sheet === null || viewport === null) throw new Error("no palette box or viewport");
    // A bottom sheet spans the screen width and sits on the bottom edge.
    expect(sheet.y + sheet.height).toBeCloseTo(viewport.height, 0);
    expect(sheet.width).toBeCloseTo(viewport.width, 0);
  });

  test("US-025 F3.1: a / typed after other text does not open it", async ({ page }) => {
    await openHome(page);

    await input(page).pressSequentially("hi/");

    await expect(input(page)).toHaveValue("hi/");
    await expect(listbox(page)).toHaveCount(0);
    await expect(input(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("US-025 F3.2: text after / filters by name and description", async ({ page }) => {
    await openHome(page);

    await input(page).pressSequentially("/cont");
    await expect(options(page)).toHaveCount(1);
    await expect(options(page)).toContainText(commandNamed("/contact").command);

    // "numbers" is in the Projects description only, so the match comes from the description.
    await input(page).fill("/numbers");
    await expect(options(page)).toHaveCount(1);
    await expect(options(page)).toContainText(projects.command);
  });

  test("US-025 F3.2: a query that matches nothing says so, with no listbox", async ({ page }) => {
    await openHome(page);

    await input(page).pressSequentially("/zzz");

    // The toast is a status region too, so the line is found by its text.
    await expect(page.getByRole("status").filter({ hasText: "No commands match" })).toBeVisible();
    await expect(listbox(page)).toHaveCount(0);
    await expect(input(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("US-025 F3.3: arrow keys move the highlight and wrap at both ends", async ({ page }) => {
    await openHome(page);
    await input(page).pressSequentially("/");
    const last = commands.length - 1;

    await page.keyboard.press("ArrowUp");
    await expect(options(page).nth(last)).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(options(page).nth(0)).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(options(page).nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("US-025 F3.3: Enter runs the highlighted command, as a chip click does, and clears the input", async ({
    page,
  }) => {
    await openHome(page);
    await input(page).pressSequentially("/");
    await page.keyboard.press("ArrowDown");

    await page.keyboard.press("Enter");

    // The same result as a chip click (F2.3): the visitor's message, the inline answer and the pushed URL.
    await expect(visitorMessages(page)).toHaveText([experience.label]);
    await expect(thread(page).getByText(experience.intro ?? experience.description)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${experience.answer}$`));
    await expect(input(page)).toHaveValue("");
    await expect(listbox(page)).toHaveCount(0);
  });

  test("US-025 F3.3: Tab runs the highlighted command and focus stays in the input", async ({
    page,
  }) => {
    await openHome(page);
    await input(page).pressSequentially("/");

    await page.keyboard.press("Tab");

    await expect(visitorMessages(page)).toHaveText([about.label]);
    await expect(input(page)).toBeFocused();
  });

  test("US-025 F3.3: Esc closes the palette and keeps the typed text", async ({ page }) => {
    await openHome(page);
    await input(page).pressSequentially("/ab");
    await expect(listbox(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(listbox(page)).toHaveCount(0);
    await expect(input(page)).toHaveValue("/ab");
    await expect(input(page)).toBeFocused();

    // Typing again reopens it.
    await page.keyboard.type("o");
    await expect(listbox(page)).toBeVisible();
  });

  test("US-025 F3.4: the input is a combobox and the list is a listbox of options", async ({
    page,
  }) => {
    await openHome(page);

    await input(page).pressSequentially("/");

    await expect(input(page)).toHaveAttribute("aria-expanded", "true");
    await expect(input(page)).toHaveAttribute("aria-autocomplete", "list");
    await expect(listbox(page)).toBeVisible();
    await expect(options(page)).toHaveCount(commands.length);
  });

  test("US-025 F3.4: aria-activedescendant follows the highlight", async ({ page }) => {
    await openHome(page);
    await input(page).pressSequentially("/");
    const ids = await options(page).evaluateAll((elements) =>
      elements.map((element) => element.id),
    );

    await expect(input(page)).toHaveAttribute("aria-activedescendant", ids[0] ?? "");

    await page.keyboard.press("ArrowDown");
    await expect(input(page)).toHaveAttribute("aria-activedescendant", ids[1] ?? "");
  });

  test("US-025 F3.5: the More chip opens the palette with every command", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(moreChip(page));

    await moreChip(page).click();

    await expect(listbox(page)).toBeVisible();
    await expect(options(page)).toHaveCount(commands.length);
    await expect(input(page)).toBeFocused();
  });

  test("US-025: palette entries come from commands.json, chip or not", async ({ page }) => {
    await openHome(page);

    await input(page).pressSequentially("/");

    await expect(options(page)).toHaveText(
      commands.map((command) => `${command.command} ${command.description}`),
    );
  });

  test.describe("with JavaScript off", () => {
    test.use({ javaScriptEnabled: false });

    test("US-025: the More chip is not shown with JavaScript off", async ({ page }) => {
      await page.goto("/");

      // A hidden button is left out of getByRole unless includeHidden is set. Including it proves the button is
      // in the HTML and that CSS hides it, rather than the test finding nothing.
      const hidden = page.getByRole("button", { name: "More", includeHidden: true });
      await expect(hidden).toHaveCount(1);
      await expect(hidden).toBeHidden();
    });
  });
});
