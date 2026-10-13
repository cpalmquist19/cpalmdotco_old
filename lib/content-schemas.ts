import { z } from "zod";

// Every schema is strict, so a mistyped field name fails the build (D-016).
// Client components may import these types; lib/content.ts reads the files and must not reach the browser.

const text = z.string().trim().min(1);
const sitePath = z.string().startsWith("/");
const href = z.union([z.url({ protocol: /^https?$/ }), sitePath]);
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be YYYY-MM");
const monthOrPresent = z.union([month, z.literal("present")]);
const slug = z.string().regex(/^[a-z0-9-]+$/, "must be lowercase letters, digits and hyphens");
const placeholder = z.boolean().optional();

export const profileSchema = z.strictObject({
  placeholder,
  name: text,
  role: text,
  greeting: text,
  status: text,
  location: text,
  email: z.email(),
  headlinePool: z.array(text).min(3),
  socials: z.array(z.strictObject({ label: text, href, icon: text })).min(1),
  links: z.strictObject({ cv: href, linkedin: href, github: href }),
  sidebar: z.strictObject({
    askAbout: z.array(text),
    projects: z.array(z.strictObject({ label: text, href })),
  }),
});

export const commandSchema = z.strictObject({
  placeholder,
  command: z
    .string()
    .regex(/^\/[a-z0-9-]+$/, "must be / followed by lowercase letters, digits and hyphens"),
  label: text,
  description: text,
  answer: z.union([z.literal("model"), sitePath]),
  chip: z.boolean(),
  order: z.number().int().min(1),
  icon: text,
  intro: text.optional(),
});

export const commandsSchema = z.array(commandSchema).min(1);

export const skillsSchema = z.strictObject({
  placeholder,
  categories: z.array(z.strictObject({ name: text, items: z.array(text).min(1) })).min(1),
  inPractice: z.array(z.strictObject({ tool: text, project: text })).optional(),
});

// The frontmatter of experience/*.md. The loader adds the bullets from the body.
export const experienceFrontmatterSchema = z.strictObject({
  placeholder,
  title: text,
  company: text,
  location: text,
  start: month,
  end: monthOrPresent,
  order: z.number().int().min(1),
  tags: z.array(text),
});

// The frontmatter of projects/*.md. The loader adds the sections from the body.
export const projectFrontmatterSchema = z.strictObject({
  placeholder,
  slug,
  title: text,
  category: text,
  dates: z.strictObject({ start: month, end: monthOrPresent }),
  pitch: text,
  stats: z.array(z.strictObject({ value: text, label: text })).min(1),
  stack: z.array(text).min(1),
  repo: href.optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Command = z.infer<typeof commandSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Experience = z.infer<typeof experienceFrontmatterSchema> & { bullets: string[] };
export type ProjectSections = { problem: string; built: string; numbers: string; stack: string };
export type Project = z.infer<typeof projectFrontmatterSchema> & { sections: ProjectSections };
