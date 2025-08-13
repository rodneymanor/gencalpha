export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

// Keep tokens as literal types to avoid runtime coupling in type space
export type SystemToken = "<ack-loading>" | "<video-actions>" | "<emulate-input>";
