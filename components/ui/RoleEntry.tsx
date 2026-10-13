import { TagList } from "@/components/ui/TagList";
import type { Experience } from "@/lib/content-schemas";
import { formatRange } from "@/lib/dates";

type Props = { number: string; role: Experience };

// One role in the Experience list. The number is for sighted readers: the <ol> already gives the order.
export function RoleEntry({ number, role }: Props) {
  return (
    <li className="grid gap-4 border-t border-border py-8 sm:grid-cols-[4rem_1fr]">
      <span aria-hidden="true" className="font-mono text-sm text-text-faint">
        {number}
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-text">{role.title}</h2>
        <p className="mt-1 text-text">{role.company}</p>
        <p className="mt-1 text-sm text-text-muted">{formatRange(role.start, role.end)}</p>
        <p className="mt-1 text-sm text-text-muted">{role.location}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-text">
          {role.bullets.map((bullet) => (
            <li key={bullet} className="leading-7">
              {bullet}
            </li>
          ))}
        </ul>
        <TagList tags={role.tags} label={`Tags for ${role.title} at ${role.company}`} />
      </div>
    </li>
  );
}
