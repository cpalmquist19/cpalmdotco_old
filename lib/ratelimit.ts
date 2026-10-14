// A per-client request limit, counted in memory by each server instance (D-045). The counts reset on a cold
// start and aren't shared between instances, so the real limit is looser than the numbers. The provider's
// monthly spend cap is the hard ceiling. Only `check` is used by the handler, so the storage can change here.

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
// Past this many keys, the key that was seen first is forgotten, so the map can't grow without bound.
const MAX_KEYS = 10_000;

export type RateCheck = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = { check: (key: string) => RateCheck };

type Options = {
  perMinute: number;
  perDay: number;
  now?: () => number;
  maxKeys?: number;
};

export function createRateLimiter({
  perMinute,
  perDay,
  now = () => Date.now(),
  maxKeys = MAX_KEYS,
}: Options): RateLimiter {
  // Each key's allowed request times, oldest first. Only the last day is kept.
  const hits = new Map<string, number[]>();

  // Forgets keys whose newest request is a day old, then the oldest keys past the bound.
  function prune(time: number) {
    for (const [key, times] of hits) {
      const newest = times.at(-1);
      if (newest === undefined || time - newest >= DAY_MS) hits.delete(key);
    }
    for (const oldest of hits.keys()) {
      if (hits.size <= maxKeys) break;
      hits.delete(oldest);
    }
  }

  return {
    check(key) {
      const time = now();
      prune(time);
      const inDay = (hits.get(key) ?? []).filter((at) => time - at < DAY_MS);
      const inMinute = inDay.filter((at) => time - at < MINUTE_MS);

      // A window is full when it holds its limit. The wait is until enough of its oldest requests leave it.
      const waits: number[] = [];
      if (inMinute.length >= perMinute) {
        const oldest = inMinute[inMinute.length - perMinute];
        if (oldest !== undefined) waits.push(oldest + MINUTE_MS - time);
      }
      if (inDay.length >= perDay) {
        const oldest = inDay[inDay.length - perDay];
        if (oldest !== undefined) waits.push(oldest + DAY_MS - time);
      }

      // A refused request is not counted, or a client that keeps asking would stay blocked for ever.
      if (waits.length > 0) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(Math.max(...waits) / 1000)),
        };
      }
      hits.set(key, [...inDay, time]);
      return { allowed: true };
    },
  };
}

// The key a request is counted under: the real client address, else the first forwarded one, else a shared
// key for every request that has neither (so they share one limit, which is the safe default).
export function clientKey(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return "unknown";
}
