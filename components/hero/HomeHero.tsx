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

  return (
    <div>
      <RotatingHeadline
        greeting={greeting}
        pool={pool}
        paused={inputFocused || thread.length > 0 || inFlight !== null}
      />
      <div className="mt-8 max-w-2xl">
        <ChatInput
          inputRef={inputRef}
          input={input}
          palette={palette}
          streaming={inFlight !== null}
          onFocusChange={setInputFocused}
          onSend={send}
          onCleared={clear}
        />
        <ChipRow commands={chips} revealed={homeMounted} onMore={openPalette} />
      </div>
      <Thread thread={thread} inFlight={inFlight} commands={commands} />
    </div>
  );
}
