"use client";

import { ArrowUp } from "lucide-react";
import type { KeyboardEvent, RefObject } from "react";
import { CommandPalette } from "@/components/palette/CommandPalette";
import type { ComboboxInput, PaletteState } from "@/components/palette/useCommandPalette";
import { MAX_INPUT_CHARS } from "@/lib/chat-limits";

type Props = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  input: ComboboxInput;
  palette: PaletteState;
  streaming: boolean;
  onFocusChange: (focused: boolean) => void;
  onSend: (text: string) => boolean;
  onCleared: () => void;
};

// The visitor's input and its Send button (F4.5). Enter sends, Shift+Enter adds a new line, and Enter during
// IME composition is left to the composition. The slash palette owns the keys while it has a command to run
// (F3), so it's asked first. The skip link (F1.7) targets the input's id, and the input keeps its name.
export function ChatInput({
  inputRef,
  input,
  palette,
  streaming,
  onFocusChange,
  onSend,
  onCleared,
}: Props) {
  const trimmed = input.value.trim();
  // A slash command is never sent as a question, so Send stays off for it too (F4.1).
  const canSend = !streaming && trimmed !== "" && !trimmed.startsWith("/");

  function submit() {
    if (!canSend) return;
    if (onSend(input.value)) onCleared();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    input.onKeyDown(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="relative">
      {/* The combobox attributes are written out here, not spread, so the lint rule can see the required ones. */}
      <textarea
        ref={inputRef}
        id="chat-input"
        rows={1}
        role="combobox"
        aria-label="Ask about Caleb"
        aria-autocomplete={input["aria-autocomplete"]}
        aria-expanded={input["aria-expanded"]}
        aria-controls={input["aria-controls"]}
        aria-activedescendant={input["aria-activedescendant"]}
        value={input.value}
        onChange={input.onChange}
        onKeyDown={onKeyDown}
        maxLength={MAX_INPUT_CHARS}
        placeholder="Ask me anything"
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        className="min-h-12 w-full resize-none rounded-pill border border-border bg-surface py-3 pr-14 pl-5 text-base leading-6 text-text placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      />
      <button
        type="button"
        aria-label="Send"
        disabled={!canSend}
        onClick={submit}
        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-pill border border-border bg-surface text-text hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text disabled:opacity-40"
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </button>
      <CommandPalette {...palette} />
    </div>
  );
}
