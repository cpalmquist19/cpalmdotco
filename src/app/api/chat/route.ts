import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";
import { NextResponse } from "next/server";

const MODEL_ID = "claude-haiku-5-5";
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

const SYSTEM_PROMPT = `You are the AI assistant on Caleb Palmquist's portfolio site. Answer questions about Caleb using only the information below. If something isn't covered, say you don't know and suggest contacting Caleb directly. Keep answers short and conversational.

Projects:
- Ticket Radar: Fine-tuned DistilBERT that sorts support tickets into Change, Issue, or Request at 98% accuracy. Tags: Python, PyTorch, ONNX. Code: https://github.com/cpalmquist19/ticket_radar
- Relay: Local coding agent with a web UI, plus an 11-task eval harness that scores models on pass rate, speed, and cost. Tags: Python, LLM, Agents, Evals. Code: https://github.com/cpalmquist19/relay
- Quark: Workbench for small GPT models: swap in paper-inspired components and compare them with paired-seed ablations. Tags: Python, PyTorch, LLM. Code: https://github.com/cpalmquist19/quark`;

type IncomingMessage = { role: "user" | "assistant"; content: string };

function parseMessages(body: unknown): IncomingMessage[] | null {
  if (!body || typeof body !== "object" || !("messages" in body)) return null;
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const recent = messages.slice(-MAX_MESSAGES);
  const valid = recent.every(
    (m): m is IncomingMessage =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      m.content.length <= MAX_CHARS,
  );
  return valid ? recent : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json({ error: "Invalid messages." }, { status: 400 });
  }

  // Plain-text stream: the client reads it chunk by chunk while the reply is still being written
  const result = streamText({
    model: anthropic(MODEL_ID),
    system: SYSTEM_PROMPT,
    messages: messages as ModelMessage[],
    maxOutputTokens: 600,
    onError: ({ error }) => console.error("Chat stream failed:", error),
  });
  return result.toTextStreamResponse();
}
