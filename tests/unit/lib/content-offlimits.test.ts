import { writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getOffLimits } from "@/lib/content";
import { copyFixture, removeFolder } from "@/tests/unit/helpers/content-fixture";

describe("US-029", () => {
  let dir: string;

  beforeEach(() => {
    dir = copyFixture();
  });

  afterEach(() => {
    removeFolder(dir);
  });

  it("US-029: getOffLimits returns the body without the frontmatter", () => {
    writeFileSync(
      path.join(dir, "offlimits.md"),
      "---\nplaceholder: true\n---\n\n- Salary\n- Home address\n",
    );

    expect(getOffLimits(dir)).toBe("- Salary\n- Home address");
  });

  it("US-029: getOffLimits fails when offlimits.md is missing or empty", () => {
    expect(() => getOffLimits(dir)).toThrow("content/offlimits.md: (file): is missing");

    writeFileSync(path.join(dir, "offlimits.md"), "---\nplaceholder: true\n---\n\n   \n");
    expect(() => getOffLimits(dir)).toThrow("content/offlimits.md: body: is empty");
  });
});
