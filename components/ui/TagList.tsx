type Props = { tags: string[]; label: string };

// Mono tags, outlined and never filled (F2.4). Used by RoleEntry here and ProjectCard in US-016.
export function TagList({ tags, label }: Props) {
  return (
    <ul aria-label={label} className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-pill border border-border px-2.5 py-1 font-mono text-sm text-text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
