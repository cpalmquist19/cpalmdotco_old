import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));

// Every route under app/ with a page.tsx, except the home page, which is the chat (F4) and not a content page.
const contentPages = existsSync(join(root, "app"))
  ? readdirSync(join(root, "app"), { recursive: true, encoding: "utf8" })
      .filter((name) => name.endsWith("page.tsx") && name !== "page.tsx")
      .map((name) => join("app", name))
  : [];

describe("US-013", () => {
  it("US-013: finds the content pages", () => {
    expect(contentPages).toContain(join("app", "contact", "page.tsx"));
  });

  it('US-013 F5.5: every content page exports dynamic = "error"', () => {
    const offenders = contentPages.filter(
      (file) => !/^export const dynamic = "error";$/m.test(readFileSync(join(root, file), "utf8")),
    );

    expect(offenders).toEqual([]);
  });
});
