import { Message } from "@/components/chat/Message";
import { messagesFor, type Exchange, type Turn } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

type Props = { thread: Turn[]; inFlight: Exchange | null; commands: Command[] };

// The conversation below the input. Finished turns sit in an aria-live region, so each answer is announced once,
// whole (F4.7). The answer that is still streaming sits beside that region, hidden from assistive technology, so
// no half-written text is announced.
export function Thread({ thread, inFlight, commands }: Props) {
  return (
    <>
      {/* Always rendered: a live region has to exist before its content changes for a screen reader to announce it. */}
      <div aria-live="polite" data-testid="thread" className="mt-8 max-w-2xl space-y-6">
        {messagesFor(thread, commands).map((message, index) => (
          <Message key={index} message={message} commands={commands} />
        ))}
      </div>
      {inFlight !== null ? (
        // The test id is for the tests only: this wrapper has no role or name, and the caret is shared with the headline.
        <div aria-hidden="true" data-testid="in-flight" className="mt-6 max-w-2xl space-y-6">
          <Message message={{ role: "visitor", text: inFlight.question }} commands={commands} />
          <Message message={{ role: "bot", exchange: inFlight }} commands={commands} streaming />
        </div>
      ) : null}
    </>
  );
}
