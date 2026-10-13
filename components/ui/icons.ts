import { Briefcase, Folder, Globe, Mail, User, Wrench, type LucideIcon } from "lucide-react";

// Only the icons the content JSON uses, imported one by one so the bundle stays small.
// Lucide has no brand icons for GitHub or LinkedIn in this version, so both use Globe.
const ICONS: Record<string, LucideIcon> = {
  user: User,
  briefcase: Briefcase,
  folder: Folder,
  wrench: Wrench,
  mail: Mail,
  github: Globe,
  linkedin: Globe,
};

export function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? User;
}
