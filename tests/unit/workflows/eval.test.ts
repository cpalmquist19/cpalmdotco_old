import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const source = readFileSync(`${root}.github/workflows/eval.yml`, "utf8");

const workflowSchema = z.object({
  on: z.object({
    push: z.object({ branches: z.array(z.string()), paths: z.array(z.string()) }),
    schedule: z.array(z.object({ cron: z.string() })),
    workflow_dispatch: z.unknown(),
  }),
  permissions: z.record(z.string(), z.string()),
  jobs: z.object({
    eval: z.object({
      steps: z.array(
        z.object({
          name: z.string().optional(),
          uses: z.string().optional(),
          run: z.string().optional(),
          if: z.string().optional(),
          env: z.record(z.string(), z.string()).optional(),
          with: z.record(z.string(), z.string()).optional(),
        }),
      ),
    }),
  }),
});

const workflow = workflowSchema.parse(parse(source));
const steps = workflow.jobs.eval.steps;
const runStep = steps.find((step) => step.name === "Run the eval");
const upload = steps.find((step) => step.uses?.startsWith("actions/upload-artifact"));

describe("US-034: the eval workflow", () => {
  it("US-034: runs on pushes to main that touch content, the prompt or the model setting", () => {
    const { push } = workflow.on;
    expect(push.branches).toEqual(["main"]);
    expect(push.paths).toContain("content/**");
    expect(push.paths).toContain("lib/chat-prompt.ts");
    expect(push.paths).toContain("lib/chat-provider.ts");
  });

  it("US-034: runs nightly and by hand", () => {
    expect(workflow.on.schedule).toHaveLength(1);
    expect(workflow.on.schedule[0]?.cron).toMatch(/^\d+ \d+ \* \* \*$/);
    expect(workflow.on).toHaveProperty("workflow_dispatch");
  });

  it("US-034: reads the key only through env, and fails with a message when it is missing", () => {
    expect(runStep?.env).toEqual({ ANTHROPIC_API_KEY: "${{ secrets.ANTHROPIC_API_KEY }}" });
    expect(runStep?.run).toContain('[ -z "$ANTHROPIC_API_KEY" ]');
    expect(runStep?.run).toContain("::error::");
    expect(runStep?.run).toContain("exit 1");
    expect(runStep?.run).toContain("npm run eval");
    // The secret is not named anywhere else, so it can't be echoed or passed on a command line.
    expect(source.match(/secrets\.ANTHROPIC_API_KEY/g)).toHaveLength(1);
    expect(runStep?.run).not.toMatch(/echo[^\n]*\$ANTHROPIC_API_KEY|set -x/);
  });

  it("US-034: has read-only permissions, and uploads the report and the log even when the run fails", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(upload?.if).toBe("always()");
    expect(upload?.with?.path).toContain("eval-report.json");
    expect(upload?.with?.path).toContain("eval-log.jsonl");
  });
});
