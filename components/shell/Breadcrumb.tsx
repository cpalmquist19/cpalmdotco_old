import Link from "next/link";

type Item = { label: string; href?: string };

type Props = { items: Item[] };

// The last item is the current page: plain text with aria-current, never a link.
export function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-text-faint">
                  /
                </span>
              )}
              {item.href !== undefined && !isCurrent ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="text-text">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
