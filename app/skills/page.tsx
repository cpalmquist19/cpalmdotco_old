import { ContentPage } from "@/components/shell/ContentPage";
import { InPractice } from "@/components/ui/InPractice";
import { getCommands, getSkills } from "@/lib/content";
import { getPageIntro } from "@/lib/pages";

// Prerendered at build time. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function SkillsPage() {
  const skills = getSkills();
  const { eyebrow, title, intro } = getPageIntro(getCommands(), "/skills");
  return (
    <ContentPage
      breadcrumb={[{ label: "/skills" }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      current="/skills"
    >
      <div className="space-y-10">
        {skills.categories.map((category, index) => (
          <section key={category.name} aria-labelledby={`skills-${index}`}>
            <h2 id={`skills-${index}`} className="text-xl font-semibold text-text">
              {category.name}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-text">
              {category.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <InPractice pairs={skills.inPractice} />
      </div>
    </ContentPage>
  );
}
