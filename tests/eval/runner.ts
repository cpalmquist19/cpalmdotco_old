import type { Answerer } from "./answer";
import type { EvalCase } from "./cases";
import {
  forbiddenPhrase,
  gradeFact,
  summarise,
  type Answer,
  type CaseResult,
  type Report,
} from "./grade";
import type { Judge } from "./judge";

export type RunDeps = {
  answer: Answerer;
  judge: Judge;
  // The source ids in the knowledge pack. A citation of anything else doesn't count.
  known: ReadonlySet<string>;
  models: { answer: string; judge: string };
  // How many questions are in flight at once. The default keeps well inside the provider's rate limits.
  concurrency?: number;
  now?: () => Date;
};

export type RunOutput = { results: CaseResult[]; report: Report };

// An `error` event is retried once, so an upstream blip can't fail the pass bar. Both attempts stay in the log.
const MAX_ATTEMPTS = 2;

async function answerWithRetry(
  question: string,
  answer: Answerer,
): Promise<{ answer: Answer; attempts: number; errors: string[] }> {
  const errors: string[] = [];
  let latest = await answer(question);
  let attempts = 1;
  while (latest.error !== undefined && attempts < MAX_ATTEMPTS) {
    errors.push(describeError(latest));
    latest = await answer(question);
    attempts += 1;
  }
  if (latest.error !== undefined) errors.push(describeError(latest));
  return { answer: latest, attempts, errors };
}

function describeError(answer: Answer): string {
  const code = answer.error?.code ?? "unknown";
  return answer.detail === undefined ? code : `${code}: ${answer.detail}`;
}

async function runCase(testCase: EvalCase, deps: RunDeps): Promise<CaseResult> {
  const { answer, attempts, errors } = await answerWithRetry(testCase.q, deps.answer);
  const base = {
    id: testCase.id,
    type: testCase.type,
    q: testCase.q,
    answer: answer.text,
    cited: answer.cited,
    links: answer.links.map((link) => link.href),
    attempts,
    errors,
  };

  if (answer.error !== undefined) {
    return {
      ...base,
      pass: false,
      method: "error",
      reason: `the chat ended in an error: ${errors.at(-1) ?? answer.error.code}`,
    };
  }

  const forbidden = forbiddenPhrase(testCase, answer.text);
  if (forbidden !== undefined) {
    return { ...base, pass: false, method: "string", reason: `answer contains "${forbidden}"` };
  }

  if (testCase.type === "fact") {
    return { ...base, method: "string", ...gradeFact(testCase, answer, deps.known) };
  }

  try {
    const grade = await deps.judge({ testCase, answer: answer.text });
    return { ...base, method: "judge", ...grade };
  } catch (error) {
    // A judge that can't be reached fails the case loudly. It must never read as a pass.
    const reason = error instanceof Error ? error.message : "unknown error";
    return { ...base, pass: false, method: "error", reason: `the judge failed: ${reason}` };
  }
}

// Runs every case, at most `concurrency` at a time, and returns the results in the cases' order.
export async function runEval(cases: readonly EvalCase[], deps: RunDeps): Promise<RunOutput> {
  const limit = Math.max(1, deps.concurrency ?? 4);
  const results: CaseResult[] = [];
  const slots: (CaseResult | undefined)[] = cases.map(() => undefined);
  let next = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = next;
      next += 1;
      const testCase = cases[index];
      if (testCase === undefined) return;
      slots[index] = await runCase(testCase, deps);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, cases.length) }, () => worker()));
  for (const slot of slots) {
    if (slot !== undefined) results.push(slot);
  }

  const generatedAt = (deps.now ?? (() => new Date()))().toISOString();
  const report = summarise(results, {
    answerModel: deps.models.answer,
    judgeModel: deps.models.judge,
    generatedAt,
  });
  return { results, report };
}

// One line of eval-log.jsonl per case, for spot-checks.
export function logLines(results: readonly CaseResult[]): string {
  return results.map((result) => JSON.stringify(result)).join("\n") + "\n";
}
