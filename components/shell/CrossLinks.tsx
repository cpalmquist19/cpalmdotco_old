import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Command } from "@/lib/content-schemas";
import { crossLinks } from "@/lib/pages";

type Props = { askAbout: string[]; commands: Command[]; current: string };

export function CrossLinks({ askAbout, commands, current }: Props) {
  const links = crossLinks(askAbout, commands, current);
  return (
    <nav aria-label="Related pages" className="mt-12 border-t border-border pt-8">
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between rounded-box border border-border bg-surface p-4 text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            >
              <span className="font-medium">{link.label}</span>
              <ArrowRight aria-hidden="true" className="size-4 text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
