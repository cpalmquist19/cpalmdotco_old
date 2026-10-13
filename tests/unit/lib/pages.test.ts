import { describe, expect, it } from "vitest";
import type { Command } from "@/lib/content-schemas";
import { crossLinks, footerNav, getPageIntro } from "@/lib/pages";

function command(name: string, label: string, extra: Partial<Command> = {}): Command {
  return {
    command: name,
    label,
    description: `${label} description`,
    answer: `/${name.slice(1)}/`,
    chip: true,
    order: 1,
    icon: "user",
    intro: `${label} intro`,
    ...extra,
  };
}

const askAbout = ["/about", "/experience", "/projects", "/skills", "/contact"];
const commands = [
  command("/about", "About"),
  command("/experience", "Experience"),
  command("/projects", "Projects"),
  command("/skills", "Skills"),
  command("/contact", "Contact"),
];

describe("US-013", () => {
  it("US-013: getPageIntro reads eyebrow, title and intro from the command", () => {
    expect(getPageIntro(commands, "/contact")).toEqual({
      eyebrow: "Contact",
      title: "Contact description",
      intro: "Contact intro",
    });
  });

  it("US-013: getPageIntro throws for an unknown command or one without an intro", () => {
    expect(() => getPageIntro(commands, "/nope")).toThrow(/\/nope/);
    const withoutIntro = commands.map((item) =>
      item.command === "/contact" ? { ...item, intro: undefined } : item,
    );
    expect(() => getPageIntro(withoutIntro, "/contact")).toThrow(/\/contact.*intro/);
  });

  it("US-013: crossLinks are the next two ASK ABOUT pages, wrapping at the end", () => {
    expect(crossLinks(askAbout, commands, "/about")).toEqual([
      { label: "Experience", href: "/experience/" },
      { label: "Projects", href: "/projects/" },
    ]);
    expect(crossLinks(askAbout, commands, "/skills")).toEqual([
      { label: "Contact", href: "/contact/" },
      { label: "About", href: "/about/" },
    ]);
    // The last page wraps to the first two.
    expect(crossLinks(askAbout, commands, "/contact")).toEqual([
      { label: "About", href: "/about/" },
      { label: "Experience", href: "/experience/" },
    ]);
  });

  it("US-013: crossLinks for a page not in ASK ABOUT are the first two", () => {
    expect(crossLinks(askAbout, commands, "/cv")).toEqual([
      { label: "About", href: "/about/" },
      { label: "Experience", href: "/experience/" },
    ]);
  });

  it("US-013: footerNav lists the ASK ABOUT pages in order", () => {
    expect(footerNav(askAbout, commands).map((link) => link.label)).toEqual([
      "About",
      "Experience",
      "Projects",
      "Skills",
      "Contact",
    ]);
  });
});
