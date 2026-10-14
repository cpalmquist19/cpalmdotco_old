"use client";

import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useConversation } from "@/components/chat/ConversationProvider";
import type { Command } from "@/lib/content-schemas";
import { rankCommands } from "@/lib/fuzzy";

// The text after a leading "/", or null when the palette isn't for this text (F3.1). A space ends the
// command, so "/about me" closes the palette.
function queryOf(value: string): string | null {
  if (!value.startsWith("/") || value.includes(" ")) return null;
  return value.slice(1);
}

// The id of an option. The palette sets it, and the input's aria-activedescendant points at it (F3.4).
export function optionIdFor(listboxId: string, index: number): string {
  return `${listboxId}-${index}`;
}

// The values the input needs (F3.4). The role and the element's ref are set by ChatInput. The ref is returned
// on its own, because React's lint rule doesn't allow a render to read any property of an object holding it.
export type ComboboxInput = {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  "aria-autocomplete": "list";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  "aria-activedescendant": string | undefined;
};

// The props the palette needs. `activeIndex` is -1 when nothing is highlighted.
export type PaletteState = {
  open: boolean;
  listboxId: string;
  matches: Command[];
  activeIndex: number;
};

// The slash palette's state and keys (F3), in a hook so US-032's ChatInput can take it without a rewrite.
// The palette is open while the input holds "/" followed by text with no space. Esc hides it, and the
// next keystroke shows it again. Running a command asks it in the chat, as a chip click does (F2.3).
export function useCommandPalette(commands: readonly Command[]) {
  const { ask } = useConversation();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listboxId = useId();
  const [value, setValue] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const query = queryOf(value);
  const open = query !== null && !dismissed;
  const matches = query === null || dismissed ? [] : rankCommands(commands, query);
  const activeIndex = matches.length > 0 ? highlight : -1;
  const expanded = matches.length > 0;

  // The highlight starts again at the top whenever the text changes, so it can't point past the matches.
  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
    setDismissed(false);
    setHighlight(0);
  }

  // Empties the input after a message is sent, and closes the palette with it.
  function clear() {
    setValue("");
    setDismissed(false);
    setHighlight(0);
  }

  function run(command: Command) {
    ask(command);
    clear();
  }

  // ↑ and ↓ wrap at the ends (F3.3). Enter runs the highlighted command, and so does Tab, except Shift+Tab,
  // which keeps its normal meaning. Tab is only stopped while a command is highlighted, so it can't trap focus.
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(true);
      return;
    }
    if (matches.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlight((highlight + step + matches.length) % matches.length);
      return;
    }
    const command = matches[highlight];
    if (
      command !== undefined &&
      (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey))
    ) {
      event.preventDefault();
      run(command);
    }
  }

  // The "More" chip (F3.5): the palette with an empty query, so every command is listed. The input shows
  // the "/" that opens it, and keeps focus, so the visitor can type straight away.
  function openPalette() {
    setValue("/");
    setDismissed(false);
    setHighlight(0);
    inputRef.current?.focus();
  }

  const input: ComboboxInput = {
    value,
    onChange,
    onKeyDown,
    "aria-autocomplete": "list",
    "aria-expanded": expanded,
    "aria-controls": expanded ? listboxId : undefined,
    "aria-activedescendant": activeIndex >= 0 ? optionIdFor(listboxId, activeIndex) : undefined,
  };
  const palette: PaletteState = { open, listboxId, matches, activeIndex };

  return { inputRef, input, palette, openPalette, clear };
}
