"use client";

import { useRef, useState } from "react";
import { checkMessage } from "@/lib/chat-guard";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";
import type { ChatPhase, Message } from "./types";

/** The conversation with /api/chat: the thread, the draft, what is in flight, and the ways to send or stop. */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  // Why the last message was refused before or by the server; shown above the composer, with the draft kept
  const [notice, setNotice] = useState<string | null>(null);
  // The model the picker has selected; sent with each message so the server answers with it
  const [modelId, setModelId] = useState<ModelId>(DEFAULT_MODEL_ID);
  const abortRef = useRef<AbortController | null>(null);
  const isSending = phase !== "idle";

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
    setPhase("waiting");
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
        // The first chunk means the reply is streaming, so the reply bubble shows and the video switches clips
        setPhase("streaming");
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
      setPhase("idle");
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  /** Typing replaces any notice about the previous attempt */
  function changeDraft(value: string) {
    setDraft(value);
    setNotice(null);
  }

  return { messages, draft, changeDraft, phase, isSending, error, notice, modelId, setModelId, send, stop };
}
