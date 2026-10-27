"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { MAX_USER_CHARS, checkMessage } from "@/lib/chat-guard";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";
import { Markdown } from "./markdown";
import { ModelPicker } from "./model-picker";
import { SpotlightCard } from "./spotlight-card";

const CHAT_PROMPTS = [
  "How does Relay's evaluation harness work?",
  "What roles is Caleb looking for?",
  "What does Relay do, and why did Caleb build it?",
  "How did Caleb go from QA to building AI systems?",
];

// Follow-up questions offered after a reply, grouped by topic. Each one must be answerable from src/content (relay.ts, quark.ts, resume.ts); check there before adding one, or the chat will answer "I don't know"
const FOLLOW_UPS = [
  {
    match: /relay|eval|harness|agent|sandbox/g,
    prompts: [
      "What does Relay's eval dashboard show?",
      "What are Relay's security trade-offs?",
      "What kinds of tasks are in Relay's eval suite?",
      "What did Caleb learn building Relay's evals?",
      "What's next for Relay?",
      "What was Caleb's role in building Relay?",
      "Why didn't Caleb use LangChain for Relay?",
    ],
  },
  {
    match: /qa|sdet|resume|experience|role|automation|ersp/g,
    prompts: [
      "What roles is Caleb looking for?",
      "What's Caleb's test automation experience?",
      "What AI projects has Caleb built besides Relay?",
    ],
  },
];

/** Up to three unasked questions: two on the topic of the latest exchange, one from another topic */
function followUps(messages: Message[]) {
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const recent = messages.slice(-2).map((m) => m.content.toLowerCase()).join(" ");
  const ranked = FOLLOW_UPS.map((topic, i) => ({ topic, i, hits: recent.match(topic.match)?.length ?? 0 }))
    .sort((a, b) => b.hits - a.hits || a.i - b.i)
    .map(({ topic }) => topic.prompts.filter((prompt) => !asked.has(prompt)));
  return [...ranked[0].slice(0, 2), ...ranked.slice(1).flatMap((prompts) => prompts.slice(0, 1))].slice(0, 3);
}

type Message = { role: "user" | "assistant"; content: string };

// ready: idle loop · receive: plays once when a message is submitted · send: loops while the reply streams in
type VideoMode = "ready" | "receive" | "send";

const VIDEO_SRC: Record<VideoMode, string> = {
  ready: "/beame/beam-e-ready-opt.mp4",
  receive: "/beame/beam-e-receive-data-opt.mp4",
  send: "/beame/beam-e-send-data-opt.mp4",
};

// The send clip starts, and restarts each time it loops, this many seconds in, skipping its slow opening
const SEND_START_SECONDS = 2;

/**
 * Copies text to the clipboard. The async Clipboard API only exists on secure pages (https or localhost),
 * so on anything else, such as the dev server opened by LAN address, fall back to a hidden text area and execCommand
 */
async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Refused (permission denied or the page isn't focused): try the fallback
  }
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  previous?.focus({ preventScroll: true });
  return ok;
}

