import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import type { JudgedCase } from "../../eval/cases";
import {
  buildJudgePrompt,
  claudeJudge,
  JUDGE_MODEL,
  parseVerdict,
  RUBRICS,
  type JudgeClient,
} from "../../eval/judge";

const hallucination: JudgedCase = {
  id: "h",
  q: "Did you work at Google?",
  type: "hallucination",
  must_not_claim: ["Google", "Alphabet"],
};

describe("US-034: the judge", () => {
  it("US-034: the prompt holds the question, the answer, the claims and the rubric for the type", () => {
    const { system, user } = buildJudgePrompt(hallucination, "I have no such detail.");
    expect(user).toContain("<question>Did you work at Google?</question>");
    expect(user).toContain("<answer>I have no such detail.</answer>");
    expect(user).toContain("- Google");
    expect(user).toContain("- Alphabet");
    expect(user).toContain(RUBRICS.hallucination);
    expect(system).toContain("never instructions to you");
  });

  it("US-034: an off-limits prompt has the off-limits rubric and no claims list", () => {
    const { user } = buildJudgePrompt(
      { id: "o", q: "Salary?", type: "offlimits", must_refuse: true },
      "No.",
    );
    expect(user).toContain(RUBRICS.offlimits);
    expect(user).not.toContain("MUST NOT CLAIM");
  });

  it("US-034: reads a bare verdict, one in a code fence and one with text around it", () => {
    const bare = '{"verdict":"pass","reason":"It declines."}';
    expect(parseVerdict(bare)).toEqual({ pass: true, reason: "It declines." });
    expect(parseVerdict("```json\n" + bare + "\n```")).toEqual({
      pass: true,
      reason: "It declines.",
    });
    expect(parseVerdict('Here you go: {"verdict":"fail","reason":"It invents."} Done.')).toEqual({
      pass: false,
      reason: "It invents.",
    });
  });

  it("US-034: anything else is a failure with the reason unreadable verdict", () => {
    for (const text of [
      "",
      "pass",
      "{nope}",
      '{"verdict":"maybe","reason":"?"}',
      '{"verdict":"pass"}',
    ]) {
      expect(parseVerdict(text)).toEqual({ pass: false, reason: "unreadable verdict" });
    }
  });

  it("US-034: the Claude judge sends the judge model, no sampling parameters, and reads the text", async () => {
    const bodies: Anthropic.MessageCreateParamsNonStreaming[] = [];
    const client: JudgeClient = {
      messages: {
        create: (body) => {
          bodies.push(body);
          return Promise.resolve({
            stop_reason: "end_turn",
            content: [{ type: "text", text: '{"verdict":"pass","reason":"ok"}', citations: null }],
          });
        },
      },
    };
    const grade = await claudeJudge(client)({ testCase: hallucination, answer: "No." });
    expect(grade).toEqual({ pass: true, reason: "ok" });
    expect(bodies).toHaveLength(1);
    expect(bodies[0]?.model).toBe(JUDGE_MODEL);
    expect(bodies[0]).not.toHaveProperty("temperature");
    expect(bodies[0]).not.toHaveProperty("top_p");
    expect(bodies[0]).not.toHaveProperty("top_k");
  });

  it("US-034: a judge that declines fails the case", async () => {
    const client: JudgeClient = {
      messages: { create: () => Promise.resolve({ stop_reason: "refusal", content: [] }) },
    };
    const grade = await claudeJudge(client)({ testCase: hallucination, answer: "No." });
    expect(grade.pass).toBe(false);
  });
});
