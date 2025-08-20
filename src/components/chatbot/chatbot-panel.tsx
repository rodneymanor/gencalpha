"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import { cn } from "@/lib/utils";

import { ChatInput } from "./chat-input";
import { MessageList, Message } from "./message-list";
import { AssistantType } from "./persona-selector";

interface ChatbotPanelProps {
  onClose?: () => void;
  className?: string;
  initialPrompt?: string;
  initialAssistant?: AssistantType;
}

// Generate unique IDs for messages to prevent React key conflicts
const generateUniqueId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function ChatbotPanel({ onClose, className, initialPrompt, initialAssistant }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant] = useState<AssistantType>(initialAssistant ?? "MiniBuddy");

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return; // Prevent multiple simultaneous calls

      // Add user message
      const userMessage: Message = {
        id: generateUniqueId(),
        content,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Prepare conversation history for API using current messages state
        const conversationHistory = messages.map((msg) => ({
          role: msg.isUser ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        }));

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            assistant: selectedAssistant,
            conversationHistory,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Add bot response
        const botMessage: Message = {
          id: generateUniqueId(),
          content: data.response ?? "I'm sorry, I didn't receive a proper response.",
          isUser: false,
          timestamp: new Date(),
          assistant: selectedAssistant,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);

        // Add error message
        const errorMessage: Message = {
          id: generateUniqueId(),
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
          assistant: selectedAssistant,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAssistant, messages, isLoading],
  );

  // Track if initial prompt has been processed
  const initialPromptProcessed = useRef(false);

  // Process initial prompt when panel opens
  useEffect(() => {
    if (initialPrompt && typeof initialPrompt === "string" && initialPrompt.trim() && !initialPromptProcessed.current) {
      initialPromptProcessed.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, handleSendMessage]);

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className={cn("bg-background flex h-full flex-col", className)}>
      <PanelHeader
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Chat Assistant
          </div>
        }
        onClose={onClose}
        className="flex-shrink-0 border-b p-4"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="text-xs"
          >
            Clear
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Close chatbot panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelHeader>

      <MessageList messages={messages} isLoading={isLoading} className="min-h-0 flex-1 overflow-y-auto" />

      <div className="flex-shrink-0 border-t">
        <ChatInput
          onSubmit={handleSendMessage}
          disabled={isLoading}
          placeholder={`Ask ${selectedAssistant} anything...`}
        />
      </div>
    </div>
  );
}
