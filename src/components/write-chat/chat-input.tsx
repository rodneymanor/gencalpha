"use client";

import ManusPrompt, { ManusPromptMinimal } from "@/components/manus-prompt";
import { useChatStore } from "@/lib/stores/write-chat-store";

export function ChatInput() {
  const state = useChatStore((s) => s.state);
  const startTransition = useChatStore((s) => s.startTransition);
  const addMessage = useChatStore((s) => s.addMessage);

  if (state === "empty") {
    return (
      <ManusPrompt
        className="mx-auto w-full max-w-[728px] px-4 py-4"
        useSlidingPanel={false}
        onSubmit={(prompt) => {
          if (!prompt.trim()) return;
          addMessage({ id: crypto.randomUUID(), role: "user", content: prompt.trim() });
          startTransition();
        }}
      />
    );
  }

  return (
    <ManusPromptMinimal
      className="mx-auto w-full max-w-[728px] px-4 py-4"
      useSlidingPanel={false}
      onSubmit={(prompt) => {
        if (!prompt.trim()) return;
        addMessage({ id: crypto.randomUUID(), role: "user", content: prompt.trim() });
      }}
    />
  );
}
