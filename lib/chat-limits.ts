// The chat's limits (Guardrails). Plain numbers with no imports, so client code can read the input cap too.

// The most characters a visitor's message may have, and so the most the input accepts (US-032).
export const MAX_INPUT_CHARS = 500;
// The most characters a past answer may have when it's sent back to the model.
export const MAX_ASSISTANT_CHARS = 2500;
// Allowed requests per client, in a minute and in a day (D-045).
export const RATE_LIMIT_PER_MINUTE = 10;
export const RATE_LIMIT_PER_DAY = 60;
// How long an answer may take before it ends with a timeout error.
export const ANSWER_TIMEOUT_MS = 20_000;

// The counter appears once a visitor's message is longer than this, so it shows after 400 characters (F4.9).
export const INPUT_COUNTER_FROM = 400;

// Whether the input's counter shows for a message of this length (F4.9).
export function counterShown(length: number): boolean {
  return length > INPUT_COUNTER_FROM;
}

// How many characters a visitor's message may still grow by. Never below zero (F4.9).
export function remainingChars(length: number): number {
  return Math.max(0, MAX_INPUT_CHARS - length);
}
