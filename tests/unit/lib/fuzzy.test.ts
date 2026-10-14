import { describe, expect, it } from "vitest";
import { rankCommands } from "@/lib/fuzzy";
import type { Command } from "@/lib/content-schemas";

// A minimal command. The ranking only reads the name, the description and the order.
function command(name: string, description: string, order: number): Command {
  return {
    command: name,
    label: name.slice(1),
    description,
    answer: `${name}/`,
    chip: true,
    order,
    icon: "user",
  };
}

const about = command("/about", "Quality engineering, then applied AI", 1);
const projects = command("/projects", "What I've built, with the numbers", 2);
const contact = command("/contact", "How to reach me", 3);
const all = [about, projects, contact];

function names(commands: Command[]): string[] {
  return commands.map((item) => item.command);
}

describe("US-025 F3.2: fuzzy matching for the palette", () => {
  it("US-025 F3.2: an empty query returns every command in order", () => {
    expect(names(rankCommands([contact, about, projects], ""))).toEqual([
      "/about",
      "/projects",
      "/contact",
    ]);
  });

  it("US-025 F3.2: matching ignores case", () => {
    expect(names(rankCommands(all, "ABOUT"))).toEqual(["/about"]);
    expect(names(rankCommands(all, "Contact"))).toEqual(["/contact"]);
  });

  it('US-025 F3.2: letters must appear in order, so "pjt" matches "projects" and "ptj" does not', () => {
    expect(names(rankCommands(all, "pjt"))).toEqual(["/projects"]);
    expect(names(rankCommands(all, "ptj"))).toEqual([]);
  });

  it("US-025 F3.2: a name prefix ranks above a later match in the name", () => {
    const cab = command("/cab", "Unrelated", 1);
    const abc = command("/abc", "Unrelated", 2);

    expect(names(rankCommands([cab, abc], "ab"))).toEqual(["/abc", "/cab"]);
  });

  it("US-025 F3.2: a name match ranks above a description match", () => {
    // "abt" is in the description of the first command and in the name of the second, which comes later.
    const described = command("/zzz", "about things", 1);
    const named = command("/cabt", "Unrelated", 2);

    expect(names(rankCommands([described, named], "abt"))).toEqual(["/cabt", "/zzz"]);
  });

  it("US-025 F3.2: ties are broken by order", () => {
    const apple = command("/apple", "Fruit", 2);
    const avocado = command("/avocado", "Fruit", 1);

    expect(names(rankCommands([apple, avocado], "a"))).toEqual(["/avocado", "/apple"]);
  });

  it("US-025 F3.2: a query that matches nothing returns an empty list", () => {
    expect(rankCommands(all, "zzz")).toEqual([]);
  });
});
