"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

// The first Tab stop on the home page (F1.7). It's hidden until it has focus, and it moves focus to the input.
// Without JavaScript, the href still jumps to the input.
export function SkipLink() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return (
    <a
      href="#chat-input"
      // Safari leaves links out of the Tab order by default. An explicit 0 keeps it a Tab stop there (F1.7).
      tabIndex={0}
      onClick={focusInput}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-pill focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-text focus-visible:outline-2 focus-visible:outline-text"
    >
      Skip to the chat input
    </a>
  );
}

function focusInput(event: MouseEvent<HTMLAnchorElement>) {
  const input = document.getElementById("chat-input");
  if (input === null) return;
  event.preventDefault();
  input.focus();
}
