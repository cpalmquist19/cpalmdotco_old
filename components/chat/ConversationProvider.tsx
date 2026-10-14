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
import { requestMessages, streamAnswer, type RequestMessage } from "@/lib/chat-client";
import {
  askedThread,
  historyState,
  threadFromState,
  type Exchange,
  type Turn,
} from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

// The answer that is streaming now, or null. It is written into history only when it ends (D-053).
type Snapshot = { thread: Turn[]; homeMounted: boolean; inFlight: Exchange | null };

type Store = {
  get: () => Snapshot;
  update: (patch: Partial<Snapshot>) => void;
  subscribe: (listener: () => void) => () => void;
  ask: (command: Command) => void;
  send: (text: string) => boolean;
  stop: () => void;
  discard: () => void;
};

const NOTHING_YET: Snapshot = { thread: [], homeMounted: false, inFlight: null };

// The history entry's own keys (Next's and the thread's) are kept when the thread is written into it.
function keptState(state: unknown): object {
  return typeof state === "object" && state !== null ? state : {};
}

// The thread is read by React through useSyncExternalStore. Event handlers and effects write to it, so
// nothing copies it into state from an effect (CODING § 4). One request runs at a time: `running` is the
// controller of the answer that is streaming, and only that answer may write to the store.
function createStore(commands: readonly Command[]): Store {
  let snapshot = NOTHING_YET;
  let running: AbortController | undefined;
  const listeners = new Set<() => void>();

  function update(patch: Partial<Snapshot>) {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  }

  // Writes a finished exchange into the current history entry, so Back returns to it, then into the thread.
  function commit(exchange: Exchange) {
    running = undefined;
    const thread = [...snapshot.thread, exchange];
    window.history.replaceState(
      { ...keptState(window.history.state), ...historyState(thread) },
      "",
    );
    update({ thread, inFlight: null });
  }

  // Stops the running answer. Its text so far is kept, with no links, follow-ups or error line.
  function stop() {
    const current = snapshot.inFlight;
    if (running === undefined || current === null) return;
    running.abort();
    commit({ question: current.question, answer: current.answer, links: [], followups: [] });
  }

  // Drops the running answer without keeping it. Back does this, since the entry it belonged to is left.
  function discard() {
    if (running === undefined) return;
    running.abort();
    running = undefined;
    update({ inFlight: null });
  }

  async function run(controller: AbortController, question: string, messages: RequestMessage[]) {
    let exchange: Exchange = { question, answer: "", links: [], followups: [] };
    for await (const event of streamAnswer({ messages, signal: controller.signal })) {
      if (running !== controller) return;
      switch (event.type) {
        case "token":
          exchange = { ...exchange, answer: exchange.answer + event.text };
          break;
        case "links":
          exchange = { ...exchange, links: event.links };
          break;
        case "followups":
          exchange = { ...exchange, followups: event.questions };
          break;
        case "done":
          commit(exchange);
          return;
        case "error":
          // The text streamed so far stays, above the error line (F4.8).
          commit({
            ...exchange,
            links: [],
            followups: [],
            error: { code: event.code, fallback: event.fallback },
          });
          return;
      }
      update({ inFlight: exchange });
    }
  }

  return {
    get: () => snapshot,
    update,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // A chip, palette or sidebar ask stops a running answer first (D-053). A plain window.history.pushState,
    // not router.push: router.push would navigate and replace the page (F2.3).
    ask(command) {
      stop();
      const thread = askedThread(snapshot.thread, command.command);
      window.history.pushState(historyState(thread), "", command.answer);
      update({ thread });
    },
    // Typed text is sent only when no answer is streaming and it isn't a command. Returns whether it was sent.
    send(text) {
      const question = text.trim();
      if (running !== undefined || question === "" || question.startsWith("/")) return false;
      const controller = new AbortController();
      running = controller;
      const messages = requestMessages(snapshot.thread, commands, question);
      update({ inFlight: { question, answer: "", links: [], followups: [] } });
      void run(controller, question, messages);
      return true;
    },
    stop,
    discard,
  };
}

type Conversation = Store & { setHomeMounted: (mounted: boolean) => void };

const ConversationContext = createContext<Conversation | null>(null);

type Props = { commands: Command[]; children: ReactNode };

// Mounted by AppShell, so every page shares one thread: the home page's chips, the sidebar (US-024) and
// the thread (US-032) read the same state.
export function ConversationProvider({ commands, children }: Props) {
  const [store] = useState(() => createStore(commands));
  const pathname = usePathname();

  // Next writes its own navigations into history.state after render, so the entry is read in an effect,
  // which runs after that write. The pathname is a dependency so every navigation re-reads it. Back stops
  // a running answer, since the entry it was written for is left.
  // Moving to another entry drops a streaming answer, since it belonged to the entry that was left (D-058).
  // This runs on the pathname change as well as on popstate, because Next's own popstate handling can stop
  // the event before this listener sees it.
  useEffect(() => {
    const sync = () => {
      store.discard();
      store.update({ thread: threadFromState(window.history.state, commands) });
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [store, commands, pathname]);

  const setHomeMounted = useCallback(
    (mounted: boolean) => store.update({ homeMounted: mounted }),
    [store],
  );

  const value = useMemo<Conversation>(
    () => ({ ...store, setHomeMounted }),
    [store, setHomeMounted],
  );
  return <ConversationContext value={value}>{children}</ConversationContext>;
}

// The thread, the answer that is streaming, whether the home page is mounted, and the actions that change them.
export function useConversation() {
  const conversation = useContext(ConversationContext);
  if (conversation === null) {
    throw new Error("useConversation must be used inside ConversationProvider");
  }
  const snapshot = useSyncExternalStore(
    conversation.subscribe,
    conversation.get,
    () => NOTHING_YET,
  );
  return {
    ...snapshot,
    ask: conversation.ask,
    send: conversation.send,
    stop: conversation.stop,
    setHomeMounted: conversation.setHomeMounted,
  };
}
