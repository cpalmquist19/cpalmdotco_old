"use client";

import { useEffect, useState } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { useConversation } from "@/components/chat/ConversationProvider";
import { Thread } from "@/components/chat/Thread";
import { ChipRow } from "@/components/chips/ChipRow";
import { RotatingHeadline } from "@/components/hero/RotatingHeadline";
import { useCommandPalette } from "@/components/palette/useCommandPalette";
import type { Command } from "@/lib/content-schemas";

type Props = { greeting: string; pool: string[]; commands: Command[] };

// The home page's top half: the headline, the input, the chips and the thread. The headline stops while
// the input has focus, and once a conversation has started, by a chip or by a typed question (F1.4, D-039).
// Once it has started, the input moves below the thread and pins to the bottom of the screen (F4.5, D-052).
// The column is a flex column, so that move is only an `order` change and the input element never remounts.
export function HomeHero({ greeting, pool, commands }: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  const { thread, inFlight, homeMounted, setHomeMounted, send } = useConversation();
  // The palette lists every command, chip or not (F3.2), while the chips show only the chip entries.
  const { inputRef, input, palette, openPalette, clear } = useCommandPalette(commands);

  // Runs after hydration, so the skip link (F1.7) and the chip rise-in (D-033) wait for the page to be interactive.
  useEffect(() => {
    setHomeMounted(true);
    return () => setHomeMounted(false);
  }, [setHomeMounted]);

  const chips = commands.filter((command) => command.chip);
  const started = thread.length > 0 || inFlight !== null;

  // The column is at least a screen tall once the conversation has started, so the pinned input sits at the bottom
  // of the screen even when the thread is short.
  return (
    <div className={`flex flex-col ${started ? "min-h-dvh" : ""}`}>
      <RotatingHeadline greeting={greeting} pool={pool} paused={inputFocused || started} />
      <ChatInput
        inputRef={inputRef}
        input={input}
        palette={palette}
        streaming={inFlight !== null}
        pinned={started}
        onFocusChange={setInputFocused}
        onSend={send}
        onCleared={clear}
      />
      <div className="max-w-2xl">
        <ChipRow commands={chips} revealed={homeMounted} onMore={openPalette} />
      </div>
      <Thread thread={thread} inFlight={inFlight} commands={commands} />
    </div>
  );
}
