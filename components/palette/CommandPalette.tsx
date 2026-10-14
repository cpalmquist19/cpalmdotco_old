import { optionIdFor } from "@/components/palette/useCommandPalette";
import type { Command } from "@/lib/content-schemas";

type Props = { open: boolean; listboxId: string; matches: Command[]; activeIndex: number };

// The slash palette (F3.1). Above the input on wide screens, and a bottom sheet under 640 px (`max-sm`).
// It never takes focus: the input keeps it, and the highlight reaches a screen reader through
// aria-activedescendant (F3.4). The "No commands match" line sits outside the listbox, because an empty
// listbox fails axe's aria-required-children.
export function CommandPalette({ open, listboxId, matches, activeIndex }: Props) {
  if (!open) return null;

  return (
    <div className="absolute right-0 bottom-full left-0 z-10 mb-2 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mb-0">
      {matches.length === 0 ? (
        <p
          role="status"
          className="rounded-box border border-border bg-surface px-3 py-2 text-sm text-text-muted"
        >
          No commands match
        </p>
      ) : (
        <ul
          role="listbox"
          id={listboxId}
          aria-label="Commands"
          className="max-h-80 overflow-y-auto rounded-box border border-border bg-surface p-1"
        >
          {matches.map((command, index) => (
            <li
              key={command.command}
              role="option"
              id={optionIdFor(listboxId, index)}
              aria-selected={index === activeIndex}
              className="rounded-box px-3 py-2 text-sm text-text aria-selected:bg-bg"
            >
              <span className="font-mono">{command.command}</span>{" "}
              <span className="text-text-muted">{command.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
