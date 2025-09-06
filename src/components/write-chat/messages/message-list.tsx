"use client";

import { memo } from "react";

import { ACK_LOADING } from "@/components/write-chat/constants";
import { ContextualQuickActions } from "@/components/write-chat/contextual-quick-actions";
import { AckLoader } from "@/components/write-chat/messages/ack-loader";
import type { ActionType } from "@/components/write-chat/persona-selector";
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
  // New prop for contextual actions
  onActionTrigger?: (action: ActionType, prompt: string) => void;
};

// Helper function to detect content type from assistant message
function detectContentType(content: string): "hooks" | "ideas" | "script" | "tips" | "general" | null {
  const lowerContent = content.toLowerCase();

  // Check for hooks content
  if (
    /\bhooks?\b/i.test(content) ||
    /hook.*:/.test(content) ||
    (content.match(/^\d+\./gm) && content.includes("hook"))
  ) {
    return "hooks";
  }

  // Check for content ideas
  if (
    /\bideas?\b/i.test(content) ||
    /content.*ideas?/i.test(content) ||
    (/^\d+\./gm.test(content) && lowerContent.includes("idea"))
  ) {
    return "ideas";
  }

  // Check for scripts (Hook, Bridge, CTA pattern)
  if (
    (/\bhook\b.*\bbridge\b.*\bcall.to.action\b/i.test(content) || /\bhook\b.*\bgolden.nugget\b/i.test(content)) &&
    content.length > 200
  ) {
    return "script";
  }

  // Check for tips/value content
  if (
    /\btips?\b/i.test(content) ||
    /\bvalue\b/i.test(content) ||
    (/^\d+\./gm.test(content) && (lowerContent.includes("tip") || lowerContent.includes("actionable")))
  ) {
    return "tips";
  }

  return null;
}

// Helper function to determine if we should show quick actions
function shouldShowQuickActions(message: ChatMessage, index: number, messages: ChatMessage[]): boolean {
  // Only show for assistant messages
  if (message.role !== "assistant") return false;

  // Don't show for loading or special messages
  if (message.content === ACK_LOADING || message.content === "<video-actions>") return false;

  // Don't show for very short messages
  if (message.content.length < 50) return false;

  // Don't show for error messages
  if (message.content.toLowerCase().startsWith("error:")) return false;

  // Only show for the last assistant message or recent ones with detected content types
  const isLastMessage = index === messages.length - 1;
  const isRecentMessage = index >= messages.length - 3; // Last 3 messages
  const hasContentType = detectContentType(message.content) !== null;

  return isLastMessage || (isRecentMessage && hasContentType);
}

function MessageListComponent(props: MessageListProps) {
  const {
    messages,
    resolvedName,
    activeAction,
    onVideoAction,
    messagesEndRef,
    isProcessingVideoAction,
    onActionTrigger,
  } = props;

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
                  <div className="col-start-2 space-y-3">
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
                      <>
                        {/* Regular assistant message with subtle hover state */}
                        <div className="prose text-foreground interactive-element hover:bg-accent/5 -m-2 max-w-none rounded-[var(--radius-button)] p-2 transition-all duration-200">
                          <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                        </div>

                        {/* Contextual Quick Actions - shown for relevant content */}
                        {onActionTrigger &&
                          shouldShowQuickActions(m, index, messages) &&
                          (() => {
                            const contentType = detectContentType(m.content);
                            if (contentType) {
                              return (
                                <ContextualQuickActions
                                  contentType={contentType}
                                  onActionTrigger={onActionTrigger}
                                  className="mt-3 opacity-80 transition-opacity duration-200 hover:opacity-100"
                                />
                              );
                            }
                            return null;
                          })()}
                      </>
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
