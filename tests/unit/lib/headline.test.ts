import { describe, expect, it } from "vitest";
import { advance, delayMs, FADE_MS, startCycle, type Cycle } from "@/lib/headline";

const pool = ["Fact one", "Fact two", "Fact three", "Fact four", "Fact five"];
const low = () => 0;
const high = () => 0.999999;

// The cycle after each of `count` steps.
function steps(start: Cycle, count: number): Cycle[] {
  const out: Cycle[] = [];
  let cycle = start;
  for (let i = 0; i < count; i += 1) {
    cycle = advance(cycle, pool);
    out.push(cycle);
  }
  return out;
}

// Steps until `target` is the fact being shown, or fails after 100 steps.
function advanceUntil(start: Cycle, target: string): Cycle {
  let cycle = start;
  for (let i = 0; i < 100 && cycle.target !== target; i += 1) {
    cycle = advance(cycle, pool);
  }
  expect(cycle.target).toBe(target);
  return cycle;
}

describe("US-020 F1.3: the headline's timing and order", () => {
  it("US-020 F1.3: typing takes 30–45 ms per character", () => {
    const cycle = startCycle(pool);
    expect(delayMs({ ...cycle, phase: "type" }, low)).toBe(30);
    expect(delayMs({ ...cycle, phase: "type" }, high)).toBeGreaterThanOrEqual(44.99);
    expect(delayMs({ ...cycle, phase: "type" }, high)).toBeLessThan(45);
  });

  it("US-020 F1.3: a fact holds for 2.5–3 s, then fades for 400 ms", () => {
    const cycle = startCycle(pool);
    expect(delayMs({ ...cycle, phase: "hold" }, low)).toBe(2500);
    expect(delayMs({ ...cycle, phase: "hold" }, high)).toBeLessThan(3000);
    expect(delayMs({ ...cycle, phase: "fade" }, low)).toBe(FADE_MS);
    expect(FADE_MS).toBe(400);
  });

  it("US-020 F1.3: each new fact replaces the oldest, and the pool wraps round", () => {
    const start = startCycle(pool);
    expect(start.older).toEqual(["Fact one", "Fact two"]);
    expect(start.target).toBe("Fact three");

    // Fact four types in after the hold and fade; "Fact two" leaves the top.
    const four = advanceUntil(start, "Fact four");
    expect(four.older).toEqual(["Fact two", "Fact three"]);
    expect(four.typed).toBe(0);
    expect(four.phase).toBe("type");

    const five = advanceUntil(four, "Fact five");
    expect(five.older).toEqual(["Fact three", "Fact four"]);

    // The pool has run out, so the next fact is the first one again.
    const wrapped = advanceUntil(five, "Fact one");
    expect(wrapped.older).toEqual(["Fact four", "Fact five"]);
  });

  it("US-020 F1.3: typing adds one character per step, then holds", () => {
    const typing: Cycle = { ...startCycle(pool), target: "abc", typed: 0, phase: "type" };
    const [first, second, third] = steps(typing, 3);
    expect(first?.typed).toBe(1);
    expect(second?.typed).toBe(2);
    expect(third?.typed).toBe(3);
    expect(third?.phase).toBe("hold");
  });

  it("US-020 F1.3: a cycle needs at least three facts", () => {
    expect(() => startCycle(["one", "two"])).toThrow("at least 3 facts");
  });
});
