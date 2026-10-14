import { Ellipsis } from "lucide-react";
import type { CSSProperties } from "react";
import { Chip } from "@/components/chips/Chip";
import { iconFor } from "@/components/ui/icons";
import type { Command } from "@/lib/content-schemas";

type Props = { commands: Command[]; revealed: boolean; onMore: () => void };

// The stagger is a CSS variable, which globals.css multiplies by 40 ms (F2.5). React has no typed
// name for custom properties, so the type says which names are allowed.
type CssVariables = { [name: `--${string}`]: number };

function staggerStyle(index: number): CSSProperties & CssVariables {
  return { "--i": index };
}

// The chips in order (F2.1), then the "More" chip (F3.5). `revealed` turns on the rise-in once the page is
// interactive (D-033). "More" needs JavaScript for the palette, so with scripting off its item is hidden.
export function ChipRow({ commands, revealed, onMore }: Props) {
  return (
    <ul
      aria-label="Suggested questions"
      className={`chip-row mt-4 flex flex-wrap justify-center gap-2 ${revealed ? "chip-row-revealed" : ""}`}
    >
      {commands.map((command, index) => {
        const Icon = iconFor(command.icon);
        return (
          <li key={command.command} style={staggerStyle(index)}>
            <Chip command={command} Icon={Icon} />
          </li>
        );
      })}
      <li style={staggerStyle(commands.length)} className="[@media(scripting:none)]:hidden">
        <button
          type="button"
          onClick={onMore}
          className="inline-flex h-10 items-center gap-2 rounded-pill border border-border px-4 text-sm text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          <Ellipsis aria-hidden="true" className="size-4 shrink-0" />
          More
        </button>
      </li>
    </ul>
  );
}
