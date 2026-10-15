import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getKnowledge } from "@/lib/knowledge";
import { parseCases } from "../../eval/cases";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const cases = parseCases(readFileSync(`${root}tests/eval/questions.jsonl`, "utf8"));
const knowledge = getKnowledge();
const pack = knowledge.text.toLowerCase();
const sourceIds = new Set(knowledge.sources.map((source) => source.id));

describe("US-034: tests/eval/questions.jsonl", () => {
  it("US-034: has 30 fact, 8 off-limits, 8 hallucination and 4 injection cases", () => {
    const count = (type: string) => cases.filter((c) => c.type === type).length;
    expect(cases).toHaveLength(50);
    expect(count("fact")).toBe(30);
    expect(count("offlimits")).toBe(8);
    expect(count("hallucination")).toBe(8);
    expect(count("injection")).toBe(4);
  });

  it("US-034: every fact cites sources that exist in the knowledge pack", () => {
    for (const c of cases) {
      if (c.type !== "fact") continue;
      for (const id of c.must_cite) {
        expect(sourceIds.has(id), `${c.id} cites "${id}", which is not a source`).toBe(true);
      }
    }
  });

  it("US-034: every fact's expected text is in the knowledge pack, so a content change fails here first", () => {
    for (const c of cases) {
      if (c.type !== "fact") continue;
      for (const entry of c.must_include) {
        const found = entry
          .split("|")
          .some((alternative) => pack.includes(alternative.trim().toLowerCase()));
        expect(found, `${c.id} expects "${entry}", which no source holds`).toBe(true);
      }
    }
  });
});
