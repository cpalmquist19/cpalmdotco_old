import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));
const ci = readFileSync(`${root}.github/workflows/ci.yml`, "utf8");

// GitHub Actions sets CI, so every test stubs it to give the same result there and locally.
async function loadConfig(ciValue: string) {
  vi.stubEnv("CI", ciValue);
  vi.resetModules();
  const { default: config } = await import("@/playwright.config");
  return config;
}

// `yaml` isn't installed until US-011, so the workflow is read as text.
function e2eJob(): string {
  const from = ci.indexOf("\n  e2e:\n");
  const to = ci.indexOf("\n  pm-board:\n", from);
  expect(from, "the e2e job is in ci.yml").toBeGreaterThanOrEqual(0);
  expect(to, "the pm-board job follows it").toBeGreaterThan(from);
  return ci.slice(from, to);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("US-058: reporters are chosen in the Playwright config", () => {
  it("US-058: CI uses the github and html reporters, and html never opens", async () => {
    const config = await loadConfig("true");
    expect(config.reporter).toEqual([["github"], ["html", { open: "never" }]]);
  });

  it("US-058: a local run uses the list reporter only", async () => {
    const config = await loadConfig("");
    expect(config.reporter).toBe("list");
  });

  it("US-058: the workflow runs test:e2e with no --reporter flag", () => {
    const job = e2eJob();
    expect(job).toMatch(/^ {6}- run: npm run test:e2e$/m);
    expect(job).not.toContain("--reporter");
  });

  it("US-058: the workflow uploads playwright-report and fails if it is missing", () => {
    const upload = e2eJob().slice(e2eJob().indexOf("actions/upload-artifact"));
    expect(upload).toMatch(/^ {8}if: failure\(\)$/m);
    expect(upload).toMatch(/^ {10}path: playwright-report\/$/m);
    expect(upload).toMatch(/^ {10}if-no-files-found: error$/m);
  });
});
