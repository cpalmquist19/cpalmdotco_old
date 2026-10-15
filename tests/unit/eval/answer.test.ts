import { describe, expect, it } from "vitest";
import { ChatProviderError, type ChatProvider } from "@/lib/chat-provider";
import { createAnswerer, parseEvents } from "../../eval/answer";

function providerOf(chunks: string[]): ChatProvider {
  return async function* () {
    for (const chunk of chunks) yield chunk;
  };
}

describe("US-034: running one question through the chat handler", () => {
  it("US-034: parses the stream's events", () => {
    const body = 'event: token\ndata: {"t":"Hi"}\n\nevent: done\ndata: {}\n\n';
    expect(parseEvents(body)).toEqual([
      { event: "token", data: { t: "Hi" } },
      { event: "done", data: {} },
    ]);
  });

  it("US-034: joins the tokens without their citations and reads the links", async () => {
    const answer = await createAnswerer(
      providerOf(["Atlas has 1,240 tests [src:projects/atlas-api]."]),
    )("How many tests?");
    expect(answer.text).toBe("Atlas has 1,240 tests.");
    expect(answer.links).toEqual([{ label: "Project Atlas", href: "/projects/atlas-api/" }]);
    expect(answer.error).toBeUndefined();
  });

  it("US-034: reads the cited ids from the model's raw text, including one that is not a source", async () => {
    const answer = await createAnswerer(
      providerOf(["Yes [src:about, skills] and [src:projects/made-up]."]),
    )("Q?");
    expect(answer.cited).toEqual(["about", "skills", "projects/made-up"]);
    // Only a real source becomes a link.
    expect(answer.links.map((link) => link.href)).not.toContain("/projects/made-up/");
  });

  it("US-034: reports an error event with its code and the reason the route logged", async () => {
    const failing: ChatProvider = async function* () {
      yield "";
      throw new ChatProviderError("upstream", "the model request failed (status 529)");
    };
    const answer = await createAnswerer(failing)("Q?");
    expect(answer.error?.code).toBe("upstream");
    expect(answer.detail).toBe("the model request failed (status 529)");
  });
});
