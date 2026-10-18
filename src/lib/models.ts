// Models the chat can run on. Shared by the picker (client) and the chat route (server), so keep this file free of client-only code
export const CHAT_MODELS = [
  { id: "claude-haiku-5-5", name: "Haiku 5.5", provider: "Anthropic" },
  { id: "gpt-5.6-luna", name: "GPT 5.6 Luna", provider: "OpenAI" },
] as const;

export type ModelId = (typeof CHAT_MODELS)[number]["id"];

export const DEFAULT_MODEL_ID: ModelId = CHAT_MODELS[0].id;

export function findModel(id: unknown) {
  return CHAT_MODELS.find((m) => m.id === id);
}
