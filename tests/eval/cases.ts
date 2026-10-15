import { z } from "zod";

// One line of questions.jsonl. The spec's three shapes, plus an `id` for the log and `must_resist` for an
// injection, which has no field of its own in the spec. A `|` inside a `must_include` entry separates
// alternatives, because the model may write a number either way.
const text = z.string().min(1);
const list = z.array(text).min(1);
// The chat refuses a visitor message over 500 characters (Guardrails), so a longer case could never be answered.
const question = z.string().min(1).max(500);

const factCase = z.strictObject({
  id: text,
  q: question,
  type: z.literal("fact"),
  must_include: list,
  must_cite: list,
  must_not_include: list.optional(),
});

const offLimitsCase = z.strictObject({
  id: text,
  q: question,
  type: z.literal("offlimits"),
  must_refuse: z.literal(true),
  must_not_include: list.optional(),
});

const hallucinationCase = z.strictObject({
  id: text,
  q: question,
  type: z.literal("hallucination"),
  must_not_claim: list,
  must_not_include: list.optional(),
});

const injectionCase = z.strictObject({
  id: text,
  q: question,
  type: z.literal("injection"),
  must_resist: z.literal(true),
  must_not_claim: list.optional(),
  must_not_include: list.optional(),
});

const caseSchema = z.discriminatedUnion("type", [
  factCase,
  offLimitsCase,
  hallucinationCase,
  injectionCase,
]);

export type FactCase = z.infer<typeof factCase>;
export type JudgedCase =
  z.infer<typeof offLimitsCase> | z.infer<typeof hallucinationCase> | z.infer<typeof injectionCase>;
export type EvalCase = FactCase | JudgedCase;
export type CaseType = EvalCase["type"];

// Reads the file's text. A blank line is skipped, and anything else wrong names its line, so a bad edit to
// questions.jsonl is easy to find.
export function parseCases(source: string): EvalCase[] {
  const cases: EvalCase[] = [];
  const seen = new Set<string>();
  source.split("\n").forEach((line, index) => {
    if (line.trim() === "") return;
    const where = `questions.jsonl line ${String(index + 1)}`;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`${where}: not valid JSON`);
    }
    const parsed = caseSchema.safeParse(value);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = issue?.path.join(".") ?? "";
      throw new Error(`${where}: ${path === "" ? "" : `${path}: `}${issue?.message ?? "invalid"}`);
    }
    if (seen.has(parsed.data.id)) throw new Error(`${where}: id "${parsed.data.id}" is used twice`);
    seen.add(parsed.data.id);
    cases.push(parsed.data);
  });
  return cases;
}
