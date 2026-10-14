import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "@/lib/ratelimit";

const MINUTE = 60_000;

// A limiter whose clock the test moves, so every window is exact and nothing waits in real time.
function limiterAt(options: { perMinute?: number; perDay?: number; maxKeys?: number } = {}) {
  let time = 0;
  const limiter = createRateLimiter({
    perMinute: options.perMinute ?? 10,
    perDay: options.perDay ?? 60,
    maxKeys: options.maxKeys,
    now: () => time,
  });
  return {
    limiter,
    at: (ms: number) => {
      time = ms;
    },
  };
}

describe("US-031", () => {
  it("US-031: the eleventh request in a minute is refused and the tenth is allowed", () => {
    const { limiter, at } = limiterAt();
    const results = Array.from({ length: 11 }, (_, index) => {
      at(index * 1000);
      return limiter.check("a").allowed;
    });

    expect(results[9]).toBe(true);
    expect(results[10]).toBe(false);
  });

  it("US-031: the minute window slides: a request is allowed again 60 s after the oldest", () => {
    const { limiter, at } = limiterAt();
    for (let index = 0; index < 10; index += 1) {
      at(0);
      limiter.check("a");
    }

    at(MINUTE - 1);
    expect(limiter.check("a").allowed).toBe(false);
    at(MINUTE);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("US-031: the sixty-first request in a day is refused, however slowly they came", () => {
    const { limiter, at } = limiterAt();
    // One request a minute never fills the minute window, so only the day limit can refuse.
    for (let minute = 0; minute < 60; minute += 1) {
      at(minute * MINUTE);
      expect(limiter.check("a").allowed).toBe(true);
    }

    at(60 * MINUTE);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("US-031: a refused request doesn't extend the window", () => {
    const { limiter, at } = limiterAt({ perMinute: 1 });
    at(0);
    expect(limiter.check("a").allowed).toBe(true);

    at(30_000);
    expect(limiter.check("a").allowed).toBe(false);
    // Had the refused request counted, this would still be inside the window.
    at(MINUTE);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("US-031: retryAfterSeconds is the wait until the oldest counted request leaves the window", () => {
    const { limiter, at } = limiterAt({ perMinute: 2 });
    at(0);
    limiter.check("a");
    at(20_000);
    limiter.check("a");

    at(25_000);
    expect(limiter.check("a")).toEqual({ allowed: false, retryAfterSeconds: 35 });
  });

  it("US-031: two keys are counted separately", () => {
    const { limiter, at } = limiterAt({ perMinute: 1 });
    at(0);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("US-031: clientKey takes x-real-ip, then the first x-forwarded-for entry, then one shared key", () => {
    expect(
      clientKey(new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.2" })),
    ).toBe("203.0.113.7");
    expect(clientKey(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe(
      "198.51.100.2",
    );
    expect(clientKey(new Headers())).toBe("unknown");
  });

  it("US-031: the map doesn't grow without bound", () => {
    const { limiter, at } = limiterAt({ perMinute: 1, maxKeys: 2 });
    at(0);
    limiter.check("a");
    limiter.check("b");
    // A third key past the bound makes the first key, "a", the one forgotten.
    limiter.check("c");

    expect(limiter.check("a").allowed).toBe(true);
  });
});
