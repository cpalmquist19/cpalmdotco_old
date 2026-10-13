import type { Command } from "@/lib/content-schemas";

// Pure functions: the pages pass in the data they read with getProfile() and getCommands().

export type PageIntro = { eyebrow: string; title: string; intro: string };
export type PageLink = { label: string; href: string };

// For an ASK ABOUT page (D-018): the eyebrow is the command's label, the H1 its description.
export function getPageIntro(commands: Command[], name: string): PageIntro {
  const command = commands.find((item) => item.command === name);
  if (!command) throw new Error(`commands.json has no command ${name}`);
  // The build fails here, not on the page, so a missing intro can't ship unnoticed.
  if (command.intro === undefined) throw new Error(`commands.json: ${name} has no intro (D-018)`);
  return { eyebrow: command.label, title: command.description, intro: command.intro };
}

// profile.sidebar.askAbout sets the order, so the command list follows it.
function askAboutPages(askAbout: string[], commands: Command[]): Command[] {
  return askAbout.map((name) => {
    const command = commands.find((item) => item.command === name);
    if (!command)
      throw new Error(
        `profile.json lists "${name}" in askAbout, but commands.json has no such command`,
      );
    return command;
  });
}

// The two ASK ABOUT pages after `current`, wrapping round. If `current` isn't in the list,
// indexOf gives -1, so the list starts at the first page.
export function crossLinks(askAbout: string[], commands: Command[], current: string): PageLink[] {
  const pages = askAboutPages(askAbout, commands);
  const start = askAbout.indexOf(current) + 1;
  const rotated = [...pages.slice(start), ...pages.slice(0, start)];
  return rotated.slice(0, 2).map(toLink);
}

export function footerNav(askAbout: string[], commands: Command[]): PageLink[] {
  return askAboutPages(askAbout, commands).map(toLink);
}

function toLink(command: Command): PageLink {
  return { label: command.label, href: command.answer };
}
