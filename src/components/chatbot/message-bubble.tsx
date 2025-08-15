"use client";

import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  persona?: string;
  className?: string;
}

export function MessageBubble({
  message,
  isUser,
  timestamp,
  persona,
  className
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "justify-end" : "justify-start", className)}>
      {!isUser && (
        <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {!isUser && persona && <div className="text-muted-foreground text-xs font-medium">{persona}</div>}


          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          <p className="break-words whitespace-pre-wrap">{message}</p>
        </div>

        {timestamp && <div className="text-muted-foreground text-xs">{formatTime(timestamp)}</div>}
      </div>

      {isUser && (
        <div className="bg-secondary text-secondary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
