"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { MAX_USER_CHARS, checkMessage } from "@/lib/chat-guard";
import { Markdown } from "./markdown";
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

// TEMP (testing only): fake a slow reply so the send/receive videos can be checked. Open the page with ?simulate=1 to use it. Remove when done.
const SIMULATED_RECEIVE_MS = 10_000; // matches the 10s receive clip
const SIMULATED_WORD_MS = 150;
const SIMULATED_REPLY =
  "This is a simulated reply for testing the send and receive videos. It streams one word at a time, so the send clip keeps looping while the answer comes in. Once it finishes, the card goes back to the ready clip. This is a simulated reply for testing the send and receive videos. It streams one word at a time, so the send clip keeps looping while the answer comes in. Once it finishes, the card goes back to the ready clip.";
const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });

export function ChatCard() {
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

  // On desktop, keep the cursor in the box (on load and after each reply) so the glow is lit. Skipped on touch layouts so the keyboard doesn't pop up unasked
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
      // TEMP (testing only): simulated send/receive, see SIMULATED_* above. Remove along with those constants.
      if (new URLSearchParams(window.location.search).has("simulate")) {
        await wait(SIMULATED_RECEIVE_MS, controller.signal);
        const words = SIMULATED_REPLY.split(" ");
        for (let i = 0; i < words.length; i++) {
          const reply = words.slice(0, i + 1).join(" ");
          setVideoMode("send");
          setMessages([...next, { role: "assistant", content: reply }]);
          await wait(SIMULATED_WORD_MS, controller.signal);
        }
        return;
      }

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

  return (
    <aside
      aria-label="Ask me about Caleb"
      className="relative mx-auto flex w-full max-w-[28rem] flex-col rounded-3xl border border-white/10 bg-[#0e1428]/80 shadow-2xl shadow-black/40 backdrop-blur-md h-[clamp(34rem,calc(100dvh_-_9rem),46rem)]"
    >
      {/* The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame. The video runs edge to edge across the top of the card, with the status row directly below it */}
      <div>
        <div className="relative aspect-[1.587] overflow-hidden rounded-t-3xl bg-[#0a0f20] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)]">
          <Image
            src={asset("/beame/BEAM-E.jpg")}
            alt=""
            fill
            sizes="(min-width: 448px) 448px, 100vw"
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
        </div>
        <header className="flex items-center gap-4 border-y border-white/10 bg-black/20 px-5 py-4">
          <div className="relative">
            <div className="size-12 overflow-hidden rounded-full bg-slate-700">
              <Image
                src={asset("/beame/BEAM-E-avatar.jpg")}
                alt="BEAM-E"
                width={160}
                height={160}
                className="size-full object-cover"
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 size-[0.7rem] rounded-full bg-emerald-500 ring-2 ring-[#0a0f20]"
            />
          </div>
          <div className="flex-1">
            <p className="text-xl font-semibold text-white">Ask me about Caleb</p>
            <p className="text-sm text-slate-400">
              AI assistant · answers from my work
            </p>
          </div>
        </header>
      </div>

      {messages.length > 0 ? (
        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          {messages.map((message, i) => (
            <div
              key={i}
              className={
                message.role === "user"
                  ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl bg-blue-500/20 px-4 py-2 text-base text-slate-100"
                  : "max-w-[85%] self-start rounded-2xl bg-white/5 px-4 py-2 text-base text-slate-200"
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
        <div className="flex flex-1 flex-col justify-end gap-2 px-5 py-4">
          {CHAT_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => send(prompt)}
              disabled={isSending}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-left text-base text-slate-100 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <span>{prompt}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <form
        className="px-5 pb-5"
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
          className="cursor-text rounded-2xl border-2 border-[#a78bfa]/70 bg-white/[0.08] shadow-[0_0_12px_rgba(167,139,250,0.5)] transition-shadow duration-300 focus-within:border-[#a78bfa] focus-within:bg-white/[0.11] focus-within:shadow-[0_0_18px_rgba(167,139,250,0.7)]"
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
            className="block max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-lg leading-snug text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-2 p-2 pt-0" onClick={(event) => event.stopPropagation()}>
            <ModelPicker />
            {isSending ? (
              // While a reply is in progress the button becomes a stop button that cancels the stream
              <button
                type="button"
                aria-label="Stop"
                onClick={stop}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-colors duration-150 hover:bg-red-500/30"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/20 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-colors duration-150 hover:bg-blue-500/30"
              >
                <span
                  aria-hidden="true"
                  className="motion-safe:animate-twinkle scale-x-[-1] text-lg leading-none"
                >
                  📡
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </aside>
  );
}
