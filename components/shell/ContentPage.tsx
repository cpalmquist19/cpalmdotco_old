import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/shell/Breadcrumb";
import { CrossLinks } from "@/components/shell/CrossLinks";
import { PageIntro } from "@/components/shell/PageIntro";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { getCommands, getProfile } from "@/lib/content";

type Props = {
  // What comes after "Home".
  breadcrumb: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  // The command name, used to pick the cross-links.
  current: string;
  children: ReactNode;
};

// The top bar comes from AppShell. This is the page body and the footer under it.
export function ContentPage({ breadcrumb, eyebrow, title, intro, current, children }: Props) {
  const profile = getProfile();
  const commands = getCommands();
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 lg:px-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, ...breadcrumb]} />
        <PageIntro eyebrow={eyebrow} title={title} intro={intro} />
        <div className="mt-10">{children}</div>
        <CrossLinks askAbout={profile.sidebar.askAbout} commands={commands} current={current} />
      </main>
      <SiteFooter profile={profile} commands={commands} />
    </>
  );
}
