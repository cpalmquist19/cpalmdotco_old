import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { THEME_COLORS, THEME_STORAGE_KEY, themeScript } from "@/lib/theme";

const css = readFileSync(
  fileURLToPath(new URL("../../../app/globals.css", import.meta.url)),
  "utf8",
);

function bgIn(selector: string): string | undefined {
  const block = css.split(selector)[1]?.split("}")[0];
  return block?.match(/--bg:\s*(#[0-9a-f]{6})\s*;/i)?.[1];
}

type Result = { theme: string | undefined; color: string | undefined };

// Runs the inline script against a stand-in page, as a browser would.
function runScript(storage: { getItem: (key: string) => string | null }, hasMeta = true): Result {
  const meta = { content: "" };
  const root: { dataset: { theme?: string } } = { dataset: {} };
  const document = {
    documentElement: root,
    querySelector: () =>
      hasMeta
        ? {
            setAttribute: (_name: string, value: string) => {
              meta.content = value;
            },
          }
        : null,
  };

  runInNewContext(themeScript, { document, localStorage: storage });

  return { theme: root.dataset.theme, color: hasMeta ? meta.content : undefined };
}

describe("US-004: theme", () => {
  it("US-004: THEME_COLORS match the --bg tokens in globals.css", () => {
    expect(bgIn(':root,\n[data-theme="light"] {')).toBe(THEME_COLORS.light);
    expect(bgIn('[data-theme="dark"] {')).toBe(THEME_COLORS.dark);
  });

  it("US-004: the inline script applies a saved dark theme and its colour", () => {
    const storage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? "dark" : null) };

    expect(runScript(storage)).toEqual({ theme: "dark", color: THEME_COLORS.dark });
  });

  it("US-004: the inline script falls back to light for a missing or invalid value", () => {
    const expected = { theme: "light", color: THEME_COLORS.light };

    expect(runScript({ getItem: () => null })).toEqual(expected);
    expect(runScript({ getItem: () => "purple" })).toEqual(expected);
    expect(runScript({ getItem: () => "" })).toEqual(expected);
  });

  it("US-004: the inline script falls back to light when storage throws", () => {
    const blocked = {
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    };

    expect(runScript(blocked)).toEqual({ theme: "light", color: THEME_COLORS.light });
  });

  it("US-004: the inline script still sets the theme when the meta tag is missing", () => {
    expect(runScript({ getItem: () => "dark" }, false).theme).toBe("dark");
  });

  it("US-004: the inline script is ES5 syntax", () => {
    expect(themeScript).not.toMatch(/=>|\b(?:let|const|class)\b|`|\.\.\./);
  });
});
