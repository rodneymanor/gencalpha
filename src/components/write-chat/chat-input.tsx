"use client";

import { motion } from "framer-motion";
import { Paperclip, Send } from "lucide-react";

import { useChatStore } from "@/lib/stores/write-chat-store";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const state = useChatStore((s) => s.state);
  const startTransition = useChatStore((s) => s.startTransition);
  const addMessage = useChatStore((s) => s.addMessage);
  const isLoading = false;
  const inputId = "write-chat-input";
  let inputValue = "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputValue = e.target.value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue?.trim();
    if (!content) return;

    addMessage({ id: crypto.randomUUID(), role: "user", content });
    if (state === "empty") startTransition();
    inputValue = "";
  };

  const variants = {
    empty: {
      padding: "1.5rem",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-soft-drop)",
      background: "var(--card)",
    },
    active: {
      padding: "1rem",
      borderRadius: "var(--radius-input)",
      boxShadow: "var(--shadow-input)",
      background: "var(--card)",
    },
  } as const;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn("relative w-full", state === "empty" ? "max-w-2xl" : "mx-auto max-w-4xl px-4")}
      animate={state === "empty" ? "empty" : "active"}
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center">
        <input
          id={inputId}
          onChange={handleInputChange}
          placeholder={state === "empty" ? "Ask anything..." : "Type your message..."}
          className={cn(
            "bg-card text-foreground w-full pr-12 outline-none",
            "placeholder:text-muted-foreground",
            "font-sans",
          )}
          disabled={isLoading}
          data-testid="chat-input"
        />

        <div className="absolute right-2 flex items-center gap-2">
          {state === "active" && (
            <button type="button" className="hover:bg-accent rounded-[var(--radius-button)] p-2">
              <Paperclip className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="hover:bg-accent rounded-[var(--radius-button)] p-2 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {state === "empty" && (
        <div className="mt-3 flex flex-wrap gap-2" data-testid="hero-input">
          <button
            type="button"
            className="bg-accent text-foreground hover:bg-accent/80 rounded-[var(--radius-pill)] px-3 py-1 text-sm"
          >
            Write a hook
          </button>
          <button
            type="button"
            className="bg-accent text-foreground hover:bg-accent/80 rounded-[var(--radius-pill)] px-3 py-1 text-sm"
          >
            Improve script
          </button>
        </div>
      )}
    </motion.form>
  );
}
