"use client";

import { Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/Toast";

type ToastState = { text: string };

const TOAST_MS = 2000;

export function ShareButton() {
  // A new object for every copy, so a second copy restarts the 2 s timer even with the same text.
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (toast === null) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ text: "Link copied" });
    } catch {
      // The visitor sees the failure in the toast, so it isn't swallowed.
      setToast({ text: "Couldn't copy the link" });
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Copy link to this page"
        onClick={copyLink}
        className="flex size-10 items-center justify-center rounded-pill border border-border bg-surface text-text hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        <LinkIcon aria-hidden="true" className="size-5" />
      </button>
      <Toast message={toast?.text ?? null} />
    </>
  );
}
