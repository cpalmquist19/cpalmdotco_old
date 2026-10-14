// One server-sent event: an `event:` line, a `data:` line with the payload as JSON, and a blank line.
// JSON.stringify escapes newlines inside strings, so the data always stays on one line.
export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
