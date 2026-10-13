import { describe, expect, it } from "vitest";
import packageJson from "@/package.json";

describe("US-002", () => {
  it("US-002: unit test runner works", () => {
    // Importing through the "@/" alias tests the alias as well as the runner.
    expect(packageJson.name).toBe("cpalmdotco");
    expect(packageJson.engines.node).toBe("24.x");
  });
});
