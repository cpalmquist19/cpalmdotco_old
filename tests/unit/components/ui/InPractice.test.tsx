import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InPractice } from "@/components/ui/InPractice";

describe("US-017", () => {
  it("US-017: InPractice renders nothing without pairs", () => {
    expect(renderToStaticMarkup(<InPractice />)).toBe("");
    expect(renderToStaticMarkup(<InPractice pairs={[]} />)).toBe("");
  });

  it("US-017: InPractice renders one item per pair", () => {
    const output = renderToStaticMarkup(
      <InPractice
        pairs={[
          { tool: "Playwright", project: "Release Gate" },
          { tool: "pytest", project: "Project Atlas" },
        ]}
      />,
    );

    expect(output).toContain("<h2");
    expect(output).toContain("In practice");
    expect(output.match(/<li/g)).toHaveLength(2);
    expect(output).toContain("<strong");
    expect(output).toContain("Playwright");
    expect(output).toContain("Release Gate");
    expect(output).toContain("pytest");
    expect(output).toContain("Project Atlas");
  });
});
