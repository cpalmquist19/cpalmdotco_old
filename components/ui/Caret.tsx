// The blinking caret after typed text. The headline uses it now, and the chat's streamed answers will too (US-032).
// It blinks only when motion is allowed, and it's decoration, so assistive tech skips it.
export function Caret() {
  return (
    <span
      aria-hidden="true"
      data-testid="caret"
      className="ml-1 inline-block h-[0.9em] w-0.5 bg-text align-middle motion-safe:animate-pulse"
    />
  );
}
