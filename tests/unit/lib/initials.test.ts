import { describe, expect, it } from "vitest";
import { getInitials } from "@/lib/initials";

describe("US-050", () => {
  it("US-050: initials are the first letters of the first and last name", () => {
    expect(getInitials("Caleb Palmquist")).toBe("CP");
    expect(getInitials("Mary Jane Watson")).toBe("MW");
  });

  it("US-050: a one-word name gives one initial", () => {
    expect(getInitials("Cher")).toBe("C");
  });
});
