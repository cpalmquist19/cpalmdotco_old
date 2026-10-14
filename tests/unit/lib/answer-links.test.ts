import { describe, expect, it } from "vitest";
import { linksFor } from "@/lib/answer-links";
import { FIXTURE_DIR } from "@/tests/unit/helpers/content-fixture";
import { commandOf } from "@/tests/unit/helpers/command";
import { loadContent } from "@/lib/content";
import { buildKnowledge } from "@/lib/knowledge";

const { projects } = loadContent(FIXTURE_DIR);
const fixtureSources = buildKnowledge(loadContent(FIXTURE_DIR)).sources;

const commands = [
  commandOf({ command: "/about", label: "About", answer: "/about/", order: 1 }),
  commandOf({ command: "/experience", label: "Experience", answer: "/experience/", order: 2 }),
  commandOf({ command: "/skills", label: "Skills", answer: "/skills/", order: 4 }),
  commandOf({ command: "/contact", label: "Contact", answer: "/contact/", order: 5 }),
];

const sources = [
  { id: "profile", href: "/contact/" },
  { id: "about", href: "/about/" },
  { id: "skills", href: "/skills/" },
  { id: "experience/northwind", href: "/experience/" },
  { id: "experience/atlas", href: "/experience/" },
];

describe("US-030", () => {
  it("US-030: one cited source becomes one link with its page's label and href", () => {
    expect(linksFor(["about"], { sources, commands, projects })).toEqual([
      { label: "About", href: "/about/" },
    ]);
  });

  it("US-030: a project source is labelled with the project's title", () => {
    expect(
      linksFor(["projects/atlas-api"], { sources: fixtureSources, commands, projects }),
    ).toEqual([{ label: "Atlas API test harness", href: "/projects/atlas-api/" }]);
  });

  it("US-030: two sources on one page (two experience entries) give one link", () => {
    expect(
      linksFor(["experience/northwind", "experience/atlas"], { sources, commands, projects }),
    ).toEqual([{ label: "Experience", href: "/experience/" }]);
  });

  it("US-030: more than two pages give the first two cited", () => {
    expect(linksFor(["skills", "profile", "about"], { sources, commands, projects })).toEqual([
      { label: "Skills", href: "/skills/" },
      { label: "Contact", href: "/contact/" },
    ]);
  });

  it("US-030: an id that isn't in the pack is ignored", () => {
    expect(linksFor(["no-such-source", "about"], { sources, commands, projects })).toEqual([
      { label: "About", href: "/about/" },
    ]);
  });

  it("US-030: no valid citation gives the Contact page", () => {
    const contact = [{ label: "Contact", href: "/contact/" }];

    expect(linksFor([], { sources, commands, projects })).toEqual(contact);
    expect(linksFor(["no-such-source"], { sources, commands, projects })).toEqual(contact);
  });

  it("US-030: a page with no commands.json entry is left out, not shown with an invented label", () => {
    const withoutSkills = commands.filter((command) => command.command !== "/skills");

    expect(linksFor(["skills", "about"], { sources, commands: withoutSkills, projects })).toEqual([
      { label: "About", href: "/about/" },
    ]);
    expect(linksFor(["skills"], { sources, commands: withoutSkills, projects })).toEqual([]);
  });
});
