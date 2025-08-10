"use client";

import { useState } from "react";

import { Send } from "lucide-react";

import { useChatStore } from "@/lib/stores/write-chat-store";

export function CompactChatInput() {
  const [value, setValue] = useState("");
  const addMessage = useChatStore((s) => s.addMessage);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = value.trim();
    if (!content) return;
    addMessage({ id: crypto.randomUUID(), role: "user", content });
    setValue("");
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-[728px] px-4 py-4">
      <div className="bg-card flex items-center rounded-[var(--radius-input)] p-2 shadow-[var(--shadow-input)]">
        <input
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent px-3 py-2 font-sans outline-none"
          data-testid="chat-input-compact"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="hover:bg-accent text-foreground rounded-[var(--radius-button)] p-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
