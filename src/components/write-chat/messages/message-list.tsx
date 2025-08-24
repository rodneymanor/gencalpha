"use client";

import { memo } from "react";

import { ACK_LOADING } from "@/components/write-chat/constants";
import { AckLoader } from "@/components/write-chat/messages/ack-loader";
import type { ChatMessage } from "@/components/write-chat/types";
import VideoActionSelector from "@/components/write-chat/video-action-selector";

type MessageListProps = {
  messages: ChatMessage[];
  resolvedName?: string | null;
  videoPanel: { url: string; platform: "instagram" | "tiktok" } | null;
  activeAction: string | null;
  onVideoAction: (action: "transcribe" | "ideas" | "hooks") => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isProcessingVideoAction?: boolean;
};

function MessageListComponent(props: MessageListProps) {
  const { messages, resolvedName, activeAction, onVideoAction, messagesEndRef, isProcessingVideoAction } = props;

  return (
    // Main chat container with centered max-width layout
    <div className="mx-auto max-w-3xl py-6">
      <div className="space-y-6">
        {messages.map((m, index) => (
          // Individual message container with staggered animation
          <div
            key={m.id}
            className="message slide-up interactive-element"
            style={{
              // Animate messages from bottom up with 50ms delays
              animationDelay: `${Math.max(0, messages.length - index - 1) * 50}ms`,
            }}
          >
            {/* Two-column grid: 40px for avatar space, 1fr for content */}
            <div className="grid grid-cols-[40px_1fr] items-start gap-x-3">
              {m.role === "user" ? (
                <>
                  {/* Empty avatar space for user messages (right-aligned) */}
                  <div aria-hidden className="h-8 w-8" />
                  <div className="col-start-2">
                    {/* User message bubble: neutral-300 background with hover progression */}
                    <div className="text-foreground interactive-element inline-flex max-w-[min(85%,_60ch)] items-start gap-2 rounded-[var(--radius-card)] bg-neutral-200 px-4 py-3 shadow-[var(--shadow-input)] transition-all duration-200 hover:bg-neutral-400 hover:shadow-[var(--shadow-soft-drop)]">
                      {/* User avatar with first letter of resolved name - high contrast dark background with light text */}
                      <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                        {(resolvedName?.[0] ?? "U").toUpperCase()}
                      </div>
                      {/* User message content with preserved whitespace */}
                      <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Empty avatar space for assistant messages (left-aligned) */}
                  <div aria-hidden className="h-8 w-8" />
                  <div className="col-start-2">
                    {/* Assistant message content with conditional rendering */}
                    {m.content === ACK_LOADING ? (
                      // Show loading animation for acknowledgment
                      <AckLoader />
                    ) : m.content === "<video-actions>" ? (
                      // Show video action selector for video processing
                      <div className="my-4">
                        <VideoActionSelector
                          onAction={onVideoAction}
                          disabled={activeAction !== null || isProcessingVideoAction}
                        />
                      </div>
                    ) : (
                      // Regular assistant message with subtle hover state
                      <div className="prose text-foreground interactive-element hover:bg-accent/5 -m-2 max-w-none rounded-[var(--radius-button)] p-2 transition-all duration-200">
                        <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {/* Scroll anchor for auto-scrolling to latest message */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export const MessageList = memo(MessageListComponent);
