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
  onTranscribe: () => void;
  onIdeas: () => void;
  onHooks: () => void;
  onVideoAction?: (action: "transcribe" | "ideas" | "hooks") => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isProcessingVideoAction?: boolean;
};

function MessageListComponent(props: MessageListProps) {
  const { messages, resolvedName, activeAction, onVideoAction, messagesEndRef, isProcessingVideoAction } = props;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="space-y-6">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className="message slide-up interactive-element"
            style={{
              animationDelay: `${Math.max(0, messages.length - index - 1) * 50}ms`,
            }}
          >
            <div className="grid grid-cols-[40px_1fr] items-start gap-x-3">
              {m.role === "user" ? (
                <>
                  <div aria-hidden className="h-8 w-8" />
                  <div className="col-start-2">
                    <div className="bg-accent/10 text-foreground hover:bg-accent/15 interactive-element inline-flex max-w-[min(85%,_60ch)] items-center gap-2 rounded-[var(--radius-input)] px-4 py-3 shadow-[var(--shadow-input)] transition-all duration-200 hover:shadow-[var(--shadow-soft-drop)]">
                      <div className="bg-accent/20 text-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                        {(resolvedName?.[0] ?? "U").toUpperCase()}
                      </div>
                      <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div aria-hidden className="h-8 w-8" />
                  <div className="col-start-2">
                    {m.content === ACK_LOADING ? (
                      <AckLoader />
                    ) : m.content === "<video-actions>" ? (
                      <div className="my-4">
                        <VideoActionSelector
                          onAction={onVideoAction ?? (() => {})}
                          disabled={activeAction !== null || isProcessingVideoAction}
                        />
                      </div>
                    ) : (
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export const MessageList = memo(MessageListComponent);
