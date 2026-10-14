"use client";

import { ArrowUp } from "lucide-react";
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";
import { CommandPalette } from "@/components/palette/CommandPalette";
import type { ComboboxInput, PaletteState } from "@/components/palette/useCommandPalette";
import { counterShown, MAX_INPUT_CHARS, remainingChars } from "@/lib/chat-limits";

type Props = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  input: ComboboxInput;
  palette: PaletteState;
  streaming: boolean;
  pinned: boolean;
  onFocusChange: (focused: boolean) => void;
  onSend: (text: string) => boolean;
  onCleared: () => void;
};

// The most lines the input grows to before it scrolls inside itself (F4.5).
const MAX_LINES = 6;

// Grows the input to fit its text, up to MAX_LINES, then lets it scroll. It runs in the input handler, not in an
// effect, so no effect copies state into the DOM (CODING § 4). The height is cleared first, so it can shrink too.
function fit(textarea: HTMLTextAreaElement) {
  const style = getComputedStyle(textarea);
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const cap = MAX_LINES * parseFloat(style.lineHeight) + padding + border;
  textarea.style.height = "auto";
  const wanted = textarea.scrollHeight + border;
  textarea.style.height = `${Math.min(wanted, cap)}px`;
  textarea.style.overflowY = wanted > cap ? "auto" : "hidden";
}

// Back to the one-row height after a send, which is the CSS minimum (min-h-12), so nothing shifts (F4.5).
function release(textarea: HTMLTextAreaElement) {
  textarea.style.height = "";
  textarea.style.overflowY = "";
}

// The visitor's input and its Send button (F4.5). Enter sends, Shift+Enter adds a new line, and Enter during
// IME composition is left to the composition. The slash palette owns the keys while it has a command to run
// (F3), so it's asked first. The skip link (F1.7) targets the input's id, and the input keeps its name.
// Once the conversation has started it is pinned to the bottom of the screen (D-052). It's the same element
// either way, so its focus and text survive the move.
export function ChatInput({
  inputRef,
  input,
  palette,
  streaming,
  pinned,
  onFocusChange,
  onSend,
  onCleared,
}: Props) {
  const trimmed = input.value.trim();
  // A slash command is never sent as a question, so Send stays off for it too (F4.1).
  const canSend = !streaming && trimmed !== "" && !trimmed.startsWith("/");

  function submit() {
    if (!canSend) return;
    if (!onSend(input.value)) return;
    onCleared();
    if (inputRef.current !== null) release(inputRef.current);
  }

  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    input.onChange(event);
    fit(event.target);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    input.onKeyDown(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const counter = counterShown(input.value.length)
    ? `${remainingChars(input.value.length)} left`
    : "";

  return (
    <div className={`max-w-2xl ${pinned ? "sticky bottom-0 order-last bg-bg pt-3 pb-4" : "mt-8"}`}>
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
          onChange={onChange}
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
      {/* The line is always there, so the counter's space never moves the chips below it (F4.9). The region is
          always there too, so a screen reader announces the counter when it first appears. The test id is for
          the tests only: a live region has no role or name to find it by (CODING § 9). */}
      <p
        aria-live="polite"
        aria-atomic="true"
        data-testid="input-counter"
        className="mt-1 h-5 pr-5 text-right text-sm text-text-muted"
      >
        {counter}
      </p>
    </div>
  );
}
