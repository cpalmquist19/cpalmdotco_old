import type { ChatErrorCode } from "@/lib/chat-client";

// The one friendly line for each failure (F4.8). Plain words: no vendor, no status code, no stack.
const LINES: Record<ChatErrorCode, string> = {
  rate_limited: "You've asked a lot in a short time. Please wait a minute and try again.",
  timeout: "That answer took too long. Please try again.",
  upstream: "I can't answer right now. Please try again later.",
};

export function errorLine(code: ChatErrorCode): string {
  return LINES[code];
}

// The link after the line, to the page the error points to. It is named after that page when one matches.
export function fallbackLinkText(label: string | undefined, href: string): string {
  return label === undefined ? `Go to ${href}` : `Go to the ${label} page`;
}
