import Link from "next/link";
import type { Project } from "@/lib/content-schemas";
import { formatRange } from "@/lib/dates";

type Props = { project: Project };

// One project in the Projects feed: meta line, linked title, pitch and stats line (F5.3).
export function ProjectCard({ project }: Props) {
  const href = `/projects/${project.slug}/`;
  return (
    <article className="border-t border-border py-8">
      <p className="text-sm text-text-muted">
        {project.category} · {formatRange(project.dates.start, project.dates.end)}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-text">
        <Link
          href={href}
          className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          {project.title}
        </Link>
      </h2>
      <p className="mt-2 leading-7 text-text">{project.pitch}</p>
      <p className="mt-3 text-sm text-text-muted">
        {project.stats.map((stat) => `${stat.value} ${stat.label}`).join(" · ")}
      </p>
    </article>
  );
}
