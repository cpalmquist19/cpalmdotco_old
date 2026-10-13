type Props = { name: string };

// The name sits next to the avatar, so the monogram is hidden from screen readers.
// Its test id exists because an aria-hidden element has no role or name to query.
export function Avatar({ name }: Props) {
  const initials = name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      data-testid="avatar"
      className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-cta-bg text-sm font-medium text-cta-text"
    >
      {initials}
    </span>
  );
}
