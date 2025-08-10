"use client";

import { ManusPrompt } from "@/components/manus-prompt";
import { ChatContainer } from "@/components/write-chat/chat-container";
import { ChatInput } from "@/components/write-chat/chat-input";
import { MessageThread } from "@/components/write-chat/message-thread";
import { useChatStore } from "@/lib/stores/write-chat-store";
import { cn } from "@/lib/utils";

export default function WritePage() {
  const state = useChatStore((s) => s.state);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const startTransition = useChatStore((s) => s.startTransition);

  return (
    <ChatContainer>
      {state === "empty" && (
        <div className="pt-8 pb-8">
          <ManusPrompt
            className=""
            useSlidingPanel={false}
            onSubmit={(prompt) => {
              const content = prompt.trim();
              if (!content) return;
              addMessage({ id: crypto.randomUUID(), role: "user", content });
              startTransition();
            }}
          />
        </div>
      )}

      {(state === "transitioning" || state === "active") && (
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <h2 className="text-foreground font-sans text-xl font-semibold">Script Chat</h2>
        </div>
      )}

      <MessageThread messages={messages} />

      {state !== "empty" && (
        <div className={cn("relative w-full border-t")}>
          <ChatInput />
        </div>
      )}
    </ChatContainer>
  );
}
