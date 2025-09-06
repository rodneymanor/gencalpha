"use client";

import { forwardRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { type VideoAction } from "@/components/write-chat/hooks/use-video-action-state";
import { MessageList } from "@/components/write-chat/messages/message-list";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import { type ActionType } from "@/components/write-chat/persona-selector";
import { FixedChatInput } from "@/components/write-chat/presentation/fixed-chat-input";
import { type ChatMessage } from "@/components/write-chat/types";

export interface ChatContainerProps {
  // State
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  selectedPersona: PersonaOption | null;
  onPersonaSelect: (persona: PersonaOption | null) => void;
  conversationTitle: string | null;

  // User info
  resolvedName: string | null;

  // Video action state
  activeAction: VideoAction | null;
  isProcessingVideoAction: boolean;
  onVideoAction: (action: VideoAction) => void;

  // Handlers
  onSubmit: () => void;
  onActionTrigger: (action: ActionType, prompt: string) => void;

  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  (
    {
      messages,
      inputValue,
      setInputValue,
      selectedPersona,
      onPersonaSelect,
      conversationTitle,
      resolvedName,
      activeAction,
      isProcessingVideoAction,
      onVideoAction,
      onSubmit,
      onActionTrigger,
      messagesEndRef,
      textareaRef,
      messagesContainerRef,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className="chat-messages-area">
        <div className="messages-container relative flex h-screen flex-col transition-all duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-neutral-900">{conversationTitle ?? "New Chat"}</h2>
              {conversationTitle && <p className="text-xs text-neutral-600">{messages.length} messages</p>}
            </div>
          </div>

          {/* Messages Area with bottom padding for sticky input */}
          <ScrollArea className="messages-list flex-1 px-4 pb-24" ref={messagesContainerRef}>
            <MessageList
              messages={messages}
              resolvedName={resolvedName}
              videoPanel={null}
              activeAction={activeAction}
              onVideoAction={onVideoAction}
              messagesEndRef={messagesEndRef}
              isProcessingVideoAction={isProcessingVideoAction}
              onActionTrigger={onActionTrigger}
            />
          </ScrollArea>

          {/* Fixed Chat Input */}
          <FixedChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={onSubmit}
            textareaRef={textareaRef}
            selectedPersona={selectedPersona as any} // TODO: Fix type mismatch
            onPersonaSelect={onPersonaSelect as any} // TODO: Fix type mismatch
          />
        </div>
      </div>
    );
  },
);

ChatContainer.displayName = "ChatContainer";
