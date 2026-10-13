import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { splitFrontmatter } from "@/lib/content";

export const FIXTURE_DIR = fileURLToPath(new URL("../fixtures/content", import.meta.url));

// Copies the valid fixture to a new temp folder, so a test can break one thing without touching the repo.
export function copyFixture(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "content-fixture-"));
  cpSync(FIXTURE_DIR, dir, { recursive: true });
  return dir;
}

export function removeFolder(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

// Replaces text in one file. Throws when nothing matches, so a typo in a test can't pass silently.
export function rewrite(dir: string, file: string, from: string | RegExp, to: string): void {
  const full = path.join(dir, file);
  const text = readFileSync(full, "utf8");
  const next = text.replace(from, to);
  if (next === text) throw new Error(`rewrite: ${file} has no match for ${String(from)}`);
  writeFileSync(full, next);
}

// Removes the line that holds `key`, in either JSON ("key": ...) or YAML (key: ...) form.
export function dropLine(dir: string, file: string, key: string): void {
  rewrite(dir, file, new RegExp(`^\\s*"?${key}"?:.*\\n`, "m"), "");
}

// The parsed JSON object from the fixture. Tests spread it and break one field.
export function fixtureObject(file: string): Record<string, unknown> {
  const data: Record<string, unknown> = JSON.parse(
    readFileSync(path.join(FIXTURE_DIR, file), "utf8"),
  );
  return data;
}

// The frontmatter of a fixture Markdown file, parsed as YAML.
export function fixtureFrontmatter(file: string): Record<string, unknown> {
  const parts = splitFrontmatter(readFileSync(path.join(FIXTURE_DIR, file), "utf8"));
  if (parts === undefined) throw new Error(`fixture ${file} has no frontmatter`);
  const data: Record<string, unknown> = parseYaml(parts.frontmatter);
  return data;
}
