"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { LoadingIndicator } from "./loading-indicator";
import { PersonaType } from "./persona-selector";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  persona?: PersonaType;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export function MessageList({ messages, isLoading = false, className }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("flex-1", className)}>
      <div className="space-y-2 p-2">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <div className="text-muted-foreground text-sm">
                No messages yet. Start a conversation!
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            persona={message.persona}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 p-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <LoadingIndicator size="sm" />
            </div>
            <div className="flex max-w-[80%] flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                Thinking...
              </div>
              <div className="rounded-2xl bg-muted px-4 py-2">
                <LoadingIndicator />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}