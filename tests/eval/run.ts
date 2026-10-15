import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { anthropicProvider, CHAT_MODEL } from "@/lib/chat-provider";
import { getKnowledge } from "@/lib/knowledge";
import { createAnswerer } from "./answer";
import { parseCases } from "./cases";
import { claudeJudge, JUDGE_MODEL } from "./judge";
import { logLines, runEval } from "./runner";

// The live eval (US-034): 50 questions through the real chat handler and the real model, graded by string
// checks and a judge model. Run it with `npm run eval` and a key in ANTHROPIC_API_KEY. It is not part of
// `npm run verify`, because it spends money. It writes eval-report.json and eval-log.jsonl to the repo root.
test("US-034: the bot stays grounded", { timeout: 15 * 60 * 1000 }, async () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key === undefined || key === "") {
    throw new Error("ANTHROPIC_API_KEY is not set: the eval needs a real key (US-084)");
  }

  const root = process.cwd();
  const cases = parseCases(readFileSync(path.join(root, "tests/eval/questions.jsonl"), "utf8"));
  const known = new Set(getKnowledge().sources.map((source) => source.id));

  const { results, report } = await runEval(cases, {
    answer: createAnswerer(anthropicProvider()),
    judge: claudeJudge(),
    known,
    models: { answer: CHAT_MODEL, judge: JUDGE_MODEL },
  });

  writeFileSync(path.join(root, "eval-log.jsonl"), logLines(results));
  writeFileSync(path.join(root, "eval-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  // The run's log is public in CI, so only the verdicts are printed: no answer text.
  const lines = results
    .filter((result) => !result.pass)
    .map((result) => `  FAIL ${result.id} (${result.method}): ${result.reason}`);
  process.stdout.write(
    [
      `eval: ${String(report.passed)}/${String(report.total)} passed (bar ${String(report.passBar.minPassed)})`,
      ...Object.entries(report.byType).map(
        ([type, count]) => `  ${type}: ${String(count.passed)}/${String(count.total)}`,
      ),
      ...lines,
      "",
    ].join("\n"),
  );

  expect(report.ok, "the eval is under the pass bar: see eval-log.jsonl").toBe(true);
});
