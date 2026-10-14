"use client";

import { PanelLeftClose, PanelLeftOpen, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { useId, useSyncExternalStore } from "react";
import { Avatar } from "@/components/shell/Avatar";
import { iconFor } from "@/components/ui/icons";
import type { Command, Profile } from "@/lib/content-schemas";

const COLLAPSED_KEY = "sidebar-collapsed";

// Session storage keeps the choice per tab, so a new tab starts expanded.
// Storage doesn't notify the tab that wrote it, so changes go through `listeners`.
const listeners = new Set<() => void>();
// Used when storage is blocked, so the sidebar still collapses for this visit.
let collapsedInMemory = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readCollapsed(): boolean {
  try {
    const saved = sessionStorage.getItem(COLLAPSED_KEY);
    if (saved !== null) return saved === "1";
  } catch {
    // Blocked storage falls through to the in-memory value.
  }
  return collapsedInMemory;
}

function saveCollapsed(next: boolean) {
  collapsedInMemory = next;
  try {
    sessionStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    // The sidebar still collapses for this visit; it just isn't remembered.
  }
  listeners.forEach((listener) => listener());
}

type Props = { profile: Profile; askAbout: Command[] } & (
  { variant: "inline" } | { variant: "drawer"; onClose: () => void }
);

export function Sidebar({ profile, askAbout, ...props }: Props) {
  // The server snapshot is expanded, so a collapsed sidebar appears a moment late
  // on reload, after hydration. Ids are per instance: the drawer renders this
  // component a second time.
  const storedCollapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  // The drawer is always full width: the rail is a desktop choice.
  const collapsed = props.variant === "inline" && storedCollapsed;
  const askAboutId = useId();
  const projectsId = useId();

  function toggle() {
    saveCollapsed(!collapsed);
  }

  // In the rail the text stays in the DOM for screen readers and is hidden visually.
  const labelClass = collapsed ? "sr-only" : "truncate";

  return (
    <aside
      aria-label="Sidebar"
      className={
        props.variant === "drawer"
          ? "flex h-full w-full flex-col overflow-y-auto bg-sidebar p-3"
          : `sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border bg-sidebar p-3 transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex ${
              // The rail keeps the left padding and drops the right one: 64 px minus the
              // border and padding must leave room for a 40 px item. Everything stays
              // left-aligned, so nothing shifts sideways between the two states.
              collapsed ? "w-[var(--rail-w)] items-start pr-0" : "w-[var(--sidebar-w)]"
            }`
      }
    >
      <div className="flex items-center gap-3">
        {props.variant === "inline" && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={toggle}
            className="flex size-10 shrink-0 items-center justify-center rounded-pill text-text-muted hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </button>
        )}
        {/* One link, so the name and the avatar are a single tab stop. The avatar's alt is
            empty, so the name text is the link's accessible name. The rail shows neither
            here: its avatar is at the bottom and carries the link (D-027). */}
        {!collapsed && (
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-box focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            <span className="truncate font-medium text-text">{profile.name}</span>
            <Avatar />
          </Link>
        )}
        {props.variant === "drawer" && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={props.onClose}
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-pill text-text-muted hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      {/* TODO(US-032): also clear the thread without a page load */}
      <Link
        href="/"
        className="mt-4 flex h-10 items-center gap-3 rounded-box px-3 text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        <SquarePen aria-hidden="true" className="size-4 shrink-0" />
        <span className={labelClass}>New chat</span>
      </Link>

      {/* In the rail the heading keeps its space but is invisible, so the icons below
          don't jump up when the sidebar collapses. It stays in the accessibility tree. */}
      <h2
        id={askAboutId}
        className={`${collapsed ? "w-full overflow-hidden whitespace-nowrap opacity-0 select-none" : ""} mt-6 px-3 text-xs font-medium tracking-wider text-text-muted`}
      >
        ASK ABOUT
      </h2>
      <ul aria-labelledby={askAboutId} className="mt-2 flex flex-col gap-1">
        {askAbout.map((command) => {
          const Icon = iconFor(command.icon);
          return (
            <li key={command.command}>
              <Link
                href={command.answer}
                className="flex h-10 items-center gap-3 rounded-box px-3 text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className={labelClass}>{command.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!collapsed && (
        <>
          <h2
            id={projectsId}
            className="mt-6 px-3 text-xs font-medium tracking-wider text-text-muted"
          >
            PROJECTS
          </h2>
          <ul aria-labelledby={projectsId} className="mt-2 flex flex-col gap-1">
            {profile.sidebar.projects.map((project) => (
              <li key={project.href}>
                <Link
                  href={project.href}
                  className="block truncate rounded-box px-3 py-2 text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                >
                  {project.label}
                </Link>
              </li>
            ))}
          </ul>

          <nav aria-label="Social" className="mt-auto pt-6">
            <ul className="flex gap-2">
              {profile.socials.map((social) => {
                const Icon = iconFor(social.icon);
                return (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-pill text-text-muted hover:bg-bg hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}

      {/* The social row is hidden in the rail, so the bottom is free: the avatar sits there
          and nothing above it moves (D-021, D-023). pl-1 centres it on the menu icons. */}
      {collapsed && (
        <div className="mt-auto pt-6 pl-1">
          <Link
            href="/"
            aria-label={profile.name}
            className="flex w-fit rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            <Avatar />
          </Link>
        </div>
      )}
    </aside>
  );
}
