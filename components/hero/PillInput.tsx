"use client";

import { CommandPalette } from "@/components/palette/CommandPalette";
import type { RefObject } from "react";
import type { ComboboxInput, PaletteState } from "@/components/palette/useCommandPalette";

type Props = {
  onFocusChange: (focused: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  input: ComboboxInput;
  palette: PaletteState;
};

// The pill input and the combobox that owns the slash palette (F3.4). The palette is anchored to this
// wrapper, so it opens above the input. The skip link (F1.7) targets the input's id. US-032 replaces it with ChatInput.
export function PillInput({ onFocusChange, inputRef, input, palette }: Props) {
  return (
    <div className="relative">
      {/* The combobox attributes are written out here, not spread, so the lint rule can see the required ones. */}
      <input
        ref={inputRef}
        id="chat-input"
        type="text"
        role="combobox"
        aria-label="Ask about Caleb"
        aria-autocomplete={input["aria-autocomplete"]}
        aria-expanded={input["aria-expanded"]}
        aria-controls={input["aria-controls"]}
        aria-activedescendant={input["aria-activedescendant"]}
        value={input.value}
        onChange={input.onChange}
        onKeyDown={input.onKeyDown}
        placeholder="Ask me anything"
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        className="h-12 w-full rounded-pill border border-border bg-surface px-5 text-base text-text placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      />
      <CommandPalette {...palette} />
    </div>
  );
}
