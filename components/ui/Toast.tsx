type Props = { message: string | null };

// The status region stays in the DOM so screen readers announce a message that is added to it.
// When there's no message it has no size, so it takes no room and isn't visible.
export function Toast({ message }: Props) {
  return (
    <div role="status" className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
      {message && (
        <p className="rounded-pill border border-border bg-surface px-4 py-2 text-sm text-text shadow-sm">
          {message}
        </p>
      )}
    </div>
  );
}
