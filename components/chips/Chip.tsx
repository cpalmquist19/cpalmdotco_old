"use client";

import type { LucideIcon } from "lucide-react";
import type { MouseEvent } from "react";
import { useConversation } from "@/components/chat/ConversationProvider";
import { isPlainClick } from "@/lib/click";
import type { Command } from "@/lib/content-schemas";

type Props = { command: Command; Icon: LucideIcon };

// A link to the command's page, so it works with JavaScript off (F2.2). With JavaScript, a plain click asks
// the command in the thread instead (F2.3). A modified or middle click is left alone, so the browser can
// open the page in a new tab.
export function Chip({ command, Icon }: Props) {
  const { ask } = useConversation();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    ask(command);
  }

  return (
    <a
      href={command.answer}
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-pill border border-border px-4 text-sm text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {command.label}
    </a>
  );
}
