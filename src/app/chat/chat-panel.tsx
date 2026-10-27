"use client";

import { ChatHeader } from "./chat-header";
import { ChatVideo } from "./chat-video";
import { Composer } from "./composer";
import { followUps } from "./follow-ups";
import { MessageList } from "./message-list";
import { StarterPrompts } from "./starter-prompts";
import { useChat } from "./use-chat";

/** The BEAM-E chat card. Talks to /api/chat and keeps the thread in the browser. */
export function ChatPanel({ className = "" }: { className?: string }) {
  const chat = useChat();

  const showFollowUps = !chat.isSending && !chat.error && chat.messages[chat.messages.length - 1]?.role === "assistant";
  const suggestions = showFollowUps ? followUps(chat.messages) : [];

  return (
    <aside
      id="chat"
      aria-label="Ask me about Caleb"
      className={`relative mx-auto flex h-[clamp(36rem,calc(100dvh_-_8rem),47rem)] w-full md:max-xl:h-[clamp(38rem,calc(100dvh_-_6rem),50rem)] max-w-[34rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e1428]/85 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl xl:max-w-none ${className}`}
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -8px rgba(59,130,246,0.35)" }}
    >
      <ChatVideo phase={chat.phase} />
      <ChatHeader />

      {chat.messages.length > 0 ? (
        <MessageList
          messages={chat.messages}
          isSending={chat.isSending}
          error={chat.error}
          suggestions={suggestions}
          onSend={chat.send}
        />
      ) : (
        <StarterPrompts onSend={chat.send} disabled={chat.isSending} />
      )}

      <Composer
        draft={chat.draft}
        notice={chat.notice}
        isSending={chat.isSending}
        modelId={chat.modelId}
        onDraftChange={chat.changeDraft}
        onModelChange={chat.setModelId}
        onSend={chat.send}
        onStop={chat.stop}
      />
    </aside>
  );
}
