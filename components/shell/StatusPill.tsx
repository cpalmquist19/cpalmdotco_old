type Props = { status: string };

// The pulse is a Tailwind motion-safe: class, so it stops under reduced motion without JS.
// The dot has no role or name, so its test id is the only way to query it.
export function StatusPill({ status }: Props) {
  return (
    <p className="flex h-10 items-center gap-2 rounded-pill border border-border px-4 text-sm text-text">
      <span
        aria-hidden="true"
        data-testid="status-dot"
        className="size-2 shrink-0 rounded-full bg-ok motion-safe:animate-pulse"
      />
      {status}
    </p>
  );
}
