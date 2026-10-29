import type { Message } from "./types";

// Follow-up questions offered after a reply, grouped by topic. Each one must be answerable from src/content (relay.ts, cpalmdev.ts, quark.ts, resume.ts); check there before adding one, or the chat will answer "I don't know"
const FOLLOW_UPS = [
  {
    // Each starts at a word boundary, so "eval" matches "evals" but not "retrieval"
    match: /\b(?:relay|eval|harness|agent|sandbox)/g,
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
    match: /\b(?:qa|sdet|resume|experience|role|automation|ersp)/g,
    prompts: [
      "How does Caleb test non-deterministic systems?",
      "What's Caleb's test automation experience?",
      "What AI projects has Caleb built besides Relay?",
    ],
  },
  {
    match: /\b(?:beam-?e|safeguards?|guardrails?|injection|rate.?limit|cpalm|portfolio|this site)/g,
    prompts: [
      "How does BEAM-E protect itself from abuse?",
      "How is BEAM-E tested?",
      "What are the limits of BEAM-E's safeguards?",
      "How was this site built?",
    ],
  },
];

/** Up to three unasked questions: two on the topic of the latest exchange, one from another topic */
export function followUps(messages: Message[]) {
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const recent = messages.slice(-2).map((m) => m.content.toLowerCase()).join(" ");
  const ranked = FOLLOW_UPS.map((topic, i) => ({ topic, i, hits: recent.match(topic.match)?.length ?? 0 }))
    .sort((a, b) => b.hits - a.hits || a.i - b.i)
    .map(({ topic }) => topic.prompts.filter((prompt) => !asked.has(prompt)));
  return [...ranked[0].slice(0, 2), ...ranked.slice(1).flatMap((prompts) => prompts.slice(0, 1))].slice(0, 3);
}
