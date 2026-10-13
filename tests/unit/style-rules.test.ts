import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));

// CODING.md § 5: components use the token classes only, never a colour value.
const hexColour = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i;
const colourFunction = /\b(?:rgba?|hsla?|hwb|oklab|oklch|lab|lch)\(/;
const paletteNames =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const colourUtilities =
  "bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|shadow|placeholder";
const paletteClass = new RegExp(
  `(?<![\\w-])(?:${colourUtilities})-(?:white|black|(?:${paletteNames})-\\d{2,3})(?![\\w-])`,
);
const darkVariant = /(?<![\w-])dark:/;

function colourValues(source: string): string[] {
  return [hexColour, colourFunction, paletteClass].flatMap((pattern) => {
    const match = pattern.exec(source);
    return match ? [match[0]] : [];
  });
}

function hasDarkVariant(source: string): boolean {
  return darkVariant.test(source);
}

function tsxFilesUnder(folder: string): string[] {
  const absolute = join(root, folder);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => join(folder, name));
}

const componentFiles = [...tsxFilesUnder("app"), ...tsxFilesUnder("components")];

describe("US-003: style rules", () => {
  it("US-003: finds the files it is meant to check", () => {
    expect(componentFiles).toContain(join("app", "layout.tsx"));
  });

  it("US-003: no colour values in components", () => {
    const offenders = componentFiles.flatMap((file) => {
      const found = colourValues(readFileSync(join(root, file), "utf8"));
      return found.length > 0 ? [`${file}: ${found.join(", ")}`] : [];
    });

    expect(offenders).toEqual([]);
  });

  it("US-003: no dark: variant", () => {
    const offenders = componentFiles.filter((file) =>
      hasDarkVariant(readFileSync(join(root, file), "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  it("US-003: the detectors catch what they are meant to catch", () => {
    expect(colourValues('<p style={{ color: "#fff" }} />')).toEqual(["#fff"]);
    expect(colourValues('<p className="border-[#dedad3]" />')).toEqual(["#dedad3"]);
    expect(colourValues("background: rgb(0 0 0)")).toEqual(["rgb("]);
    expect(colourValues("background: hsl(10 20% 30%)")).toEqual(["hsl("]);
    expect(colourValues('<p className="bg-white" />')).toEqual(["bg-white"]);
    expect(colourValues('<p className="px-2 text-gray-500" />')).toEqual(["text-gray-500"]);
    expect(hasDarkVariant('<p className="bg-bg dark:bg-black" />')).toBe(true);

    // Token classes and ordinary hash links must not trip the rules.
    expect(
      colourValues('<a href="#main" className="bg-bg text-text-muted border-border bg-cta-bg" />'),
    ).toEqual([]);
    expect(hasDarkVariant('<p className="bg-bg" data-theme="dark" />')).toBe(false);
  });
});
