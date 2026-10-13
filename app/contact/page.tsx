import { ContentPage } from "@/components/shell/ContentPage";
import { getCommands, getProfile } from "@/lib/content";
import { getPageIntro } from "@/lib/pages";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function ContactPage() {
  const profile = getProfile();
  const { eyebrow, title, intro } = getPageIntro(getCommands(), "/contact");
  return (
    <ContentPage
      breadcrumb={[{ label: "/contact" }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      current="/contact"
    >
      <dl className="grid gap-6 sm:grid-cols-[8rem_1fr]">
        <div>
          <dt className="text-sm text-text-muted">Email</dt>
          <dd className="mt-1 text-text">
            <a href={`mailto:${profile.email}`} className="underline underline-offset-4">
              {profile.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Location</dt>
          <dd className="mt-1 text-text">{profile.location}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Status</dt>
          <dd className="mt-1 text-text">{profile.status}</dd>
        </div>
      </dl>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <a href={profile.links.linkedin} className="underline underline-offset-4">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={profile.links.github} className="underline underline-offset-4">
            GitHub
          </a>
        </li>
      </ul>
    </ContentPage>
  );
}
