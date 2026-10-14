import { describe, expect, it } from "vitest";
import { sseEvent } from "@/lib/sse";

describe("US-029", () => {
  it('US-029: an event is written as "event:" and "data:" lines ended by a blank line', () => {
    expect(sseEvent("token", { t: "Hi" })).toBe('event: token\ndata: {"t":"Hi"}\n\n');
    expect(sseEvent("done", {})).toBe("event: done\ndata: {}\n\n");
  });

  it("US-029: the data is JSON on one line", () => {
    const frame = sseEvent("token", { t: "line one\nline two" });

    // The newline inside the text is escaped, so the frame is the two lines and the blank line.
    expect(frame.split("\n")).toHaveLength(4);
    expect(frame).toContain('"t":"line one\\nline two"');
  });
});
