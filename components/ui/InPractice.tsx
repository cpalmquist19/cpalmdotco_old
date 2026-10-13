import type { Skills } from "@/lib/content-schemas";

type Props = { pairs?: NonNullable<Skills["inPractice"]> };

// The "In practice" list from skills.json (F5.4). With no pairs it renders nothing, so the page never shows an empty heading.
export function InPractice({ pairs }: Props) {
  if (!pairs || pairs.length === 0) return null;
  return (
    <section aria-labelledby="in-practice">
      <h2 id="in-practice" className="text-xl font-semibold text-text">
        In practice
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-text">
        {pairs.map((pair) => (
          <li key={`${pair.tool}|${pair.project}`} className="leading-7">
            <strong className="font-semibold">{pair.tool}</strong> in {pair.project}
          </li>
        ))}
      </ul>
    </section>
  );
}
