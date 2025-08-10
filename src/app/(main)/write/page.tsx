"use client";

import { ChatContainer } from "@/components/write-chat/chat-container";
import { ChatInput } from "@/components/write-chat/chat-input";
import { HeroSection } from "@/components/write-chat/hero-section";
import { MessageThread } from "@/components/write-chat/message-thread";
import { useChatStore } from "@/lib/stores/write-chat-store";
import { cn } from "@/lib/utils";

export default function WritePage() {
  const state = useChatStore((s) => s.state);
  const messages = useChatStore((s) => s.messages);

  return (
    <ChatContainer>
      {state === "empty" && <HeroSection />}

      {(state === "transitioning" || state === "active") && (
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <h2 className="text-foreground font-sans text-xl font-semibold">Script Chat</h2>
        </div>
      )}

      <MessageThread messages={messages} />

      <div
        className={cn(
          "bg-background/80 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-2 z-10 flex justify-center px-4 backdrop-blur md:left-[var(--sidebar-width)] group-data-[collapsible=icon]:md:left-[var(--sidebar-width-icon)]",
          state === "empty" ? "left-0 w-full" : "left-0 w-full border-t",
        )}
      >
        <ChatInput />
      </div>
    </ChatContainer>
  );
}
