"use client";

import { useEffect, useState } from "react";
import { useConversation } from "@/components/chat/ConversationProvider";
import { Message } from "@/components/chat/Message";
import { ChipRow } from "@/components/chips/ChipRow";
import { PillInput } from "@/components/hero/PillInput";
import { RotatingHeadline } from "@/components/hero/RotatingHeadline";
import { useCommandPalette } from "@/components/palette/useCommandPalette";
import { messagesFor } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

type Props = { greeting: string; pool: string[]; commands: Command[] };

// The home page's top half: the headline, the input, the chips and the thread. The headline stops while
// the input has focus, and once a chip has started a conversation (F1.4).
export function HomeHero({ greeting, pool, commands }: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  const { thread, homeMounted, setHomeMounted } = useConversation();
  // The palette lists every command, chip or not (F3.2), while the chips show only the chip entries.
  const { inputRef, input, palette, openPalette } = useCommandPalette(commands);

  // Runs after hydration, so the skip link (F1.7) and the chip rise-in (D-033) wait for the page to be interactive.
  useEffect(() => {
    setHomeMounted(true);
    return () => setHomeMounted(false);
  }, [setHomeMounted]);

  const chips = commands.filter((command) => command.chip);
  const messages = messagesFor(thread, commands);

  return (
    <div>
      <RotatingHeadline
        greeting={greeting}
        pool={pool}
        paused={inputFocused || thread.length > 0}
      />
      <div className="mt-8 max-w-2xl">
        <PillInput
          onFocusChange={setInputFocused}
          inputRef={inputRef}
          input={input}
          palette={palette}
        />
        <ChipRow commands={chips} revealed={homeMounted} onMore={openPalette} />
      </div>
      {/* Always rendered: a live region has to exist before its content changes for a screen reader to announce it. */}
      <div aria-live="polite" data-testid="thread" className="mt-8 max-w-2xl space-y-6">
        {messages.map((message, index) => (
          <Message
            key={`${index}-${message.role}-${message.command.command}`}
            role={message.role}
            command={message.command}
          />
        ))}
      </div>
    </div>
  );
}
