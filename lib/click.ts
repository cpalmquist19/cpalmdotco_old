type ClickLike = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

// A plain primary-button click is the only one the site answers itself. A middle click or a click with a
// modifier key is left to the browser, so "open in a new tab" still works on a link that asks in the chat.
export function isPlainClick(event: ClickLike): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
