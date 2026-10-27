"use client";

import { useEffect, useRef } from "react";
import { MAX_USER_CHARS } from "@/lib/chat-guard";
import type { ModelId } from "@/lib/models";
import { ModelPicker } from "../model-picker";

/** The input area: a notice when a message was refused, the text box with its model picker and send/stop button, and the disclaimer */
export function Composer({
  draft,
  notice,
  isSending,
  modelId,
  onDraftChange,
  onModelChange,
  onSend,
  onStop,
}: {
  draft: string;
  notice: string | null;
  isSending: boolean;
  modelId: ModelId;
  onDraftChange: (value: string) => void;
  onModelChange: (id: ModelId) => void;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0;

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

  return (
    <form
      className="shrink-0 px-4 pb-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSend(draft);
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
          onChange={(event) => onDraftChange(event.target.value)}
          maxLength={MAX_USER_CHARS}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter adds a new line
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void onSend(draft);
            }
          }}
          disabled={isSending}
          className="block max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-base leading-snug text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin]"
        />
        <div
          className="flex items-center justify-between gap-2 p-2 pt-0"
          onClick={(event) => event.stopPropagation()}
        >
          <ModelPicker value={modelId} onChange={onModelChange} />
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
              onClick={onStop}
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
  );
}
