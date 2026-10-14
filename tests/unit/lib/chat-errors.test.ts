import { describe, expect, it } from "vitest";
import { CHAT_ERROR_CODES } from "@/lib/chat-client";
import { errorLine, fallbackLinkText } from "@/lib/chat-errors";

describe("US-032", () => {
  it("US-032: each code has a line, and no line names a vendor, a status code or a stack", () => {
    for (const code of CHAT_ERROR_CODES) {
      const line = errorLine(code);

      expect(line.length, code).toBeGreaterThan(0);
      expect(line, code).not.toMatch(/claude|anthropic|openai|api|stack|error|\b[1-5]\d\d\b/i);
    }
  });

  it("US-032: the link after a line is named after its page, or shows the path when none matches", () => {
    expect(fallbackLinkText("About", "/about/")).toBe("Go to the About page");
    expect(fallbackLinkText(undefined, "/about/")).toBe("Go to /about/");
  });
});
