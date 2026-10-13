import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/ui/Markdown";

function html(source: string): string {
  return renderToStaticMarkup(<Markdown>{source}</Markdown>);
}

describe("US-014", () => {
  it("US-014: renders paragraphs, h2, lists, links, bold and inline code", () => {
    const output = html(
      [
        "A **bold** claim with `code` and a [link](https://example.com/x).",
        "",
        "## Section",
        "",
        "- one",
        "- two",
        "",
        "1. first",
      ].join("\n"),
    );

    expect(output).toContain("<p");
    expect(output).toContain("<strong");
    expect(output).toContain("<code");
    expect(output).toContain('<a href="https://example.com/x" rel="noopener noreferrer"');
    expect(output).toContain("<h2");
    expect(output).toContain("<ul");
    expect(output).toContain("<li");
    expect(output).toContain("<ol");
  });

  it("US-014: drops raw HTML", () => {
    const output = html('Hello <script>alert(1)</script> <img src=x onerror="alert(2)">');

    expect(output).not.toContain("<script");
    expect(output).not.toContain("<img");
    expect(output).not.toContain("onerror");
    expect(output).toContain("Hello");
  });

  it("US-014: a # heading renders as text, not a second h1", () => {
    const output = html("# Title\n\nBody text.");

    expect(output).not.toContain("<h1");
    expect(output).toContain("Title");
    expect(output).toContain("Body text.");
  });

  it("US-014: a javascript: link has no usable href", () => {
    const output = html("[x](javascript:alert(1))");

    expect(output).not.toContain("javascript:");
    expect(output).not.toContain("<a");
    expect(output).toContain("x");
  });
});
