import type { ReactNode } from "react";
import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { Sidebar } from "@/components/shell/Sidebar";
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
      <Sidebar profile={profile} askAbout={askAbout} variant="inline" />
      <div className="min-w-0 flex-1">
        <MobileDrawer profile={profile} askAbout={askAbout} />
        {children}
      </div>
    </div>
  );
}
