import Link from "next/link";
import { FollowupChip } from "@/components/chat/FollowupChip";
import { Avatar } from "@/components/shell/Avatar";
import { Caret } from "@/components/ui/Caret";
import { Markdown } from "@/components/ui/Markdown";
import { errorLine, fallbackLinkText } from "@/lib/chat-errors";
import type { Exchange, ThreadMessage } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

type Props = { message: ThreadMessage; commands: readonly Command[]; streaming?: boolean };

const LINK_CLASS =
  "rounded-sm text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

// One message of the thread. A visitor's message is a bubble on the right. A command's answer is its intro (or its
// description, when it has no intro) with a link to the page (D-032). A free-text answer is Markdown with its
// links, follow-ups and error line (F4.2 to F4.4, F4.8). This is the one place each form is chosen.
export function Message({ message, commands, streaming = false }: Props) {
  if ("text" in message) return <VisitorBubble text={message.text} />;
  if ("exchange" in message) {
    return <ExchangeAnswer exchange={message.exchange} commands={commands} streaming={streaming} />;
  }
  if (message.role === "visitor") return <VisitorBubble text={message.command.label} />;
  return <CommandAnswer command={message.command} />;
}

function VisitorBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p
        data-testid="visitor-message"
        className="max-w-md rounded-box bg-surface px-4 py-2 whitespace-pre-wrap text-text"
      >
        {text}
      </p>
    </div>
  );
}

function CommandAnswer({ command }: { command: Command }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="min-w-0 pt-1">
        <p className="leading-7 text-text">{command.intro ?? command.description}</p>
        <p className="mt-2">
          <Link href={command.answer} className={LINK_CLASS}>
            {command.label}
          </Link>
        </p>
      </div>
    </div>
  );
}

// A stopped answer with no text has nothing to show, so it's left out. While streaming, the caret shows even
// before the first character (F4.1, F4.2).
function ExchangeAnswer({
  exchange,
  commands,
  streaming,
}: {
  exchange: Exchange;
  commands: readonly Command[];
  streaming: boolean;
}) {
  const { answer, links, followups, error } = exchange;
  if (!streaming && answer === "" && links.length === 0 && error === undefined) return null;
  const errorLabel = commands.find((command) => command.answer === error?.fallback)?.label;

  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 pt-1">
        {answer !== "" ? <Markdown>{answer}</Markdown> : null}
        {streaming ? <Caret /> : null}
        {error !== undefined ? (
          <p className="mt-4 leading-7 text-text">
            {errorLine(error.code)}{" "}
            <Link href={error.fallback} className={LINK_CLASS}>
              {fallbackLinkText(errorLabel, error.fallback)}
            </Link>
          </p>
        ) : null}
        {links.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {followups.length > 0 ? (
          <ul aria-label="Follow-up questions" className="mt-4 flex flex-wrap gap-2">
            {followups.map((question) => (
              <li key={question}>
                <FollowupChip question={question} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
