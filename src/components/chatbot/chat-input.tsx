"use client";

import { useState, KeyboardEvent } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = "Type your message...",
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;

    onSubmit(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex gap-2 p-4", className)}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={handleSubmit} disabled={disabled || !message.trim()} size="icon" className="h-9 w-9 rounded-md">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
