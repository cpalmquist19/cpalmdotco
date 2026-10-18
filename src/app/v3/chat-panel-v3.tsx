"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { MAX_USER_CHARS, checkMessage } from "@/lib/chat-guard";
import { Markdown } from "../markdown";
import { ModelPicker } from "../model-picker";

const CHAT_PROMPTS = [
  "Walk me through Relay's evaluation harness.",
  "How did you measure Ticket Radar's performance?",
  "Show me an experiment from Quark and what you learned.",
];

const CAPABILITIES = [
  "Project details and technical implementation",
  "Design decisions and trade-offs",
  "Results, metrics, and evaluation methods",
  "Links to code and relevant pages",
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
 * Preview of the redesigned chat card, shown at /v3. Same behaviour as `chat-panel.tsx`
 * (the card on the home page); both talk to the same /api/chat route, only the layout
 * and styling differ.
 */
export function ChatPanelV3({ className = "" }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Why the last message was refused before or by the server; shown above the composer, with the draft kept
  const [notice, setNotice] = useState<string | null>(null);
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

    // Same screening the server runs. A blocked message never leaves the browser, and the draft stays so it can be reworded
    const verdict = checkMessage(content);
    if (!verdict.ok) {
      setNotice(verdict.message);
      return;
    }
    setNotice(null);

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
        if (data?.blocked) {
          // The server refused it (blocked content or a rate limit): take it back out of the thread so it isn't resent, and keep the draft
          setMessages(messages);
          setDraft(content);
          setNotice(data.error ?? "That message couldn't be sent.");
          return;
        }
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
  const hasMessages = messages.length > 0;

  return (
    <aside
      id="chat"
      aria-label="Ask me about Caleb"
      className={`relative mx-auto flex w-full max-w-[34rem] flex-col overflow-hidden rounded-[1.75rem] border border-[#9cc3ff]/20 bg-[#0a1226]/90 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl xl:max-h-full xl:max-w-none ${hasMessages ? "xl:h-full" : ""} ${className}`}
    >
      {/* The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#0a0f20] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)] xl:min-h-[5.5rem] xl:shrink ${
          hasMessages ? "aspect-[3] sm:aspect-[3.4]" : "aspect-[2.05]"
        }`}
      >
        <Image
          src={asset("/beame/BEAM-E.jpg")}
          alt=""
          fill
          sizes="(min-width: 1280px) 540px, (min-width: 544px) 544px, 100vw"
          className="object-cover object-[50%_55%]"
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
          className={`absolute inset-0 size-full object-cover object-[50%_55%] transition-opacity duration-300 ${
            videoFailed ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Fade into the card body so the video doesn't end on a hard edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0a1226] to-transparent"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#9cc3ff]/20 bg-[#070b1a]/70 px-3.5 py-1.5 text-sm font-medium text-slate-100 backdrop-blur-md">
          <span aria-hidden="true" className="relative flex size-2.5">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          {isSending ? "Responding…" : "Online"}
        </span>
      </div>

      <header className="flex shrink-0 items-center gap-4 px-6 pb-5 pt-4 xl:[@media(max-height:1000px)]:pb-4 xl:[@media(max-height:940px)]:pb-3 xl:[@media(max-height:940px)]:pt-3">
        <div className="size-[4.5rem] shrink-0 overflow-hidden rounded-full bg-slate-700 ring-1 ring-[#9cc3ff]/30 xl:[@media(max-height:940px)]:size-14">
          <Image
            src={asset("/beame/BEAM-E-avatar.jpg")}
            alt="BEAM-E"
            width={160}
            height={160}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-white">
            Ask me about Caleb
          </h2>
          <p className="mt-1 text-[15px] leading-snug text-[#9fb0cc] xl:[@media(max-height:940px)]:text-sm">
            I can explain my projects, technical decisions, trade-offs, and point you to evidence.
          </p>
        </div>
      </header>

      <hr className="mx-6 shrink-0 border-t border-white/10" />

      {hasMessages ? (
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          className="flex h-[22rem] min-h-0 flex-col gap-3 overflow-y-auto px-6 py-5 xl:h-auto xl:flex-[1_1_22rem]"
        >
          {messages.map((message, i) => (
            <div
              key={i}
              className={
                message.role === "user"
                  ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-500/25 px-4 py-2.5 text-[15px] leading-relaxed text-slate-50"
                  : "max-w-[85%] self-start rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.06] px-4 py-2.5 text-[15px] leading-relaxed text-slate-200"
              }
            >
              {message.role === "user" ? message.content : <Markdown text={message.content} />}
            </div>
          ))}
          {isSending && messages[messages.length - 1]?.role === "user" && (
            <p className="text-sm text-slate-400">Thinking…</p>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      ) : (
        <>
          <section aria-labelledby="v3-try-asking" className="shrink-0 px-6 py-5 xl:[@media(max-height:1000px)]:py-4 xl:[@media(max-height:940px)]:py-3">
            <h3 id="v3-try-asking" className="mb-3 text-lg font-medium text-slate-200 xl:[@media(max-height:940px)]:mb-2 xl:[@media(max-height:940px)]:text-base">
              Try asking
            </h3>
            <ul className="flex flex-col gap-2.5 xl:[@media(max-height:940px)]:gap-2">
              {CHAT_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => send(prompt)}
                    disabled={isSending}
                    className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[#9cc3ff]/20 bg-[#101c3b]/50 px-5 py-3.5 xl:[@media(max-height:1000px)]:py-3 xl:[@media(max-height:940px)]:py-2.5 text-left text-[15px] leading-snug text-slate-100 transition-colors hover:border-blue-400/50 hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
                  >
                    <span>{prompt}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-300"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <hr className="mx-6 shrink-0 border-t border-white/10 xl:[@media(max-height:870px)]:hidden" />

          <section aria-labelledby="v3-can-help" className="shrink-0 px-6 py-5 xl:[@media(max-height:1000px)]:py-4 xl:[@media(max-height:940px)]:py-3 xl:[@media(max-height:870px)]:hidden">
            <h3 id="v3-can-help" className="mb-3 text-lg font-medium text-slate-200 xl:[@media(max-height:940px)]:mb-2 xl:[@media(max-height:940px)]:text-base">
              What I can help with
            </h3>
            <ul className="flex flex-col gap-2.5 xl:[@media(max-height:1000px)]:gap-2 xl:[@media(max-height:940px)]:gap-1.5">
              {CAPABILITIES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-slate-200">
                  <svg viewBox="0 0 24 24" className="size-[1.375rem] shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" className="fill-blue-500/90" />
                    <path
                      d="M7.5 12.5l3 3 6-6.5"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <hr className="mx-6 shrink-0 border-t border-white/10" />

      <form
        className="shrink-0 px-6 py-5 xl:[@media(max-height:1000px)]:py-4 xl:[@media(max-height:940px)]:py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        {notice && (
          <p role="alert" className="mb-2 px-1 text-sm text-amber-300">
            {notice}
          </p>
        )}
        {/* Composer: the question and round send button share the first row, with the model chip underneath */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="cursor-text rounded-2xl border border-[#9cc3ff]/25 bg-[#0d1a3a]/60 transition-[border-color,box-shadow] duration-200 focus-within:border-blue-400/70 focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.18)]"
        >
          <div className="flex items-start gap-3 p-3 pb-2 pl-5">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask a question about my work…"
              aria-label="Type a question"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setNotice(null);
              }}
              maxLength={MAX_USER_CHARS}
              onKeyDown={(event) => {
                // Enter sends, Shift+Enter adds a new line
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
              disabled={isSending}
              className="block max-h-40 min-h-12 min-w-0 flex-1 resize-none bg-transparent py-3 xl:[@media(max-height:940px)]:min-h-10 xl:[@media(max-height:940px)]:py-2 text-base leading-6 text-slate-100 placeholder:text-[#7f93b5] focus:outline-none disabled:opacity-50"
            />
            {isSending ? (
              // While a reply is in progress the button becomes a stop button that cancels the stream
              <button
                type="button"
                aria-label="Stop"
                onClick={stop}
                className="flex size-12 xl:[@media(max-height:940px)]:size-10 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 text-white transition-colors duration-150 hover:bg-red-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!canSend}
                className="flex size-12 xl:[@media(max-height:940px)]:size-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-colors duration-150 hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:bg-[#33425f] disabled:text-slate-200 disabled:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
          <div className="px-3 pb-3" onClick={(event) => event.stopPropagation()}>
            <ModelPicker variant="chip" />
          </div>
        </div>
        <p className="mx-auto mt-3.5 xl:[@media(max-height:940px)]:mt-2 max-w-[24rem] text-center text-xs leading-relaxed text-slate-400">
          Responses are based on my portfolio content and may include links to specific projects.
        </p>
      </form>
    </aside>
  );
}
