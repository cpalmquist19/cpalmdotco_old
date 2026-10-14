import type { CSSProperties } from "react";
import { Chip } from "@/components/chips/Chip";
import { iconFor } from "@/components/ui/icons";
import type { Command } from "@/lib/content-schemas";

type Props = { commands: Command[]; revealed: boolean };

// The stagger is a CSS variable, which globals.css multiplies by 40 ms (F2.5). React has no typed
// name for custom properties, so the type says which names are allowed.
type CssVariables = { [name: `--${string}`]: number };

function staggerStyle(index: number): CSSProperties & CssVariables {
  return { "--i": index };
}

// The chips in order (F2.1). `revealed` turns on the rise-in once the page is interactive (D-033).
export function ChipRow({ commands, revealed }: Props) {
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
    </ul>
  );
}
