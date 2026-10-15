import { expect, test, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import { errorLine } from "@/lib/chat-errors";
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
const sendButton = (page: Page) => page.getByRole("button", { name: "Send" });
const thread = (page: Page) => page.getByTestId("thread");
// The answer that is still streaming. It has no role or name, so it is found by test id (CODING § 9).
const inFlight = (page: Page) => page.getByTestId("in-flight");
// A visitor's bubble has no role, so it's found by test id (CODING § 9).
const visitorMessages = (page: Page) => page.getByTestId("visitor-message");
const chipList = (page: Page) => page.getByRole("list", { name: "Suggested questions" });
const newestFact = (page: Page) => page.getByTestId("headline-fact").last();

// The clock steps used to watch the headline move on, as in chips.spec.ts.
const clockStep = { timeout: 60_000, intervals: [0] };

async function openPage(page: Page) {
  await page.goto("/");
  await waitForHydration(input(page));
}

// Types a question and presses Send, as a visitor does.
async function ask(page: Page, question: string) {
  await input(page).fill(question);
  await sendButton(page).click();
}

// The text of a locator, read as a string.
async function textOf(page: Page, locator: ReturnType<Page["getByTestId"]>): Promise<string> {
  return (await locator.textContent()) ?? "";
}

test.describe("free-text chat thread", () => {
  test.beforeEach(async ({ page }) => {
    await stubChat(page);
  });

  test("US-032 F4.1: a typed question appears as a visitor bubble, the answer streams in with the caret, and the caret goes at done", async ({
    page,
  }) => {
    await openPage(page);

    await ask(page, "What AI work have you done?");
    await expect(visitorMessages(page)).toHaveText(["What AI work have you done?"]);
    await chat(page).open();
    await chat(page).send("token", { t: "I built " });

    await expect(inFlight(page)).toContainText("I built");
    await expect(inFlight(page).getByTestId("caret")).toHaveCount(1);

    await chat(page).send("token", { t: "test harnesses." });
    await chat(page).send("done", {});

    await expect(thread(page)).toContainText("I built test harnesses.");
    await expect(inFlight(page)).toHaveCount(0);
    await expect(thread(page).getByTestId("caret")).toHaveCount(0);
  });

  test("US-032 F4.1: the question is sent in a POST body that ends with it", async ({ page }) => {
    await openPage(page);

    await ask(page, "How do you test?");
    await expect.poll(() => chatBody(page)).toBeDefined();

    const sent: unknown = JSON.parse((await chatBody(page)) ?? "");
    expect(sent).toEqual({ messages: [{ role: "user", content: "How do you test?" }] });
  });

  test("US-032 F4.1: text starting with / is not sent", async ({ page }) => {
    await openPage(page);

    // "/zzz" matches no command, so Enter has nothing to run, and the text must not go as a question.
    await input(page).fill("/zzz");
    await expect(sendButton(page)).toBeDisabled();
    await input(page).press("Enter");

    await expect(input(page)).toHaveValue("/zzz");
    expect(await chatBody(page)).toBeUndefined();
    await expect(visitorMessages(page)).toHaveCount(0);
  });

  test("US-032 F4.2: the bubble is right-aligned and the answer is left-aligned with the avatar beside its first line", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Where have you worked?");
    await chat(page).open();
    await chat(page).send("token", { t: "Three roles, most recent first." });
    await chat(page).send("done", {});

    const bubble = await visitorMessages(page).boundingBox();
    const answer = await thread(page).getByText("Three roles, most recent first.").boundingBox();
    const avatar = await thread(page).getByTestId("avatar").boundingBox();
    if (bubble === null || answer === null || avatar === null) throw new Error("a box is missing");

    expect(bubble.x).toBeGreaterThan(answer.x);
    expect(avatar.x).toBeLessThan(answer.x);
    expect(Math.abs(avatar.y - answer.y)).toBeLessThan(20);
  });

  test("US-032 F4.3: headings, lists, links and inline code render, and raw HTML and a javascript: link do nothing", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Show me");
    await chat(page).open();
    await chat(page).send("token", {
      t: "## Projects\n\n- A **bold** item\n- Uses `code`\n\nSee [the about page](/about/). <b>raw</b> [bad](javascript:alert(1))",
    });
    await chat(page).send("done", {});

    await expect(thread(page).getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
    await expect(thread(page).getByRole("listitem")).toHaveText(["A bold item", "Uses code"]);
    await expect(thread(page).locator("code", { hasText: "code" })).toBeVisible();
    await expect(thread(page).getByRole("link", { name: "the about page" })).toHaveAttribute(
      "href",
      "/about/",
    );
    await expect(thread(page).locator("b")).toHaveCount(0);
    await expect(thread(page).getByRole("link", { name: "bad" })).toHaveCount(0);
    // The link's text stays as plain text in its paragraph, with no link around it.
    await expect(thread(page).locator("p", { hasText: "See" })).toContainText("bad");
  });

  test("US-032 F4.4: the answer ends with its links and follow-up chips, and a chip sends its question", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Tell me about yourself");
    await chat(page).open();
    await chat(page).send("token", { t: "I test software." });
    await chat(page).send("links", [
      { label: "About", href: "/about/" },
      { label: "Experience", href: "/experience/" },
    ]);
    await chat(page).send("followups", ["What's your background?", "Where have you worked?"]);
    await chat(page).send("done", {});

    await expect(thread(page).getByRole("link", { name: "About", exact: true })).toHaveAttribute(
      "href",
      "/about/",
    );
    await expect(
      thread(page).getByRole("link", { name: "Experience", exact: true }),
    ).toHaveAttribute("href", "/experience/");

    await thread(page).getByRole("button", { name: "What's your background?" }).click();
    await chat(page).open();
    await chat(page).send("done", {});

    await expect(visitorMessages(page)).toHaveText([
      "Tell me about yourself",
      "What's your background?",
    ]);
    const sent: unknown = JSON.parse((await chatBody(page)) ?? "");
    expect(sent).toEqual({
      messages: [
        { role: "user", content: "Tell me about yourself" },
        { role: "assistant", content: "I test software." },
        { role: "user", content: "What's your background?" },
      ],
    });
  });

  test("US-032 F4.5: Enter sends and Shift+Enter inserts a new line", async ({ page }) => {
    await openPage(page);

    await input(page).pressSequentially("First line");
    await input(page).press("Shift+Enter");
    await input(page).pressSequentially("second line");
    await expect(input(page)).toHaveValue("First line\nsecond line");
    expect(await chatBody(page)).toBeUndefined();

    await input(page).press("Enter");
    await expect.poll(() => chatBody(page)).toBeDefined();
    expect(await chatBody(page)).toContain("First line\\nsecond line");
    await expect(input(page)).toHaveValue("");
  });

  test("US-032 F4.5: Send is disabled while empty and while an answer streams", async ({
    page,
  }) => {
    await openPage(page);
    await expect(sendButton(page)).toBeDisabled();

    await input(page).fill("Hi there");
    await expect(sendButton(page)).toBeEnabled();
    await sendButton(page).click();
    await chat(page).open();
    await chat(page).send("token", { t: "Streaming" });
    await expect(inFlight(page)).toContainText("Streaming");

    await input(page).fill("Another question");
    await expect(sendButton(page)).toBeDisabled();
    await chat(page).send("done", {});
    await expect(sendButton(page)).toBeEnabled();
  });

  test("US-032 F4.9: the input stops at 500 characters", async ({ page }) => {
    await openPage(page);

    await input(page).fill("a".repeat(600));

    await expect(input(page)).toHaveValue("a".repeat(500));
  });

  test("US-032 F4.7: the live region never holds half an answer, and holds the finished one once", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Tell me more");
    await chat(page).open();
    await chat(page).send("token", { t: "Half an answer" });

    await expect(inFlight(page)).toContainText("Half an answer");
    await expect(thread(page)).not.toContainText("Half an answer");

    await chat(page).send("token", { t: " and the rest." });
    await chat(page).send("done", {});

    await expect(thread(page)).toContainText("Half an answer and the rest.");
    const text = await textOf(page, thread(page));
    expect(text.split("Half an answer and the rest.")).toHaveLength(2);
  });

  test("US-033 F4.7: the thread is an aria-live polite region", async ({ page }) => {
    await openPage(page);

    // The attribute is what a screen reader reads. The test above shows what it holds, not that it's announced.
    await expect(thread(page)).toHaveAttribute("aria-live", "polite");
  });

  test("US-032 F4.8: rate_limited, timeout and upstream each show their line and a link to the fallback page", async ({
    page,
  }) => {
    await openPage(page);
    const cases = [
      { code: "rate_limited", status: 429, fallback: "/projects/", label: "Projects" },
      { code: "timeout", status: 200, fallback: "/about/", label: "About" },
      { code: "upstream", status: 503, fallback: "/skills/", label: "Skills" },
    ] as const;

    for (const item of cases) {
      await ask(page, `A question that fails as ${item.code}`);
      await chat(page).open(item.status);
      await chat(page).send("error", { code: item.code, fallback: item.fallback });

      await expect(thread(page).getByText(errorLine(item.code))).toBeVisible();
      await expect(
        thread(page).getByRole("link", { name: `Go to the ${item.label} page` }),
      ).toHaveAttribute("href", item.fallback);
    }
  });

  test("US-032 F4.8: a 503 and an HTML 502 show the upstream line, and a stream that just closes does too", async ({
    page,
  }) => {
    await openPage(page);

    await ask(page, "First");
    await chat(page).open(503);
    await chat(page).send("error", { code: "upstream", fallback: "/about/" });
    await ask(page, "Second");
    await chat(page).reply(
      502,
      "text/html; charset=utf-8",
      "<html><body>Bad gateway</body></html>",
    );
    await ask(page, "Third");
    await chat(page).open(200);
    await chat(page).close();

    await expect(thread(page).getByText(errorLine("upstream"))).toHaveCount(3);
  });

  test("US-032 F4.8: text streamed before an error stays above its error line", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "A long question");
    await chat(page).open();
    await chat(page).send("token", { t: "Part of the answer" });
    await chat(page).send("error", { code: "timeout", fallback: "/about/" });

    const text = thread(page).getByText("Part of the answer");
    const line = thread(page).getByText(errorLine("timeout"));
    await expect(text).toBeVisible();
    await expect(line).toBeVisible();
    const answerBox = await text.boundingBox();
    const lineBox = await line.boundingBox();
    if (answerBox === null || lineBox === null) throw new Error("a box is missing");
    expect(answerBox.y).toBeLessThan(lineBox.y);
  });

  test("US-032 D-053: a chip click during a stream stops it and keeps the text so far", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Tell me about yourself");
    await chat(page).open();
    await chat(page).send("token", { t: "Keeping this" });
    await expect(inFlight(page)).toContainText("Keeping this");

    await chipList(page).getByRole("link", { name: about.label, exact: true }).click();

    await expect(visitorMessages(page)).toHaveText(["Tell me about yourself", about.label]);
    await expect(thread(page)).toContainText("Keeping this");
    await expect(inFlight(page)).toHaveCount(0);
    await expect(thread(page).getByText(errorLine("upstream"))).toHaveCount(0);
  });

  test("US-032 D-053: Back after a chip click restores the earlier thread, answer included", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "What have you built?");
    await chat(page).open();
    await chat(page).send("token", { t: "Some projects." });
    await chat(page).send("done", {});

    await chipList(page).getByRole("link", { name: about.label, exact: true }).click();
    await expect(visitorMessages(page)).toHaveText(["What have you built?", about.label]);

    await page.goBack();

    await expect(visitorMessages(page)).toHaveText(["What have you built?"]);
    await expect(thread(page)).toContainText("Some projects.");
  });

  test("US-032 F1.4: the headline stops once a question has been sent", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await waitForHydration(input(page));
    const newest = newestFact(page);
    const before = await newest.textContent();

    // The headline moves on by itself before the question, so a frozen headline after it is the question's doing.
    await expect
      .poll(async () => {
        await page.clock.runFor(500);
        return newest.textContent();
      }, clockStep)
      .not.toBe(before);

    await ask(page, "What have you built?");
    await chat(page).open();
    await chat(page).send("done", {});
    const frozen = await newest.textContent();
    await page.clock.runFor(10_000);

    await expect(newest).toHaveText(frozen ?? "");
  });

  test("US-032 F3: with the new input, / opens the palette and Enter runs a command rather than sending", async ({
    page,
  }) => {
    await openPage(page);

    await input(page).pressSequentially("/");
    await expect(page.getByRole("listbox")).toBeVisible();
    await input(page).press("Enter");

    await expect(visitorMessages(page)).toHaveCount(1);
    expect(await chatBody(page)).toBeUndefined();
  });

  test("US-032 F4.5: Enter during IME composition doesn't send", async ({ page }) => {
    await openPage(page);
    await input(page).fill("Ni hao");

    // A real IME is not drivable from Playwright, so the keydown the browser sends during composition is dispatched
    // with isComposing set, which is the flag the input reads.
    await page.evaluate(() => {
      document
        .getElementById("chat-input")
        ?.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }),
        );
    });

    await expect(input(page)).toHaveValue("Ni hao");
    expect(await chatBody(page)).toBeUndefined();
  });

  test("US-032 F3: a palette command while an answer streams stops it and keeps its text", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Tell me about yourself");
    await chat(page).open();
    await chat(page).send("token", { t: "Still going" });
    await expect(inFlight(page)).toContainText("Still going");

    await input(page).pressSequentially("/");
    await expect(page.getByRole("listbox")).toBeVisible();
    await input(page).press("Enter");

    await expect(visitorMessages(page)).toHaveCount(2);
    await expect(thread(page)).toContainText("Still going");
    await expect(inFlight(page)).toHaveCount(0);
  });

  test("US-032 F3: a sidebar ask while an answer streams stops it and keeps its text @desktop-only", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "Tell me about yourself");
    await chat(page).open();
    await chat(page).send("token", { t: "Keeps going" });
    await expect(inFlight(page)).toContainText("Keeps going");

    const sidebarAsk = page
      .getByRole("complementary", { name: "Sidebar" })
      .getByRole("list", { name: "ASK ABOUT" })
      .getByRole("link", { name: about.label, exact: true });
    await sidebarAsk.click();

    await expect(visitorMessages(page)).toHaveText(["Tell me about yourself", about.label]);
    await expect(thread(page)).toContainText("Keeps going");
    await expect(inFlight(page)).toHaveCount(0);
  });

  test("US-032 D-053: Back during a stream stops it and shows the earlier thread", async ({
    page,
  }) => {
    await openPage(page);
    await ask(page, "First question");
    await chat(page).open();
    await chat(page).send("token", { t: "First answer." });
    await chat(page).send("done", {});
    await chipList(page).getByRole("link", { name: about.label, exact: true }).click();
    await ask(page, "Second question");
    await chat(page).open();
    await chat(page).send("token", { t: "Cut short" });

    await page.goBack();

    await expect(visitorMessages(page)).toHaveText(["First question"]);
    await expect(thread(page)).toContainText("First answer.");
    await expect(thread(page)).not.toContainText("Cut short");
    await expect(inFlight(page)).toHaveCount(0);
  });
});
