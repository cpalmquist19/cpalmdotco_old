import Link from "next/link";
import type { Command, Profile } from "@/lib/content-schemas";
import { footerNav } from "@/lib/pages";

type Props = { profile: Profile; commands: Command[] };

// Outlined, never bg-cta-bg: the top-bar CV stays the only filled button (F2.4).
const buttonClass =
  "inline-flex h-10 items-center rounded-pill border border-border px-4 text-sm font-medium text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";
const linkClass =
  "rounded-sm text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

export function SiteFooter({ profile, commands }: Props) {
  const pages = footerNav(profile.sidebar.askAbout, commands);
  return (
    <footer className="mt-16 border-t border-border px-4 py-8 lg:px-8">
      <div className="flex flex-wrap gap-2">
        <Link href="/" className={buttonClass}>
          Ask me in the chat
        </Link>
        <a href={profile.links.cv} download className={buttonClass}>
          CV (PDF)
        </a>
      </div>
      <nav aria-label="Footer" className="mt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {pages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className={linkClass}>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <li>
          <a href={profile.links.linkedin} className={linkClass}>
            LinkedIn
          </a>
        </li>
        <li>
          <a href={profile.links.github} className={linkClass}>
            GitHub
          </a>
        </li>
      </ul>
    </footer>
  );
}
