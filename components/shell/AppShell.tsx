import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { SkipLink } from "@/components/shell/SkipLink";
import { TopBar } from "@/components/shell/TopBar";
import { getCommands, getProfile } from "@/lib/content";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  const profile = getProfile();
  const commands = getCommands();

  // profile.sidebar.askAbout sets the order of the ASK ABOUT list (D-009).
  const askAbout = profile.sidebar.askAbout.map((name) => {
    const command = commands.find((item) => item.command === name);
    if (!command) {
      throw new Error(
        `profile.json lists "${name}" in askAbout, but commands.json has no such command`,
      );
    }
    return command;
  });

  return (
    <div className="flex min-h-dvh">
      {/* First in the document, so it's the first Tab stop (F1.7). */}
      <SkipLink />
      <Sidebar profile={profile} askAbout={askAbout} variant="inline" />
      <div className="min-w-0 flex-1">
        <TopBar profile={profile} askAbout={askAbout} />
        {children}
      </div>
    </div>
  );
}
