"use client";

import { Link as LinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toast } from "@/components/ui/Toast";

type ToastState = { text: string };

const TOAST_MS = 2000;

export function ShareButton() {
  // A new object for every copy, so a second copy restarts the 2 s timer even with the same text.
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | null>(null);

  // The timer starts in the same step as the toast, not in an effect. An effect can run in a later
  // task than the render that shows the text, so the timer could start after the text was already
  // on screen and a clock-driven test had moved on.
  function showToast(text: string) {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setToast({ text });
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setToast(null);
    }, TOAST_MS);
  }

  // Clears a pending timer if the button unmounts.
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    } catch {
      // The visitor sees the failure in the toast, so it isn't swallowed.
      showToast("Couldn't copy the link");
    }
  }

  // The wrapper is the positioning context for the toast, which sits under the button.
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Copy link to this page"
        onClick={copyLink}
        className="flex size-10 items-center justify-center rounded-pill border border-border bg-surface text-text hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        <LinkIcon aria-hidden="true" className="size-5" />
      </button>
      <Toast message={toast?.text ?? null} />
    </div>
  );
}
