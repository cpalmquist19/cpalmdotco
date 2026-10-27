"use client";

import { useEffect, useRef } from "react";
import { Markdown } from "../markdown";
import { SpotlightCard } from "../spotlight-card";
import { CopyButton } from "./copy-button";
import type { Message } from "./types";

/** The thread: each message, the thinking and error lines, and the follow-up questions offered after a reply */
export function MessageList({
  messages,
  isSending,
  error,
  suggestions,
  onSend,
}: {
  messages: Message[];
  isSending: boolean;
  error: string | null;
  suggestions: string[];
  onSend: (text: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-live="polite"
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin] xl:flex-[1_1_0%]"
    >
      {messages.map((message, i) => (
        <div
          key={i}
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
          {/* Not offered on a reply that is still streaming in, since it would copy half a message */}
          {!(isSending && message.role === "assistant" && i === messages.length - 1) && <CopyButton text={message.content} />}
        </div>
      ))}
      {isSending && messages[messages.length - 1]?.role === "user" && (
        <p className="text-sm text-slate-400">Thinking…</p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {suggestions.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          <p className="px-1 text-sm text-[#9cc3ff]">Ask next</p>
          {suggestions.map((prompt) => (
            <SpotlightCard key={prompt} as="div" spotlightRadius={180} className="relative rounded-xl">
              <button
                type="button"
                onClick={() => onSend(prompt)}
                className="w-full rounded-xl border border-[#4f86f0]/30 bg-gradient-to-br from-[#4f86f0]/[0.12] to-[#4f86f0]/[0.04] px-4 py-2.5 text-left text-sm leading-snug text-slate-100 transition-colors hover:border-blue-400/60 hover:from-[#4f86f0]/[0.2] hover:to-[#4f86f0]/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                {prompt}
              </button>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
