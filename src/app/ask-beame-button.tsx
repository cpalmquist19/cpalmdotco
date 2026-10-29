"use client";

import { askBeame } from "./chat/ask-event";
import { ChatIcon } from "./icons";
import { PILL_BUTTON } from "./panel";

/**
 * "Ask BEAM-E about ..." on a project's page, beside "View on GitHub" and styled like it. Sends the project's question
 * to the chat, like the suggestion chips do.
 */
export function AskBeameButton({ title, question }: { title: string; question: string }) {
  return (
    <button type="button" onClick={() => askBeame(question)} className={PILL_BUTTON}>
      <ChatIcon className="size-4" />
      Ask BEAM-E about {title}
    </button>
  );
}
