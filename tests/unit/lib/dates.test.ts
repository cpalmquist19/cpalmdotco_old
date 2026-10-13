import { describe, expect, it } from "vitest";
import { formatMonth, formatRange } from "@/lib/dates";

describe("US-013", () => {
  it('US-013: formatMonth gives "Mar 2021"', () => {
    expect(formatMonth("2021-03")).toBe("Mar 2021");
  });

  it('US-013: formatRange gives "Mar 2021 – Present" for "present"', () => {
    expect(formatRange("2021-03", "present")).toBe("Mar 2021 – Present");
  });

  it('US-013: formatRange gives "Mar 2021 – Jun 2023"', () => {
    expect(formatRange("2021-03", "2023-06")).toBe("Mar 2021 – Jun 2023");
  });

  it("US-013: formatMonth rejects anything but YYYY-MM", () => {
    expect(() => formatMonth("2021")).toThrow();
    expect(() => formatMonth("March 2021")).toThrow();
  });
});
