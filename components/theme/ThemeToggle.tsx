"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_COLORS, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

// Returns whether the choice was saved. Blocked storage is not an error for the
// visitor: the theme still applies to this page, it just isn't remembered.
function saveTheme(theme: Theme): boolean {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

function toggleTheme() {
  // Read the page, not React state, so this can't disagree with the inline script.
  const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
  saveTheme(next);
}

// The server always renders light and the inline script may then change it, so
// both icons are rendered and globals.css hides the wrong one. Choosing in React
// would be a hydration mismatch.
export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Switch theme"
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-pill border border-border bg-surface text-text hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      <Moon aria-hidden="true" className="theme-icon-moon size-5" />
      <Sun aria-hidden="true" className="theme-icon-sun size-5" />
    </button>
  );
}
