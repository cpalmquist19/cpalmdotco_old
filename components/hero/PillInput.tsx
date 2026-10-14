"use client";

type Props = { onFocusChange: (focused: boolean) => void };

// A plain pill input for now. The skip link (F1.7) targets its id. US-032 replaces it with ChatInput.
export function PillInput({ onFocusChange }: Props) {
  return (
    <input
      id="chat-input"
      type="text"
      aria-label="Ask about Caleb"
      placeholder="Ask me anything"
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
      className="h-12 w-full rounded-pill border border-border bg-surface px-5 text-base text-text placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    />
  );
}
