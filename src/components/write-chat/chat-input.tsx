"use client";

import ManusPrompt from "@/components/manus-prompt";
import { CompactChatInput } from "@/components/write-chat/compact-chat-input";
import { useChatStore } from "@/lib/stores/write-chat-store";

export function ChatInput() {
  const state = useChatStore((s) => s.state);
  const startTransition = useChatStore((s) => s.startTransition);
  const addMessage = useChatStore((s) => s.addMessage);

  if (state === "empty") {
    return (
      <ManusPrompt
        className="mx-auto w-full max-w-4xl px-4 py-4"
        useSlidingPanel={false}
        onSubmit={(prompt) => {
          if (!prompt.trim()) return;
          addMessage({ id: crypto.randomUUID(), role: "user", content: prompt.trim() });
          startTransition();
        }}
      />
    );
  }

  return <CompactChatInput />;
}
