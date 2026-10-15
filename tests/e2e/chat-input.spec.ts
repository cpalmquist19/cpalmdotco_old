import { expect, test, type Locator, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import { chat, chatBody, stubChat } from "@/tests/e2e/helpers/chat-stream";
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

// The command named `name`. A missing one fails the test.
function commandNamed(name: string) {
  const command = commandsData.find((item) => item.command === name);
  if (command === undefined) throw new Error(`commands.json has no ${name}`);
  return command;
}

const about = commandNamed("/about");

const input = (page: Page) => page.getByRole("combobox", { name: "Ask about Caleb" });
const headline = (page: Page) => page.getByRole("heading", { level: 1 });
const thread = (page: Page) => page.getByTestId("thread");
// The answer that is still streaming. It has no role or name, so it is found by test id (CODING § 9).
const inFlight = (page: Page) => page.getByTestId("in-flight");
const counter = (page: Page) => page.getByTestId("input-counter");
const facts = (page: Page) => page.getByTestId("headline-fact");
// The sidebar's link. It's shown on desktop only; the drawer on mobile is not in the tests (see the tags below).
const newChat = (page: Page) => page.getByRole("link", { name: "New chat", exact: true });
const chipList = (page: Page) => page.getByRole("list", { name: "Suggested questions" });

// An answer long enough that a few of them run past the bottom of the screen.
const LONG_ANSWER = Array.from({ length: 80 }, (_, index) => `word${index}`).join(" ");

async function openPage(page: Page) {
  await page.goto("/");
  await waitForHydration(input(page));
}

// The fake clock stops just past the load, so timers only fire when a test calls runFor (CODING § 9).
async function openWithFakeClock(page: Page) {
  await page.clock.install();
  await page.goto("/");
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await waitForHydration(input(page));
}

// The box of a locator. An element without a box fails the test, rather than passing by being skipped.
async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("the element has no box on the page");
  return box;
}

// Asks a typed question with Enter, so the input keeps focus, and streams `answer` to its end.
async function askAndFinish(page: Page, question: string, answer: string) {
  await input(page).fill(question);
  await input(page).press("Enter");
  await chat(page).open();
  await chat(page).send("token", { t: answer });
  await chat(page).send("done", {});
  await expect(thread(page)).toContainText(answer);
}

