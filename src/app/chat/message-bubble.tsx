import { memo } from "react";
import { Markdown } from "../markdown";
import { CopyButton } from "./copy-button";
import type { Message } from "./types";

/**
 * One message and its copy button. Memoized so a reply streaming in only re-renders its own bubble: the messages
 * above it keep the same object, so React skips them and their Markdown isn't parsed again.
 */
export const MessageBubble = memo(function MessageBubble({ message, showCopy }: { message: Message; showCopy: boolean }) {
  return (
    <div
      className={`flex max-w-[85%] flex-col gap-0.5 ${message.role === "user" ? "items-end self-end" : "items-start self-start"}`}
    >
      <div
        className={
          message.role === "user"
            ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-500/25 px-4 py-2.5 text-[15px] leading-relaxed text-slate-50"
            : "rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.06] px-4 py-2.5 text-[15px] leading-relaxed text-slate-200"
        }
      >
        {message.role === "user" ? message.content : <Markdown text={message.content} />}
      </div>
      {showCopy && <CopyButton text={message.content} />}
    </div>
  );
});
