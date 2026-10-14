import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  commandSchema,
  commandsSchema,
  experienceFrontmatterSchema,
  profileSchema,
  projectFrontmatterSchema,
  skillsSchema,
} from "@/lib/content-schemas";
import { fixtureFrontmatter, fixtureObject } from "@/tests/unit/helpers/content-fixture";

// The field names (or unknown keys) a failed parse points at.
function failedFields(result: { success: boolean; error?: z.ZodError }): string[] {
  if (!result.error) return [];
  return result.error.issues.flatMap((issue) =>
    issue.code === "unrecognized_keys" ? issue.keys : [String(issue.path[0])],
  );
}

const profile = fixtureObject("profile.json");
const experience = fixtureFrontmatter("experience/northwind-qa.md");
const project = fixtureFrontmatter("projects/atlas-api.md");
const skills = fixtureObject("skills.json");
const command = {
  command: "/about",
  label: "About",
  description: "Who I am",
  answer: "/about/",
  chip: true,
  order: 1,
  icon: "user",
};

describe("US-011", () => {
  it("US-011: profile accepts the fixture", () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });

  it.each([
    "name",
    "role",
    "greeting",
    "headlinePool",
    "sidebar",
    "socials",
    "status",
    "location",
    "email",
    "links",
  ])("US-011: profile rejects a missing %s", (field) => {
    const result = profileSchema.safeParse({ ...profile, [field]: undefined });
    expect(result.success).toBe(false);
    expect(failedFields(result)).toContain(field);
  });

  it("US-011: profile rejects fewer than 3 headline facts", () => {
    const result = profileSchema.safeParse({ ...profile, headlinePool: ["one", "two"] });
    expect(result.success).toBe(false);
    expect(failedFields(result)).toContain("headlinePool");
  });

  it("US-011: profile.links needs cv, linkedin and github", () => {
    const links = {
      cv: "/cv.pdf",
      linkedin: "https://example.com/linkedin",
      github: "https://example.com/github",
    };
    for (const key of Object.keys(links)) {
      const result = profileSchema.safeParse({ ...profile, links: { ...links, [key]: undefined } });
      expect(result.success, `links without ${key}`).toBe(false);
    }
  });

  it("US-011: profile rejects an unknown key", () => {
    const result = profileSchema.safeParse({ ...profile, nickname: "Al" });
    expect(result.success).toBe(false);
    expect(failedFields(result)).toContain("nickname");
  });

  it.each(["title", "company", "start", "end", "location", "order", "tags"])(
    "US-011: experience rejects a missing %s",
    (field) => {
      const result = experienceFrontmatterSchema.safeParse({ ...experience, [field]: undefined });
      expect(result.success).toBe(false);
      expect(failedFields(result)).toContain(field);
    },
  );

  it('US-011: experience end accepts "present" and rejects a value that is neither YYYY-MM nor "present"', () => {
    expect(experienceFrontmatterSchema.safeParse({ ...experience, end: "present" }).success).toBe(
      true,
    );
    for (const end of ["2021", "2021-13", "Present", "soon"]) {
      expect(experienceFrontmatterSchema.safeParse({ ...experience, end }).success, end).toBe(
        false,
      );
    }
  });

  it.each(["slug", "title", "category", "dates", "pitch", "stats", "stack"])(
    "US-011: project rejects a missing %s",
    (field) => {
      const result = projectFrontmatterSchema.safeParse({ ...project, [field]: undefined });
      expect(result.success).toBe(false);
      expect(failedFields(result)).toContain(field);
    },
  );

  it("US-011: project repo is optional", () => {
    expect(projectFrontmatterSchema.safeParse({ ...project, repo: undefined }).success).toBe(true);
    expect(
      projectFrontmatterSchema.safeParse({ ...project, repo: "https://example.com/x" }).success,
    ).toBe(true);
  });

  it("US-011: skills rejects a category with no items", () => {
    const result = skillsSchema.safeParse({ categories: [{ name: "Testing", items: [] }] });
    expect(result.success).toBe(false);
  });

  it("US-011: skills accepts inPractice pairs", () => {
    expect(skillsSchema.safeParse(skills).success).toBe(true);
    expect(skills).toHaveProperty("inPractice");
  });

  it("US-011: command rejects a name without a leading slash", () => {
    const result = commandSchema.safeParse({ ...command, command: "about" });
    expect(result.success).toBe(false);
    expect(failedFields(result)).toContain("command");
  });

  it('US-011: command answer accepts "model"', () => {
    // A chip can't answer with "model" now (US-022), so this fixture is a non-chip entry.
    expect(commandSchema.safeParse({ ...command, chip: false, answer: "model" }).success).toBe(
      true,
    );
  });

  it("US-011: every schema allows placeholder: true", () => {
    expect(profileSchema.safeParse({ ...profile, placeholder: true }).success).toBe(true);
    expect(
      experienceFrontmatterSchema.safeParse({ ...experience, placeholder: true }).success,
    ).toBe(true);
    expect(projectFrontmatterSchema.safeParse({ ...project, placeholder: true }).success).toBe(
      true,
    );
    expect(skillsSchema.safeParse({ ...skills, placeholder: true }).success).toBe(true);
    expect(commandSchema.safeParse({ ...command, placeholder: true }).success).toBe(true);
  });
});

describe("US-022", () => {
  const projects = { ...command, command: "/projects", label: "Projects", answer: "/projects/" };

  it('US-022 F2.2: a chip with answer "model" is rejected, and a non-chip with answer "model" is accepted', () => {
    expect(commandSchema.safeParse({ ...command, chip: true, answer: "model" }).success).toBe(
      false,
    );
    expect(commandSchema.safeParse({ ...command, chip: false, answer: "model" }).success).toBe(
      true,
    );
  });

  it("US-022 F2.2: a chip with a page answer is accepted", () => {
    expect(commandSchema.safeParse({ ...command, chip: true, answer: "/about/" }).success).toBe(
      true,
    );
  });

  it("US-022 F2.1: two entries with the same order are rejected, and the issue points at the second one's order", () => {
    const result = commandsSchema.safeParse([command, { ...projects, order: 1 }]);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([[1, "order"]]);
  });

  it("US-022 F2.1: entries with different orders are accepted", () => {
    expect(commandsSchema.safeParse([command, { ...projects, order: 2 }]).success).toBe(true);
  });

  it("US-022: a rejected chip answer points at the answer field", () => {
    const result = commandSchema.safeParse({ ...command, chip: true, answer: "model" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([["answer"]]);
  });
});
