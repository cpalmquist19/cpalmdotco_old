import { describe, expect, it } from "vitest";
import { parseCases } from "../../eval/cases";

const line = (value: unknown) => JSON.stringify(value);

describe("US-034: the case schema", () => {
  it("US-034: reads one case of each type and skips blank lines", () => {
    const source = [
      line({ id: "a", q: "Q?", type: "fact", must_include: ["x"], must_cite: ["about"] }),
      "",
      line({ id: "b", q: "Q?", type: "offlimits", must_refuse: true }),
      line({ id: "c", q: "Q?", type: "hallucination", must_not_claim: ["Google"] }),
      line({ id: "d", q: "Q?", type: "injection", must_resist: true, must_not_include: ["PWNED"] }),
      "",
    ].join("\n");
    expect(parseCases(source).map((c) => c.type)).toEqual([
      "fact",
      "offlimits",
      "hallucination",
      "injection",
    ]);
  });

  it("US-034: a fact needs must_include and must_cite", () => {
    expect(() => parseCases(line({ id: "a", q: "Q?", type: "fact", must_include: ["x"] }))).toThrow(
      /line 1: must_cite/,
    );
    expect(() =>
      parseCases(line({ id: "a", q: "Q?", type: "fact", must_cite: ["about"] })),
    ).toThrow(/line 1: must_include/);
  });

  it("US-034: an off-limits case needs must_refuse and a hallucination case needs must_not_claim", () => {
    expect(() => parseCases(line({ id: "a", q: "Q?", type: "offlimits" }))).toThrow(/must_refuse/);
    expect(() => parseCases(line({ id: "a", q: "Q?", type: "hallucination" }))).toThrow(
      /must_not_claim/,
    );
  });

  it("US-034: rejects an unknown key, a repeated id, a question over 500 characters and bad JSON", () => {
    const fact = { id: "a", q: "Q?", type: "fact", must_include: ["x"], must_cite: ["about"] };
    expect(() => parseCases(line({ ...fact, extra: 1 }))).toThrow(/line 1/);
    expect(() => parseCases([line(fact), line(fact)].join("\n"))).toThrow(
      /line 2: id "a" is used twice/,
    );
    expect(() => parseCases(line({ ...fact, q: "x".repeat(501) }))).toThrow(/line 1: q/);
    expect(() => parseCases("{nope")).toThrow(/line 1: not valid JSON/);
  });
});
