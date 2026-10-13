import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { ShareButton } from "@/components/shell/ShareButton";
import { StatusPill } from "@/components/shell/StatusPill";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { Command, Profile } from "@/lib/content";

type Props = { profile: Profile; askAbout: Command[] };

// The menu button is first, so below 1024 px it sits at the left, before the status pill.
// On desktop it's hidden by MobileDrawer's own lg:hidden wrapper.
export function TopBar({ profile, askAbout }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
      <div className="flex items-center gap-3">
        <MobileDrawer profile={profile} askAbout={askAbout} />
        <StatusPill status={profile.status} />
      </div>
      <div className="flex items-center gap-2">
        <ShareButton />
        <ThemeToggle />
        <a
          href={profile.links.cv}
          download
          className="flex h-10 items-center rounded-pill bg-cta-bg px-4 text-sm font-medium text-cta-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          CV
        </a>
      </div>
    </header>
  );
}
