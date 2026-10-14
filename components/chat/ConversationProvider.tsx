"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { askedThread, historyState, threadFromState } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

type Snapshot = { thread: string[]; homeMounted: boolean };

type Store = {
  get: () => Snapshot;
  update: (patch: Partial<Snapshot>) => void;
  subscribe: (listener: () => void) => () => void;
};

const NOTHING_YET: Snapshot = { thread: [], homeMounted: false };

// The thread is read by React through useSyncExternalStore. Event handlers and effects write to it, so
// nothing copies it into state from an effect (CODING § 4).
function createStore(): Store {
  let snapshot = NOTHING_YET;
  const listeners = new Set<() => void>();
  return {
    get: () => snapshot,
    update(patch) {
      snapshot = { ...snapshot, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

type Conversation = {
  store: Store;
  ask: (command: Command) => void;
  setHomeMounted: (mounted: boolean) => void;
};

const ConversationContext = createContext<Conversation | null>(null);

type Props = { commands: Command[]; children: ReactNode };

// Mounted by AppShell, so every page shares one thread: the home page's chips, the sidebar (US-024) and
// the thread (US-032) read the same state.
export function ConversationProvider({ commands, children }: Props) {
  const [store] = useState(createStore);
  const pathname = usePathname();

  // Next writes its own navigations into history.state after render, so the entry is read in an effect,
  // which runs after that write. The pathname is a dependency so every navigation re-reads it.
  useEffect(() => {
    const sync = () => store.update({ thread: threadFromState(window.history.state, commands) });
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [store, commands, pathname]);

  // A plain window.history.pushState, not router.push: router.push would navigate and replace the page (F2.3).
  const ask = useCallback(
    (command: Command) => {
      const thread = askedThread(store.get().thread, command.command);
      window.history.pushState(historyState(thread), "", command.answer);
      store.update({ thread });
    },
    [store],
  );

  const setHomeMounted = useCallback(
    (mounted: boolean) => store.update({ homeMounted: mounted }),
    [store],
  );

  const value = useMemo(() => ({ store, ask, setHomeMounted }), [store, ask, setHomeMounted]);
  return <ConversationContext value={value}>{children}</ConversationContext>;
}

// The thread, whether the home page is mounted, and the actions that change them.
export function useConversation() {
  const conversation = useContext(ConversationContext);
  if (conversation === null) {
    throw new Error("useConversation must be used inside ConversationProvider");
  }
  const snapshot = useSyncExternalStore(
    conversation.store.subscribe,
    conversation.store.get,
    () => NOTHING_YET,
  );
  return {
    ...snapshot,
    ask: conversation.ask,
    setHomeMounted: conversation.setHomeMounted,
  };
}
