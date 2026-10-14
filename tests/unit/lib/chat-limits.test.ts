import { describe, expect, it } from "vitest";
import { MAX_INPUT_CHARS, counterShown, remainingChars } from "@/lib/chat-limits";

describe("US-081", () => {
  it("US-081: remainingChars is 500 minus the length, and never below 0", () => {
    expect(remainingChars(0)).toBe(MAX_INPUT_CHARS);
    expect(remainingChars(37)).toBe(463);
    expect(remainingChars(MAX_INPUT_CHARS)).toBe(0);
    expect(remainingChars(MAX_INPUT_CHARS + 1)).toBe(0);
  });

  it("US-081: the counter shows after 400 characters, and not at 400", () => {
    expect(counterShown(0)).toBe(false);
    expect(counterShown(400)).toBe(false);
    expect(counterShown(401)).toBe(true);
    expect(counterShown(MAX_INPUT_CHARS)).toBe(true);
  });
});
