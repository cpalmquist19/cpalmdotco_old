"use client";

import { useConversation } from "@/components/chat/ConversationProvider";

type Props = { question: string };

// A follow-up question under an answer (F4.4). A click sends it as the visitor's own question. It stops an
// answer that is still streaming first, as a chip does (D-053), so the click is never lost.
export function FollowupChip({ question }: Props) {
  const { send, stop } = useConversation();

  return (
    <button
      type="button"
      onClick={() => {
        stop();
        send(question);
      }}
      className="inline-flex min-h-10 items-center rounded-pill border border-border px-4 py-2 text-left text-sm text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      {question}
    </button>
  );
}
