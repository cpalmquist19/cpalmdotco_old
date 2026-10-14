"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Caret } from "@/components/ui/Caret";
import { advance, delayMs, startCycle, type Cycle } from "@/lib/headline";

type Props = { greeting: string; pool: string[]; paused: boolean };

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function reducedMotionNow(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function tabHiddenNow(): boolean {
  return document.visibilityState === "hidden";
}

// The server has no window, so it renders as if motion is allowed and the tab is visible.
function notOnServer(): boolean {
  return false;
}

// The h1's text for assistive tech is the greeting and every fact. The animated copy below is hidden from it.
// Its three fact lines are reserved, so the input under it never moves (F1.5).
export function RotatingHeadline({ greeting, pool, paused }: Props) {
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotionNow, notOnServer);
  const hidden = useSyncExternalStore(subscribeVisibility, tabHiddenNow, notOnServer);
  const [cycle, setCycle] = useState<Cycle>(() => startCycle(pool));
  const stopped = reduced || paused || hidden;

  // Each phase has its own timer, so a pause keeps the state and the next phase starts when play resumes.
  useEffect(() => {
    if (stopped) return;
    const timer = setTimeout(
      () => setCycle((current) => advance(current, pool)),
      delayMs(cycle, Math.random),
    );
    return () => clearTimeout(timer);
  }, [cycle, pool, stopped]);

  const newestTone = cycle.phase === "fade" ? "text-text-faint" : "text-text";

  // The fact lines have no role or name, so the tests find them by test id (CODING § 9).
  return (
    <h1>
      <span className="sr-only">{`${greeting} ${pool.join(". ")}`}</span>
      <span aria-hidden="true" className="block">
        <span className="block text-lg text-text-muted">{greeting}</span>
        <span className="mt-2 block h-[132px] overflow-hidden text-[40px] leading-[1.1] font-bold tracking-[-0.03em] sm:h-[211px] sm:text-[64px]">
          <span data-testid="headline-fact" className="block truncate text-text-faint">
            {cycle.older[0]}
          </span>
          <span data-testid="headline-fact" className="block truncate text-text-faint">
            {cycle.older[1]}
          </span>
          <span
            data-testid="headline-fact"
            className={`block truncate transition-colors duration-[400ms] motion-reduce:transition-none ${newestTone}`}
          >
            {cycle.target.slice(0, cycle.typed)}
            {!reduced && <Caret />}
          </span>
        </span>
      </span>
    </h1>
  );
}
