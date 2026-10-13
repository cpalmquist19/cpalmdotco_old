import { notFound } from "next/navigation";
import { ContentPage } from "@/components/shell/ContentPage";
import { Markdown } from "@/components/ui/Markdown";
import { TagList } from "@/components/ui/TagList";
import { getProjects } from "@/lib/content";
import { formatRange } from "@/lib/dates";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";
// Only the slugs from generateStaticParams exist, so any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjects().find((item) => item.slug === slug);
  if (project === undefined) notFound();

  const { sections } = project;
  return (
    <ContentPage
      breadcrumb={[{ label: "/projects", href: "/projects/" }, { label: project.title }]}
      eyebrow={project.category}
      title={project.title}
      intro={project.pitch}
      current="/projects"
    >
      <p className="text-sm text-text-muted">
        {project.category} · {formatRange(project.dates.start, project.dates.end)}
      </p>
      <p className="mt-3 text-sm text-text-muted">
        {project.stats.map((stat) => `${stat.value} ${stat.label}`).join(" · ")}
      </p>

      <div className="mt-10 space-y-10">
        {[
          { heading: "Problem", text: sections.problem },
          { heading: "What I built", text: sections.built },
          { heading: "Numbers", text: sections.numbers },
        ].map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-text">{section.heading}</h2>
            <Markdown>{section.text}</Markdown>
          </section>
        ))}
        <section>
          <h2 className="text-xl font-semibold text-text">Stack</h2>
          <Markdown>{sections.stack}</Markdown>
          <TagList tags={project.stack} label="Stack" />
        </section>
      </div>

      {project.repo !== undefined && (
        <a
          href={project.repo}
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-10 items-center rounded-pill border border-border px-4 text-sm font-medium text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          View the code
        </a>
      )}
    </ContentPage>
  );
}