/** Small icon button under a message that copies its text. The icon turns into a check for a moment once copied, or red if the browser refused */
function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const copied = status === "copied";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function copy() {
    setStatus((await copyText(text)) ? "copied" : "failed");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : status === "failed" ? "Couldn't copy" : "Copy message"}
      title={copied ? "Copied" : status === "failed" ? "Couldn't copy" : "Copy message"}
      className={`flex size-7 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
        copied
          ? "text-emerald-400"
          : status === "failed"
            ? "text-red-300"
            : "text-slate-500 hover:bg-white/[0.08] hover:text-slate-200"
      }`}
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
        {copied ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Chat card for the home page. Same behaviour as `chat-card.tsx` (used by /old);
 * both talk to the same /api/chat route, only the presentation differs.
 */
export function ChatPanel({ className = "" }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Why the last message was refused before or by the server; shown above the composer, with the draft kept
  const [notice, setNotice] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<VideoMode>("ready");
  const [videoFailed, setVideoFailed] = useState(false);
  // The model the picker has selected; sent with each message so the server answers with it
  const [modelId, setModelId] = useState<ModelId>(DEFAULT_MODEL_ID);
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

  // On desktop, keep the cursor in the box (on load and after each reply). Skipped on touch layouts so the keyboard doesn't pop up unasked,
  // and while a view has focus (see ViewFocus), so a view opened by its URL or during a reply keeps its [ and ] keys
  useEffect(() => {
    if (document.activeElement?.closest("[data-view]")) return;
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
        body: JSON.stringify({ messages: next, model: modelId }),
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
  const showFollowUps = !isSending && !error && messages[messages.length - 1]?.role === "assistant";
  const suggestions = showFollowUps ? followUps(messages) : [];

  return (
    <aside
      id="chat"
      aria-label="Ask me about Caleb"
      className={`relative mx-auto flex h-[clamp(36rem,calc(100dvh_-_8rem),47rem)] w-full md:max-xl:h-[clamp(38rem,calc(100dvh_-_6rem),50rem)] max-w-[34rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e1428]/85 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl xl:max-w-none ${className}`}
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -8px rgba(59,130,246,0.35)" }}
    >
      {/* The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame */}
      <div className={`relative aspect-[3.56] shrink-0 overflow-hidden max-sm:aspect-[4.2] md:max-xl:aspect-[4.4] md:max-xl:max-h-28 xl:aspect-auto xl:min-h-[4rem] xl:flex-[0.65_1_0%] xl:shrink bg-[#0a0f20] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)]`}>
        <Image
          src={asset("/beame/BEAM-E.jpg")}
          alt=""
          fill
          sizes="(min-width: 768px) 480px, 100vw"
          className="object-cover object-[50%_35%]"
        />
        <video
          aria-hidden="true"
          src={asset(VIDEO_SRC[videoMode])}
          autoPlay
          muted
          playsInline
          loop={videoMode === "ready"}
          onLoadedMetadata={(event) => {
            if (videoMode === "send") event.currentTarget.currentTime = SEND_START_SECONDS;
          }}
          onEnded={(event) => {
            // The send clip loops by hand so it comes back to the start point instead of 0:00
            if (videoMode !== "send") return;
            event.currentTarget.currentTime = SEND_START_SECONDS;
            void event.currentTarget.play();
          }}
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

      {/* Bot avatar on the left and Caleb's photo on the right, the same size, with the copy centered between them */}
      <header className="grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 border-b border-white/10 px-5 py-2.5 max-sm:grid-cols-[2.5rem_1fr]">
        <div className="size-10 overflow-hidden rounded-full bg-slate-700 ring-1 ring-[#4f86f0]/40">
          <Image
            src={asset("/beame/BEAM-E-avatar.jpg")}
            alt="BEAM-E"
            width={160}
            height={160}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 text-center max-sm:text-left">
          <h2 className="text-base font-semibold leading-tight tracking-tight text-white">
            Ask me about Caleb
          </h2>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#9fb0cc]">
            I can explain his projects, technical decisions, trade-offs, and point you to evidence.
          </p>
        </div>
        <div className="size-10 overflow-hidden rounded-full bg-slate-700 ring-1 ring-white/20 max-sm:hidden">
          <Image
            src={asset("/caleb_headshot.jpg")}
            alt=""
            width={96}
            height={96}
            className="size-full object-cover"
          />
        </div>
      </header>

      {messages.length > 0 ? (
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
                  onClick={() => send(prompt)}
                  className="w-full rounded-xl border border-[#4f86f0]/30 bg-gradient-to-br from-[#4f86f0]/[0.12] to-[#4f86f0]/[0.04] px-4 py-2.5 text-left text-sm leading-snug text-slate-100 transition-colors hover:border-blue-400/60 hover:from-[#4f86f0]/[0.2] hover:to-[#4f86f0]/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                >
                  {prompt}
                </button>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-5 py-4 xl:flex-[1_1_0%] xl:py-3">
          <p className="mb-1.5 shrink-0 px-1 text-lg leading-tight text-[#9cc3ff]">Try asking</p>
          {/* Scrolls inside the card when there are more suggestions than fit. The thin, blue-tinted scrollbar matches the card */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1 pr-1 md:max-lg:grid md:max-lg:auto-rows-min md:max-lg:grid-cols-2 [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin]">
            {CHAT_PROMPTS.map((prompt) => (
              <SpotlightCard key={prompt} as="div" spotlightRadius={180} className="relative shrink-0 rounded-2xl">
              <button
                type="button"
                onClick={() => send(prompt)}
                disabled={isSending}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#4f86f0]/30 bg-gradient-to-br from-[#4f86f0]/[0.12] to-[#4f86f0]/[0.04] px-5 py-3.5 text-left text-[15px] leading-snug text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-blue-400/60 hover:from-[#4f86f0]/[0.2] hover:to-[#4f86f0]/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
              >
                <span>{prompt}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 shrink-0 text-[#9fb0cc] transition-all group-hover:translate-x-0.5 group-hover:text-blue-300"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      <form
        className="shrink-0 px-4 pb-4"
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
            className="block max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-base leading-snug text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin]"
          />
          <div
            className="flex items-center justify-between gap-2 p-2 pt-0"
            onClick={(event) => event.stopPropagation()}
          >
            <ModelPicker value={modelId} onChange={setModelId} />
            {draft.length > 0 && (
              // Characters used out of the limit. Turns amber as the limit gets close
              <span
                aria-live="off"
                className={`ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums ${draft.length >= MAX_USER_CHARS * 0.9 ? "text-amber-300" : "text-slate-400"}`}
              >
                {draft.length}/{MAX_USER_CHARS} chars
              </span>
            )}
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
                  className="size-5 -scale-x-100"
                  aria-hidden="true"
                >
                  <path d="M13 7 9 3 5 7l4 4" />
                  <path d="m17 11 4 4-4 4-4-4" />
                  <path d="m8 12 4 4 6-6-4-4Z" />
                  <path d="m16 8 3-3" />
                  <path d="M9 21a6 6 0 0 0-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-slate-500">
          AI-generated from Caleb&rsquo;s work. It can make mistakes.
        </p>
      </form>
      {/* Gradient rim (disabled): a 1px stroke that is brightest at the top-left and bottom-right corners and fades out along the sides. Masked so only the edge shows
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl p-px"
        style={{
          background:
            "linear-gradient(135deg, rgba(186,230,253,0.85) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.03) 55%, rgba(96,165,250,0.55) 80%, rgba(186,230,253,0.7) 100%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      /> */}
    </aside>
  );
}
