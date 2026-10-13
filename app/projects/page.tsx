import { ContentPage } from "@/components/shell/ContentPage";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { getCommands, getProjects } from "@/lib/content";
import { getPageIntro } from "@/lib/pages";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function ProjectsPage() {
  // Newest start first. Projects with the same start month sort by title.
  const projects = [...getProjects()].sort(
    (a, b) => b.dates.start.localeCompare(a.dates.start) || a.title.localeCompare(b.title),
  );
  const { eyebrow, title, intro } = getPageIntro(getCommands(), "/projects");
  return (
    <ContentPage
      breadcrumb={[{ label: "/projects" }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      current="/projects"
    >
      <ol aria-label="Projects">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ol>
    </ContentPage>
  );
}
