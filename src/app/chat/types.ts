export type Message = { role: "user" | "assistant"; content: string };

// idle: nothing in flight · waiting: a message was sent and no reply has started · streaming: the reply is coming in
export type ChatPhase = "idle" | "waiting" | "streaming";