test.describe("pinned chat input, counter and New chat", () => {
  test.beforeEach(async ({ page }) => {
    await stubChat(page);
  });

  test("US-081 F4.5: before any question the input is under the headline", async ({ page }) => {
    await openPage(page);

    const heading = await boxOf(headline(page));
    const field = await boxOf(input(page));
    expect(field.y).toBeGreaterThanOrEqual(heading.y + heading.height);
  });

  test("US-081 F4.5: after a question the input is at the bottom of the screen, and still there after the thread has scrolled", async ({
    page,
  }) => {
    await openPage(page);
    await askAndFinish(page, "What AI work have you done?", LONG_ANSWER);

    const screen = await page.evaluate(() => window.innerHeight);
    // The counter line sits under the input and the strip has padding, so the input's bottom is a little above the
    // screen's bottom edge. Anything within 80 px of it counts as pinned.
    const pinned = async () => {
      const field = await boxOf(input(page));
      expect(field.y + field.height).toBeGreaterThan(screen - 80);
      expect(field.y + field.height).toBeLessThanOrEqual(screen);
    };
    await pinned();

    await askAndFinish(page, "How do you test?", LONG_ANSWER);
    await askAndFinish(page, "Where did you learn it?", LONG_ANSWER);
    await page.evaluate(() => window.scrollTo(0, 300));
    await pinned();
  });

  test("US-081 F4.5: the input keeps focus and its text when it moves to the bottom", async ({
    page,
  }) => {
    await openPage(page);
    const field = input(page);
    // A marker on the element: if the input were remounted when it moves, the marker would be gone.
    await field.evaluate((element) => {
      element.dataset.moved = "not yet";
    });

    await field.fill("First question");
    await field.press("Enter");
    await expect(field).toHaveAttribute("data-moved", "not yet");
    await expect(field).toBeFocused();

    await page.keyboard.type("Half-written");
    await expect(field).toHaveValue("Half-written");
    await expect(field).toBeFocused();
    await expect(field).toHaveAttribute("data-moved", "not yet");
  });

  test("US-081 F4.5: the input grows to 6 lines and then scrolls inside itself", async ({
    page,
  }) => {
    await openPage(page);
    const field = input(page);
    const lines = (count: number) => Array.from({ length: count }, () => "line").join("\n");

    const one = await boxOf(field);
    await field.fill(lines(3));
    const three = await boxOf(field);
    expect(three.height).toBeGreaterThan(one.height);

    await field.fill(lines(6));
    const six = await boxOf(field);
    expect(six.height).toBeGreaterThan(three.height);
    await expect(field).toHaveCSS("overflow-y", "hidden");

    await field.fill(lines(10));
    const ten = await boxOf(field);
    expect(ten.height).toBeCloseTo(six.height, 0);
    await expect(field).toHaveCSS("overflow-y", "auto");
  });

  test("US-085 F4.5: the Send button is centred vertically on the input", async ({ page }) => {
    await openPage(page);

    const field = await boxOf(input(page));
    const send = await boxOf(page.getByRole("button", { name: "Send" }));
    expect(Math.abs(send.y + send.height / 2 - (field.y + field.height / 2))).toBeLessThanOrEqual(
      0.5,
    );
  });

  test("US-085 F2.1: before a conversation the chips sit close under the input, with or without the counter", async ({
    page,
  }) => {
    await openPage(page);
    const field = input(page);
    const chips = page.getByRole("list", { name: "Suggested questions" });

    const gapUnder = async () => {
      const pill = await boxOf(field);
      const row = await boxOf(chips);
      return row.y - (pill.y + pill.height);
    };

    const before = await gapUnder();
    expect(before).toBeLessThanOrEqual(24);

    // The counter is inside the pill, so showing it adds nothing under the input. The text wraps and the input
    // grows, which moves the chips with its bottom edge, so the gap is what's compared.
    await field.fill("x".repeat(450));
    await expect(counter(page)).toHaveText("50 left");
    expect(await gapUnder()).toBeCloseTo(before, 0);
  });

  test("US-081 F4.9: no counter at 400 characters, a counter at 401, and the input stops at 500", async ({
    page,
  }) => {
    await openPage(page);
    const field = input(page);

    await field.fill("x".repeat(400));
    await expect(counter(page)).toBeEmpty();

    await field.fill("x".repeat(401));
    await expect(counter(page)).toHaveText("99 left");

    await field.fill("x".repeat(600));
    await expect(field).toHaveValue("x".repeat(500));
    await expect(counter(page)).toHaveText("0 left");
  });

  test("US-081 F4.9: the counter is a polite live region", async ({ page }) => {
    await openPage(page);

    await expect(counter(page)).toHaveAttribute("aria-live", "polite");
    await expect(counter(page)).toHaveAttribute("aria-atomic", "true");
  });

  test("US-081 F4.6: New chat clears the thread, returns the input under the headline and the URL to / @desktop-only", async ({
    page,
  }) => {
    await openPage(page);
    // A chip moves the URL to its page, so the check below sees New chat put it back to /.
    await chipList(page).getByRole("link", { name: about.label }).click();
    await expect(thread(page)).toContainText(about.label);

    await newChat(page).click();

    await expect(thread(page)).toBeEmpty();
    expect(new URL(page.url()).pathname).toBe("/");
    const heading = await boxOf(headline(page));
    const field = await boxOf(input(page));
    expect(field.y).toBeGreaterThanOrEqual(heading.y + heading.height);
  });

  test("US-081 F4.6: New chat leaves the headline on the same facts and doesn't type them again @desktop-only", async ({
    page,
  }) => {
    await openWithFakeClock(page);
    // A marker on the headline: a remount would drop it, and then the cycle would start over.
    await headline(page).evaluate((element) => {
      element.dataset.kept = "yes";
    });
    const before = await facts(page).allTextContents();

    await input(page).fill("A question");
    await input(page).press("Enter");
    await chat(page).open();
    await chat(page).send("token", { t: "An answer" });
    await chat(page).send("done", {});
    await expect(thread(page)).toContainText("An answer");

    await newChat(page).click();

    await expect(thread(page)).toBeEmpty();
    await expect(headline(page)).toHaveAttribute("data-kept", "yes");
    await expect(facts(page)).toHaveText(before);
  });

  test("US-081 F4.6: New chat during a stream stops the answer @desktop-only", async ({ page }) => {
    await openPage(page);
    await input(page).fill("A long question");
    await input(page).press("Enter");
    await chat(page).open();
    await chat(page).send("token", { t: "Partial answer" });
    await expect(inFlight(page)).toContainText("Partial answer");

    await newChat(page).click();

    await expect(inFlight(page)).toHaveCount(0);
    await expect(thread(page)).toBeEmpty();
    // The stream is stopped, so the running answer no longer blocks Send: a new question is sent at once.
    await input(page).fill("A new question");
    await input(page).press("Enter");
    await expect.poll(() => chatBody(page)).toContain("A new question");
  });

  test("US-081 F4.6: Back after New chat returns to the cleared conversation @desktop-only", async ({
    page,
  }) => {
    await openPage(page);
    await askAndFinish(page, "First question", "First answer");

    await newChat(page).click();
    await expect(thread(page)).toBeEmpty();

    await page.goBack();
    await expect(thread(page)).toContainText("First answer");
  });

  test("US-081 F4.6: on a content page New chat loads the home page with no thread @desktop-only", async ({
    page,
  }) => {
    await page.goto(about.answer);
    await expect(newChat(page)).toBeVisible();

    await newChat(page).click();

    await waitForHydration(input(page));
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(thread(page)).toBeEmpty();
  });

  test("US-081 F4.5: the last message isn't hidden behind the pinned input", async ({ page }) => {
    await openPage(page);
    await askAndFinish(page, "First question", LONG_ANSWER);
    await askAndFinish(page, "Second question", LONG_ANSWER);
    await askAndFinish(page, "Third question", LONG_ANSWER);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    // The last element in the thread is the end of the last message. It must end above the input's top edge.
    const last = await boxOf(thread(page).locator("*").last());
    const field = await boxOf(input(page));
    expect(last.y + last.height).toBeLessThanOrEqual(field.y);
  });
});
