import { ContentPage } from "@/components/shell/ContentPage";
import { Markdown } from "@/components/ui/Markdown";
import { getAbout, getCommands } from "@/lib/content";
import { getPageIntro } from "@/lib/pages";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function AboutPage() {
  const { eyebrow, title, intro } = getPageIntro(getCommands(), "/about");
  return (
    <ContentPage
      breadcrumb={[{ label: "/about" }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      current="/about"
    >
      <Markdown>{getAbout().body}</Markdown>
    </ContentPage>
  );
}
