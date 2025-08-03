"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import { ChatInput } from "./chat-input";
import { MessageList, Message } from "./message-list";
import { PersonaSelector, PersonaType } from "./persona-selector";
import { cn } from "@/lib/utils";

interface ChatbotPanelProps {
  onClose?: () => void;
  className?: string;
}

export function ChatbotPanel({ onClose, className }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("MiniBuddy");

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          persona: selectedPersona,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        persona: selectedPersona,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        persona: selectedPersona,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <PanelHeader 
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Chat Assistant
          </div>
        }
        onClose={onClose}
        className="border-b p-4"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close chatbot panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelHeader>

      <div className="border-b p-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-foreground">Choose your assistant:</span>
        </div>
        <PersonaSelector
          selectedPersona={selectedPersona}
          onPersonaChange={setSelectedPersona}
        />
      </div>

      <MessageList 
        messages={messages}
        isLoading={isLoading}
        className="flex-1"
      />

      <div className="border-t">
        <ChatInput
          onSubmit={handleSendMessage}
          disabled={isLoading}
          placeholder={`Ask ${selectedPersona} anything...`}
        />
      </div>
    </div>
  );
}