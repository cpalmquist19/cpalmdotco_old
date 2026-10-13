import { ContentPage } from "@/components/shell/ContentPage";
import { getProfile } from "@/lib/content";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

// /cv isn't an ASK ABOUT command, so its copy is fixed site text, not a fact (D-018).
export default function CvPage() {
  const profile = getProfile();
  return (
    <ContentPage
      breadcrumb={[{ label: "/cv" }]}
      eyebrow="CV"
      title="Résumé"
      intro="My CV as a one-page PDF."
      current="/cv"
    >
      <a
        href={profile.links.cv}
        download
        className="inline-flex h-10 items-center rounded-pill border border-border px-4 text-sm font-medium text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        Download CV (PDF)
      </a>
    </ContentPage>
  );
}
