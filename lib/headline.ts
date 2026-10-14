// The rotating headline's timing and order (F1.3). Pure functions: the component calls them and passes
// in the random source, so the tests can check every step. Timings are in milliseconds.

export const FADE_MS = 400;

// Three lines are always on screen (F1.5): two older facts, then the newest one being typed or held.
export type Phase = "type" | "hold" | "fade";

export type Cycle = {
  older: [string, string];
  target: string;
  typed: number;
  next: number;
  phase: Phase;
};

const FACTS_ON_SCREEN = 3;

function factAt(pool: readonly string[], index: number): string {
  const fact = pool[index % pool.length];
  if (fact === undefined) throw new Error("headlinePool is empty");
  return fact;
}

// The first three facts, shown in full, with the newest last. Starts in "hold", so nothing types on load.
export function startCycle(pool: readonly string[]): Cycle {
  if (pool.length < FACTS_ON_SCREEN) {
    throw new Error(`headlinePool needs at least ${FACTS_ON_SCREEN} facts`);
  }
  const target = factAt(pool, 2);
  return {
    older: [factAt(pool, 0), factAt(pool, 1)],
    target,
    typed: target.length,
    next: FACTS_ON_SCREEN,
    phase: "hold",
  };
}

// One step: a character typed, the hold ended, or the fade finished and the next fact arrives.
export function advance(cycle: Cycle, pool: readonly string[]): Cycle {
  switch (cycle.phase) {
    case "type": {
      const typed = Math.min(cycle.typed + 1, cycle.target.length);
      return { ...cycle, typed, phase: typed === cycle.target.length ? "hold" : "type" };
    }
    case "hold":
      return { ...cycle, phase: "fade" };
    case "fade":
      // The oldest fact leaves, the faded one becomes the older line, and the next one starts typing.
      return {
        older: [cycle.older[1], cycle.target],
        target: factAt(pool, cycle.next),
        typed: 0,
        next: cycle.next + 1,
        phase: "type",
      };
  }
}

// How long the current phase lasts. `random` returns a number in [0, 1).
export function delayMs(cycle: Cycle, random: () => number): number {
  switch (cycle.phase) {
    case "type":
      return 30 + random() * 15;
    case "hold":
      return 2500 + random() * 500;
    case "fade":
      return FADE_MS;
  }
}
