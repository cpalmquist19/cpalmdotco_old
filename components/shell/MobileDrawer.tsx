"use client";

import { Menu } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import type { Command, Profile } from "@/lib/content-schemas";

type Props = { profile: Profile; askAbout: Command[] };

const FOCUSABLE = "a[href], button:not([disabled])";

// The sidebar renders only while the drawer is open. A closed dialog stays in the DOM,
// so a second copy would duplicate the desktop sidebar's links and test ids.
export function MobileDrawer({ profile, askAbout }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  function openMenu() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  // Runs for every close: Esc, "Close menu", and a link. Focus goes back to the button
  // here, because the browser doesn't reliably restore it for a dialog.
  function handleClose() {
    setOpen(false);
    menuButtonRef.current?.focus();
  }

  // Native dialogs let Tab leave for the browser's own UI, so Tab wraps here instead.
  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // The app router keeps this layout mounted, so the drawer must close itself on navigation.
  function closeOnLink(event: MouseEvent<HTMLDialogElement>) {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  }

  return (
    <div className="lg:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={openMenu}
        className="flex size-9 items-center justify-center rounded-pill text-text hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={handleClose}
        onKeyDown={trapFocus}
        onClick={closeOnLink}
        className="m-0 h-dvh max-h-dvh w-[var(--sidebar-w)] max-w-[85vw] bg-sidebar p-0 backdrop:bg-text/40"
      >
        {open && (
          <Sidebar profile={profile} askAbout={askAbout} variant="drawer" onClose={closeMenu} />
        )}
      </dialog>
    </div>
  );
}
