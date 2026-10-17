"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { ModelPicker } from "./model-picker";

const CHAT_PROMPTS = [
  "Tell me about your experience with AI and testing.",
  "What technologies do you work with?",
];

type Message = { role: "user" | "assistant"; content: string };

// ready: idle loop · receive: plays once when a message is submitted · send: loops while the reply streams in
type VideoMode = "ready" | "receive" | "send";

const VIDEO_SRC: Record<VideoMode, string> = {
  ready: "/beame/beam-e-ready-opt.mp4",
  receive: "/beame/beam-e-receive-data-opt.mp4",
  send: "/beame/beam-e-send-data-opt.mp4",
};

/**
 * Chat card for the home page. Same behaviour as `chat-card.tsx` (used by /old);
 * both talk to the same /api/chat route, only the presentation differs.
 */
export function ChatPanel({ className = "" }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<VideoMode>("ready");
  const [videoFailed, setVideoFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Grow the text area with its content (up to its max-height), and shrink it back after sending
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // On desktop, keep the cursor in the box (on load and after each reply). Skipped on touch layouts so the keyboard doesn't pop up unasked
  useEffect(() => {
    if (!isSending && window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isSending]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || isSending) return;

    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setError(null);
    setIsSending(true);
    setVideoMode("receive");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        // The first chunk means the reply is streaming, so switch to the send clip and show the reply bubble
        setVideoMode("send");
        setMessages([...next, { role: "assistant", content: reply }]);
      }
      reply += decoder.decode();
      if (!reply.trim()) throw new Error("Something went wrong.");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      // Stopping on purpose isn't an error: whatever reply already streamed in stays on screen
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      abortRef.current = null;
      setIsSending(false);
      setVideoMode("ready");
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const canSend = draft.trim().length > 0;

  return (
    <aside
      id="chat"
      aria-label="Ask me about Caleb"
      className={`relative mx-auto flex h-[clamp(34rem,calc(100dvh_-_8rem),47rem)] w-full max-w-[34rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e1428]/85 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl xl:max-w-none ${className}`}
    >
      {/* The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame */}
      <div className={`relative aspect-[1.78] shrink-0 overflow-hidden xl:aspect-auto xl:min-h-[8rem] xl:shrink ${messages.length > 0 ? "xl:flex-[0.7_1_0%]" : "xl:flex-[1.3_1_0%]"} bg-[#0a0f20] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)]`}>
        <Image
          src={asset("/beame/BEAM-E.jpg")}
          alt=""
          fill
          sizes="(min-width: 1280px) 540px, (min-width: 544px) 544px, 100vw"
          className="object-cover object-[50%_35%]"
        />
        <video
          aria-hidden="true"
          src={asset(VIDEO_SRC[videoMode])}
          autoPlay
          muted
          playsInline
          loop={videoMode !== "receive"}
          onLoadedData={() => setVideoFailed(false)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 size-full object-cover object-[50%_35%] transition-opacity duration-300 ${
            videoFailed ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Fade into the card body so the video doesn't end on a hard edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0e1428] to-transparent"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur-md">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {isSending ? "Responding…" : "Online"}
        </span>
      </div>

      <header className="flex shrink-0 items-center gap-3.5 border-b border-white/10 px-5 pb-4 pt-1">
        <div className="size-11 shrink-0 overflow-hidden rounded-full bg-slate-700 ring-2 ring-white/10">
          <Image
            src={asset("/beame/BEAM-E-avatar.jpg")}
            alt="BEAM-E"
            width={160}
            height={160}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-white">
            Ask me about Caleb
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            BEAM-E, an AI assistant that answers from Caleb&rsquo;s work
          </p>
        </div>
      </header>

      {messages.length > 0 ? (
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 xl:flex-[1_1_0%]"
        >
          {messages.map((message, i) => (
            <div
              key={i}
              className={
                message.role === "user"
                  ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-500/25 px-4 py-2.5 text-[15px] leading-relaxed text-slate-50"
                  : "max-w-[85%] self-start whitespace-pre-wrap rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.06] px-4 py-2.5 text-[15px] leading-relaxed text-slate-200"
              }
            >
              {message.content}
            </div>
          ))}
          {isSending && messages[messages.length - 1]?.role === "user" && (
            <p className="text-sm text-slate-400">Thinking…</p>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-5 py-4 xl:flex-[1_1_0%] xl:py-3">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Try asking
          </p>
          {CHAT_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => send(prompt)}
              disabled={isSending}
              className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-[15px] leading-snug text-slate-100 transition-colors hover:border-blue-400/40 hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
            >
              <span>{prompt}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 shrink-0 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-blue-300"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <form
        className="shrink-0 px-4 pb-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        {/* Composer: the text area gets the full width on top, with the model picker and send button in a toolbar underneath */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="cursor-text rounded-2xl border border-[#a78bfa]/40 bg-white/[0.06] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[#a78bfa]/80 focus-within:bg-white/[0.09] focus-within:shadow-[0_0_0_3px_rgba(167,139,250,0.18),0_0_24px_rgba(167,139,250,0.25)]"
        >
          <textarea
            ref={inputRef}
            rows={2}
            placeholder="Ask me anything about my work…"
            aria-label="Type a question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a new line
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send(draft);
              }
            }}
            disabled={isSending}
            className="block max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-base leading-snug text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <div
            className="flex items-center justify-between gap-2 p-2 pt-0"
            onClick={(event) => event.stopPropagation()}
          >
            <ModelPicker />
            {isSending ? (
              // While a reply is in progress the button becomes a stop button that cancels the stream
              <button
                type="button"
                aria-label="Stop"
                onClick={stop}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 text-white transition-colors duration-150 hover:bg-red-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!canSend}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-150 hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-slate-500">
          AI-generated from Caleb&rsquo;s work. It can make mistakes.
        </p>
      </form>
    </aside>
  );
}
