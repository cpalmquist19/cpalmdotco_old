type Props = { message: string | null };

// The status region stays in the DOM so screen readers announce a message that is added to it.
// It hangs below its parent, which must be `relative`, so the message sits by the button
// that caused it. With no message it has no size, so it takes no room and isn't visible.
export function Toast({ message }: Props) {
  return (
    <div role="status" className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
      {message && (
        <p className="whitespace-nowrap rounded-pill border border-border bg-surface px-4 py-2 text-sm text-text shadow-sm">
          {message}
        </p>
      )}
    </div>
  );
}
