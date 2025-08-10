"use client";

import ManusPrompt from "@/components/manus-prompt";
import { useChatStore } from "@/lib/stores/write-chat-store";

export function ChatInput() {
  const state = useChatStore((s) => s.state);
  const startTransition = useChatStore((s) => s.startTransition);
  const addMessage = useChatStore((s) => s.addMessage);

  return (
    <ManusPrompt
      className="mx-auto w-full max-w-4xl px-4 py-4"
      onSubmit={(prompt) => {
        if (!prompt?.trim()) return;
        addMessage({ id: crypto.randomUUID(), role: "user", content: prompt.trim() });
        if (state === "empty") startTransition();
      }}
    />
  );
}
