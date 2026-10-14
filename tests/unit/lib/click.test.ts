import { describe, expect, it } from "vitest";
import { isPlainClick } from "@/lib/click";

const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

describe("US-024", () => {
  it("US-024 F0.2: a primary click with no modifier is a plain click", () => {
    expect(isPlainClick(plain)).toBe(true);
  });

  it("US-024 F0.2: a middle or right click is not", () => {
    expect(isPlainClick({ ...plain, button: 1 })).toBe(false);
    expect(isPlainClick({ ...plain, button: 2 })).toBe(false);
  });

  it("US-024 F0.2: each of Ctrl, Cmd, Shift and Alt makes it not plain", () => {
    expect(isPlainClick({ ...plain, ctrlKey: true })).toBe(false);
    expect(isPlainClick({ ...plain, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...plain, shiftKey: true })).toBe(false);
    expect(isPlainClick({ ...plain, altKey: true })).toBe(false);
  });
});
