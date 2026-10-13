import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const workflow = readFileSync(`${root}.github/workflows/notify.yml`, "utf8");
const thisTest = readFileSync(fileURLToPath(import.meta.url), "utf8");
const agents = readFileSync(`${root}AGENTS.md`, "utf8");

// `yaml` isn't installed until US-011, so the workflow is read as text.
function between(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  expect(from, `"${start}" is in the file`).toBeGreaterThanOrEqual(0);
  expect(to, `"${end}" follows it`).toBeGreaterThan(from);
  return source.slice(from, to);
}

const condition = between(workflow, "if: >-", "steps:");
const script = workflow.slice(workflow.indexOf("run: |"));

describe("US-064: Telegram notifications", () => {
  it("US-064: notify.yml triggers on deployment_status, on workflow_run of CI, and on workflow_dispatch", () => {
    const triggers = between(workflow, "\non:\n", "\npermissions:");
    expect(triggers).toMatch(/^ {2}deployment_status:$/m);
    expect(triggers).toMatch(/^ {2}workflow_run:$/m);
    expect(triggers).toMatch(/^ {4}workflows: \[CI\]$/m);
    expect(triggers).toMatch(/^ {4}types: \[completed\]$/m);
    expect(triggers).toMatch(/^ {2}workflow_dispatch:$/m);
  });

  it("US-064: a deployment message is sent only for success, failure and error", () => {
    expect(condition).toContain("github.event_name == 'deployment_status'");
    expect(condition).toContain(
      `contains(fromJSON('["success","failure","error"]'), github.event.deployment_status.state)`,
    );
    for (const state of ["pending", "queued", "in_progress", "inactive"]) {
      expect(condition).not.toContain(state);
    }
    // Success names the environment URL; any other state names the log URL.
    expect(script).toContain('[ "$DEPLOY_STATE" = "success" ]');
    expect(script).toContain("${DEPLOY_URL:-no URL reported}");
    expect(script).toContain("${DEPLOY_LOG_URL:-no log URL reported}");
  });

  it("US-064: a CI message is sent only for a failed run on main", () => {
    expect(condition).toContain("github.event_name == 'workflow_run'");
    expect(condition).toContain("github.event.workflow_run.conclusion == 'failure'");
    expect(condition).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(script).toContain("${CI_SHA:0:7}");
    expect(script).toContain("${CI_MESSAGE%%$'\\n'*}");
    expect(script).toContain("${CI_URL}");
  });

  it("US-064: a manual run always sends a test message", () => {
    expect(condition).toContain("github.event_name == 'workflow_dispatch'");
    expect(script).toMatch(/workflow_dispatch\)\n\s+text="🧪 Test message from cpalmdotco"/);
  });

  it("US-064: a missing secret skips the step with a warning and exits 0", () => {
    const guard = between(script, "if [ -z", "fi\n");
    expect(guard).toContain('[ -z "$TELEGRAM_BOT_TOKEN" ]');
    expect(guard).toContain('[ -z "$TELEGRAM_CHAT_ID" ]');
    expect(guard).toContain("::warning::");
    expect(guard).toContain("exit 0");
    // The guard runs before anything is sent.
    expect(script.indexOf("if [ -z")).toBeLessThan(script.indexOf("curl "));
  });

  it("US-064: a failed curl logs a warning and does not fail the job", () => {
    const send = script.slice(script.indexOf("curl "));
    expect(send).toContain("--fail");
    expect(send).toContain('|| echo "::warning::Telegram notification failed"');
    // Comments are skipped: the script's own comment explains why -v and set -x are absent.
    const commands = script
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n");
    expect(commands).not.toMatch(/curl[^\n]* -v\b|--verbose|set -x/);
  });

  it("US-064: the token comes from secrets and no run script reads github.event inline", () => {
    expect(workflow).toContain("TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}");
    expect(workflow).toContain("TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}");
    expect(workflow.match(/secrets\./g)).toHaveLength(2);
    expect(script).not.toContain("${{");
    expect(workflow).toMatch(/^permissions: \{\}$/m);
  });

  it("US-064: no Telegram token is committed in the workflow or the test", () => {
    const tokenShaped = /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/;
    expect(workflow).not.toMatch(tokenShaped);
    expect(thisTest).not.toMatch(tokenShaped);
  });

  it("US-064: AGENTS.md says CI notification secrets live in GitHub Actions secrets", () => {
    const bullet = agents.split("\n").find((line) => line.startsWith("- **Secrets:**"));
    expect(bullet).toBeDefined();
    expect(bullet).toContain("GitHub Actions secrets");
    expect(bullet).toContain("D-024");
  });
});
