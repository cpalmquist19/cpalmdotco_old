import commandsData from "@/content/commands.json";
import profileData from "@/content/profile.json";

// Imported at build time so the pages stay static and work with JavaScript off.
// US-011 replaces these types with Zod schemas.
export type Profile = typeof profileData;
export type Command = (typeof commandsData)[number];

export function getProfile(): Profile {
  return profileData;
}

export function getCommands(): Command[] {
  return [...commandsData].sort((a, b) => a.order - b.order);
}
