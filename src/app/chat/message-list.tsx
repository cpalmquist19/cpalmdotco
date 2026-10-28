"use client";

import { useEffect, useRef } from "react";
import { SpotlightCard } from "../spotlight-card";
import { MessageBubble } from "./message-bubble";
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
  const seen = useRef({ count: 0, sending: false });

  // Glide to the bottom when something is added (a message, the thinking line, the follow-ups). While a reply grows
  // line by line, jump instead: a new smooth scroll on every redraw never catches up and looks like stuttering
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const changed = messages.length !== seen.current.count || isSending !== seen.current.sending;
    seen.current = { count: messages.length, sending: isSending };
    list.scrollTo({ top: list.scrollHeight, behavior: changed ? "smooth" : "auto" });
  }, [messages, isSending]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-live="polite"
      // Screen readers wait for the reply to finish instead of reading every chunk as it arrives
      aria-busy={isSending}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 thin-scrollbar xl:flex-[1_1_0%]"
    >
      {messages.map((message, i) => (
        <MessageBubble
          key={message.id}
          message={message}
          // Not offered on a reply that is still streaming in, since it would copy half a message
          showCopy={!(isSending && message.role === "assistant" && i === messages.length - 1)}
        />
      ))}
      {isSending && messages[messages.length - 1]?.role === "user" && (
        <p className="text-sm text-slate-400">Thinking…</p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {suggestions.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          <p className="px-1 text-sm text-accent-soft">Ask next</p>
          {suggestions.map((prompt) => (
            <SpotlightCard key={prompt} as="div" spotlightRadius={180} className="relative rounded-xl">
              <button
                type="button"
                onClick={() => onSend(prompt)}
                className="w-full rounded-xl border border-accent/30 bg-gradient-to-br from-accent/[0.12] to-accent/[0.04] px-4 py-2.5 text-left text-sm leading-snug text-slate-100 transition-colors hover:border-blue-400/60 hover:from-accent/[0.2] hover:to-accent/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
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
