import { describe, expect, it } from "vitest";
import { createCitationStripper } from "@/lib/citations";

// Pushes each chunk, then finishes, and returns what a visitor would have received, plus the cited ids.
function run(chunks: string[]) {
  const stripper = createCitationStripper();
  const text = chunks.map((chunk) => stripper.push(chunk)).join("") + stripper.finish();
  return { text, cited: stripper.cited() };
}

describe("US-030", () => {
  it("US-030: a citation inside one chunk is removed with the space before it", () => {
    expect(run(["Years of QA [src:about]."]).text).toBe("Years of QA.");
    expect(run(["Years. [src:about] Next"]).text).toBe("Years. Next");
  });

  it("US-030: a citation split across chunks, even one character at a time, is removed and nothing of it is sent", () => {
    const stripper = createCitationStripper();
    const sent = "Years of QA[src:about]. Next"
      .split("")
      .map((character) => stripper.push(character));

    expect(sent.join("") + stripper.finish()).toBe("Years of QA. Next");
    expect(sent.some((piece) => piece.includes("src") || piece.includes("["))).toBe(false);
    expect(stripper.cited()).toEqual(["about"]);
  });

  it("US-030: text that only looks like the start of a citation is released unchanged once it can't be one", () => {
    expect(run(["a [s", "x"]).text).toBe("a [sx");
    expect(run(["[ src", " is nice"]).text).toBe("[ src is nice");
    expect(run(["[", "1 of 3]"]).text).toBe("[1 of 3]");
  });

  it('US-030: "[ src : about ]" and "[SRC:about]" are removed like "[src:about]"', () => {
    expect(run(["Yes [ src : about ] ok"])).toEqual({ text: "Yes ok", cited: ["about"] });
    expect(run(["Yes [SRC:about] ok"])).toEqual({ text: "Yes ok", cited: ["about"] });
  });

  it('US-030: an id list "[src:a, b]" and back-to-back citations give every id, once, in order', () => {
    const result = run(["One [src:a, b] two [src:b][src:c][src:a]."]);

    expect(result.cited).toEqual(["a", "b", "c"]);
    expect(result.text).toBe("One two.");
  });

  it("US-030: a citation that never closes is dropped when the answer ends, and the other held text is released", () => {
    expect(run(["Yes [src:about"])).toEqual({ text: "Yes", cited: [] });
    expect(run(["Yes [src:about is fine, and this is more text"])).toEqual({
      text: "Yes",
      cited: [],
    });
  });

  it("US-030: finish returns the held text without trailing whitespace", () => {
    const stripper = createCitationStripper();
    const sent = stripper.push("Done") + stripper.push(" ");

    expect(sent).toBe("Done");
    expect(stripper.finish()).toBe("");
  });

  it("US-030: a bracket that is still open after 120 characters is released as text", () => {
    const long = `[src:${"x".repeat(125)}`;

    expect(run([long]).text).toBe(long);
  });

  it("US-030: however the answer is split, no citation text is sent and the cited ids are the same", () => {
    const answer =
      "Years of QA [src:about]. I build tools [src:projects/atlas-api] and [ src : skills ].";
    const whole = run([answer]);
    // A space that ends one chunk is sent with it (US-029 needs "Hello " sent whole), so when a citation
    // comes in the next chunk, a space can be left before the punctuation after it. Only that space differs.
    const collapse = (text: string) => text.replace(/ +([.,;:!?])/g, "$1").replace(/ +/g, " ");

    expect(whole.text).toBe("Years of QA. I build tools and.");
    for (let at = 0; at <= answer.length; at += 1) {
      const split = run([answer.slice(0, at), answer.slice(at)]);
      expect(split.cited).toEqual(["about", "projects/atlas-api", "skills"]);
      expect(split.text).not.toMatch(/[[\]]|src/);
      expect(collapse(split.text)).toBe(collapse(whole.text));
    }
  });
});
