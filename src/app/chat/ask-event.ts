// A button elsewhere on the page (a project card) asking BEAM-E a question. The cards and the chat are siblings in the
// shell, and the chat owns the conversation, so they talk through a window event: the chat listens, the button sends

const ASK_EVENT = "beame:ask";

export function askBeame(question: string) {
  window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: question }));
}

/** Calls `onAsk` with each question a button sends. Returns what removes the listener */
export function listenForQuestions(onAsk: (question: string) => void) {
  const listener = (event: Event) => onAsk((event as CustomEvent<string>).detail);
  window.addEventListener(ASK_EVENT, listener);
  return () => window.removeEventListener(ASK_EVENT, listener);
}
