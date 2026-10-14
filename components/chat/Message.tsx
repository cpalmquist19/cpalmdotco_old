import Link from "next/link";
import { Avatar } from "@/components/shell/Avatar";
import type { Command } from "@/lib/content-schemas";

type Props = { role: "visitor" | "bot"; command: Command };

// A visitor's message is the command's label in a bubble on the right. The bot's answer is the command's
// intro (or its description, when it has no intro) with a link to the page. That default is decision D-032,
// still open. This is the one place the answer's content is chosen, so a different choice changes only this file.
export function Message({ role, command }: Props) {
  if (role === "visitor") {
    return (
      <div className="flex justify-end">
        <p
          data-testid="visitor-message"
          className="max-w-md rounded-box bg-surface px-4 py-2 text-text"
        >
          {command.label}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="min-w-0 pt-1">
        <p className="leading-7 text-text">{command.intro ?? command.description}</p>
        <p className="mt-2">
          <Link
            href={command.answer}
            className="rounded-sm text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            {command.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
