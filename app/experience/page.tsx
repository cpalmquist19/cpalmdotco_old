import { ContentPage } from "@/components/shell/ContentPage";
import { RoleEntry } from "@/components/ui/RoleEntry";
import { getCommands, getExperience } from "@/lib/content";
import { getPageIntro } from "@/lib/pages";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function ExperiencePage() {
  const roles = getExperience();
  const { eyebrow, title, intro } = getPageIntro(getCommands(), "/experience");
  return (
    <ContentPage
      breadcrumb={[{ label: "/experience" }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      current="/experience"
    >
      <ol aria-label="Roles" className="border-b border-border">
        {roles.map((role, index) => (
          <RoleEntry key={role.order} number={String(index + 1).padStart(2, "0")} role={role} />
        ))}
      </ol>
    </ContentPage>
  );
}
