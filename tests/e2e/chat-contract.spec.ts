import { expect, test, type Page } from "@playwright/test";
import commandsData from "@/content/commands.json" with { type: "json" };
import { errorLine } from "@/lib/chat-errors";
import { waitForHydration } from "@/tests/e2e/helpers/hydration";

// The real /api/chat route, with the fake model API behind it (D-061). Nothing here stubs fetch: these tests check
// what the server sends and what the browser shows of it. The fake's markers are described in its header.

const input = (page: Page) => page.getByRole("combobox", { name: "Ask about Caleb" });
const sendButton = (page: Page) => page.getByRole("button", { name: "Send" });
const thread = (page: Page) => page.getByTestId("thread");

type Frame = { event: string; data: unknown };
type Streamed = { status: number; arrivals: string[][]; frames: Frame[] };

// Each test is its own client, so the rate limiter counts it alone (Notes: rate limit keys).
async function ownClient(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": crypto.randomUUID() });
}

async function openPage(page: Page) {
  await page.goto("/");
  await waitForHydration(input(page));
}

// Types a question and presses Send, as a visitor does.
async function ask(page: Page, question: string) {
  await input(page).fill(question);
  await sendButton(page).click();
}

// Posts a question to /api/chat from the page, and reads the stream as it arrives. `arrivals` holds the event names
// that had arrived after each read, so its first entry is what came before the answer was complete.
async function streamQuestion(page: Page, question: string): Promise<Streamed> {
  return page.evaluate(async (content) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content }] }),
    });
    const reader = response.body?.getReader();
    if (reader === undefined) throw new Error("the response has no body");

    const decoder = new TextDecoder();
    const frames: { event: string; data: unknown }[] = [];
    const arrivals: string[][] = [];
    let pending = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      const parts = pending.split("\n\n");
      pending = parts.pop() ?? "";
      for (const part of parts) {
        const event = /^event: (.+)$/m.exec(part)?.[1] ?? "";
        const data = /^data: (.+)$/m.exec(part)?.[1] ?? "null";
        frames.push({ event, data: JSON.parse(data) as unknown });
      }
      arrivals.push(frames.map((frame) => frame.event));
    }
    return { status: response.status, arrivals, frames };
  }, question);
}

// The question that is `length` characters long and still asks for the fake's short answer.
function questionOf(length: number): string {
  const marker = "[fake:short] ";
  return marker + "a".repeat(length - marker.length);
}

test.describe("chat contract through the real route", () => {
  test("US-033 contract: token events arrive before the answer is complete, then links, followups and done in that order", async ({
    page,
  }) => {
    await ownClient(page);
    await openPage(page);

    const streamed = await streamQuestion(page, "How do you test?");

    expect(streamed.status).toBe(200);
    // The first read already holds a token and not the end of the answer: a buffering proxy would fail this.
    expect(streamed.arrivals[0]).toContain("token");
    expect(streamed.arrivals[0]).not.toContain("done");
    // Consecutive events of one kind count once, so this is the order of kinds, with every token before the links.
    const names = streamed.frames.map((frame) => frame.event);
    expect(names.filter((name, index) => name !== names[index - 1])).toEqual([
      "token",
      "links",
      "followups",
      "done",
    ]);
  });

  test("US-033 F4.1 F4.4: a question through the real route shows the answer without its citation, with its page links and follow-up chips", async ({
    page,
  }) => {
    await ownClient(page);
    await openPage(page);

    await ask(page, "What AI work have you done?");

    // The fake cites the profile source, whose page is Contact. The citation is taken out of the text.
    await expect(thread(page)).toContainText("Here is what I built.");
    await expect(thread(page)).toContainText("It is on the page.");
    await expect(thread(page)).not.toContainText("src:");
    await expect(thread(page).getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
      "href",
      "/contact/",
    );

    // Three follow-ups, in commands.json order, skipping the question whose page is the one already linked.
    const followups = commandsData
      .filter(
        (command) => command.question !== undefined && !"/contact/".startsWith(command.answer),
      )
      .sort((a, b) => a.order - b.order)
      .slice(0, 3)
      .map((command) => command.question ?? "");
    expect(followups).toHaveLength(3);
    for (const question of followups) {
      await expect(thread(page).getByRole("button", { name: question, exact: true })).toBeVisible();
    }
  });

  test("US-033 F4.8: a model failure arrives as one upstream error event with a fallback page, and the thread shows the line and the link", async ({
    page,
  }) => {
    await ownClient(page);
    await openPage(page);
    const question = "[fake:upstream] What do you know about projects?";

    const streamed = await streamQuestion(page, question);
    expect(streamed.frames).toEqual([
      { event: "error", data: { code: "upstream", fallback: "/projects/" } },
    ]);

    await ask(page, question);
    await expect(thread(page).getByText(errorLine("upstream"))).toBeVisible();
    await expect(
      thread(page).getByRole("link", { name: "Go to the Projects page" }),
    ).toHaveAttribute("href", "/projects/");
  });

  test("US-033 F4.8: a model rate limit arrives as one rate_limited error event with a fallback page", async ({
    page,
  }) => {
    await ownClient(page);
    await openPage(page);

    const streamed = await streamQuestion(page, "[fake:rate-limited] What have you built?");

    expect(streamed.status).toBe(200);
    expect(streamed.frames).toEqual([
      { event: "error", data: { code: "rate_limited", fallback: "/about/" } },
    ]);
  });

  test("US-033 contract: a 501-character question gets 400, and a 500-character one is answered @chromium-only @desktop-only", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": crypto.randomUUID() };

    const tooLong = await request.post("/api/chat", {
      headers,
      data: { messages: [{ role: "user", content: "a".repeat(501) }] },
    });
    expect(tooLong.status()).toBe(400);

    const atLimit = await request.post("/api/chat", {
      headers,
      data: { messages: [{ role: "user", content: questionOf(500) }] },
    });
    expect(atLimit.status()).toBe(200);
    expect(await atLimit.text()).toContain("event: done\n");
  });

  test("US-033 contract: the 11th request in a minute gets 429 with Retry-After and a rate_limited error event @chromium-only @desktop-only", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": crypto.randomUUID() };
    const data = { messages: [{ role: "user", content: "[fake:short] What have you built?" }] };

    for (let count = 1; count <= 10; count += 1) {
      const allowed = await request.post("/api/chat", { headers, data });
      expect(allowed.status(), `request ${String(count)}`).toBe(200);
      await allowed.text();
    }

    const refused = await request.post("/api/chat", { headers, data });
    expect(refused.status()).toBe(429);
    expect(Number(refused.headers()["retry-after"])).toBeGreaterThan(0);
    expect(await refused.text()).toBe(
      `event: error\ndata: ${JSON.stringify({ code: "rate_limited", fallback: "/about/" })}\n\n`,
    );
  });
});
