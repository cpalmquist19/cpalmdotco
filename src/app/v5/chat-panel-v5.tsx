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
 * Chat card for /v5. Same behaviour as `chat-panel-v3.tsx` (both talk to /api/chat); the
 * layout is sized in rem so it scales with the viewport, matching the page's fit-to-screen design.
 */
export function ChatPanelV5() {
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

  // Grow the text area with its content (up to its max-height), and shrink it back after sending.
  // The pixel height is recomputed on resize because the page scales with the window (rem changes).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    function fit() {
      if (!el) return;
      el.style.height = "";
      // An empty box keeps its CSS min-height; only grow when there is text to fit
      if (el.value) el.style.height = `${el.scrollHeight}px`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
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
      className="relative mx-auto flex w-full max-w-[34rem] flex-col overflow-hidden rounded-[1.5rem] border border-[#4f86f0]/30 bg-[#070f27]/90 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl desk:mx-0 desk:h-full desk:max-w-none"
    >
      {/* The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#0a0f20] ${
          hasMessages ? "aspect-[3.4] desk:aspect-auto desk:h-[8.5rem]" : "aspect-[2.07]"
        }`}
      >
        <Image
          src={asset("/beame/BEAM-E.jpg")}
          alt=""
          fill
          sizes="(min-width: 1100px) 480px, 100vw"
          className="object-cover object-[50%_28%]"
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
          className={`absolute inset-0 size-full object-cover object-[50%_28%] transition-opacity duration-300 ${
            videoFailed ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-[#070f27] to-transparent"
        />
        <span className="absolute left-[1rem] top-[0.8rem] inline-flex h-[1.95rem] items-center gap-[0.5rem] rounded-full border border-white/15 bg-[#050b1e]/75 px-[0.8rem] text-[0.875rem] font-medium text-slate-100 backdrop-blur-md">
          <span aria-hidden="true" className="relative flex size-[0.6rem]">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-[0.6rem] rounded-full bg-emerald-400" />
          </span>
          {isSending ? "Responding…" : "Online"}
        </span>
      </div>

      <header className="flex shrink-0 items-start gap-[1.1rem] px-[1.3rem] pb-[1.3rem] pt-[0.15rem]">
        <div className="size-[3.9rem] shrink-0 overflow-hidden rounded-full bg-slate-700 ring-1 ring-[#4f86f0]/40">
          <Image
            src={asset("/beame/BEAM-E-avatar.jpg")}
            alt="BEAM-E"
            width={160}
            height={160}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 pt-[0.6rem]">
          <h2 className="text-[1.25rem] font-semibold leading-tight tracking-tight text-white">
            Ask me about Caleb
          </h2>
          <p className="mt-[0.2rem] text-[0.94rem] leading-[1.4] text-[#9fb0cc]">
            I can explain my projects, technical decisions, trade-offs, and point you to evidence.
          </p>
        </div>
      </header>

      <hr className="mx-[1.3rem] shrink-0 border-t border-white/10" />

      {hasMessages ? (
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          className="flex h-[22rem] min-h-0 flex-col gap-[0.75rem] overflow-y-auto px-[1.3rem] py-[1.1rem] desk:h-auto desk:flex-1"
        >
          {messages.map((message, i) => (
            <div
              key={i}
              className={
                message.role === "user"
                  ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-500/25 px-[1rem] py-[0.6rem] text-[0.94rem] leading-relaxed text-slate-50"
                  : "max-w-[85%] self-start rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.06] px-[1rem] py-[0.6rem] text-[0.94rem] leading-relaxed text-slate-200"
              }
            >
              {message.role === "user" ? message.content : <Markdown text={message.content} />}
            </div>
          ))}
          {isSending && messages[messages.length - 1]?.role === "user" && (
            <p className="text-[0.875rem] text-slate-400">Thinking…</p>
          )}
          {error && <p className="text-[0.875rem] text-red-300">{error}</p>}
        </div>
      ) : (
        <>
          <section
            aria-labelledby="v5-try-asking"
            className="flex shrink-0 flex-col justify-center px-[1.3rem] pb-[1.35rem] pt-[1rem] desk:flex-auto"
          >
            <h3 id="v5-try-asking" className="mb-[0.7rem] text-[1.03rem] font-medium text-slate-100">
              Try asking
            </h3>
            <ul className="flex flex-col gap-[0.72rem]">
              {CHAT_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => send(prompt)}
                    disabled={isSending}
                    className="group flex h-[2.8rem] w-full items-center justify-between gap-[1rem] rounded-[0.65rem] border border-[#4f86f0]/25 bg-[#10204a]/45 px-[1.1rem] text-left text-[0.85rem] leading-snug text-slate-100 transition-colors hover:border-blue-400/60 hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
                  >
                    <span className="truncate">{prompt}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-[1rem] shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-300"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <hr className="mx-[1.3rem] shrink-0 border-t border-white/10" />

          <section
            aria-labelledby="v5-can-help"
            className="flex shrink-0 flex-col justify-center px-[1.3rem] pb-[1.1rem] pt-[0.85rem] desk:flex-auto"
          >
            <h3 id="v5-can-help" className="mb-[0.65rem] text-[1rem] font-medium text-slate-200">
              What I can help with
            </h3>
            <ul className="flex flex-col gap-[0.5rem]">
              {CAPABILITIES.map((item) => (
                <li key={item} className="flex items-center gap-[0.7rem] text-[0.9rem] leading-[1.2rem] text-slate-200">
                  <svg viewBox="0 0 24 24" className="size-[1rem] shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" className="fill-blue-500/20 stroke-blue-400" strokeWidth="1.6" />
                    <path
                      d="M7.5 12.5l3 3 6-6.5"
                      fill="none"
                      stroke="#7fb0ff"
                      strokeWidth="2.4"
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

      <form
        className="shrink-0 px-[1.3rem] pb-[1.45rem] pt-[0.25rem]"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        {notice && (
          <p role="alert" className="mb-[0.5rem] px-1 text-[0.875rem] text-amber-300">
            {notice}
          </p>
        )}
        {/* Composer: the question and round send button share the first row, with the model chip underneath */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="cursor-text rounded-[0.75rem] border border-[#4f86f0]/30 bg-[#0b1738]/70 transition-[border-color,box-shadow] duration-200 focus-within:border-blue-400/70 focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.18)]"
        >
          <div className="flex items-start gap-[0.75rem] pl-[1.05rem] pr-[0.55rem] pt-[0.75rem]">
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
              className="block max-h-[8rem] min-h-[2.4rem] min-w-0 flex-1 resize-none bg-transparent py-[0.5rem] text-[0.9rem] leading-[1.4rem] text-slate-100 placeholder:text-[#7f93b5] focus:outline-none disabled:opacity-50"
            />
            {isSending ? (
              // While a reply is in progress the button becomes a stop button that cancels the stream
              <button
                type="button"
                aria-label="Stop"
                onClick={stop}
                className="flex size-[2.4rem] shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 text-white transition-colors duration-150 hover:bg-red-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-[0.9rem]" aria-hidden="true">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!canSend}
                className="flex size-[2.4rem] shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-colors duration-150 hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:bg-[#5a6987] disabled:text-white disabled:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-[1.1rem]"
                  aria-hidden="true"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
          <div className="px-[0.95rem] pb-[0.55rem]" onClick={(event) => event.stopPropagation()}>
            <ModelPicker variant="mini" />
          </div>
        </div>
        <p className="mx-auto mt-[0.65rem] max-w-[21rem] text-center text-[0.69rem] leading-[1.45] text-[#7587a8]">
          Responses are based on my portfolio content and may include links to specific projects.
        </p>
      </form>
    </aside>
  );
}
