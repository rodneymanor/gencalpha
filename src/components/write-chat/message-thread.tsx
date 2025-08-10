"use client";

import { AnimatePresence, motion } from "framer-motion";

import { transitions } from "@/lib/animations/transitions";
import { ChatMessage } from "@/lib/stores/write-chat-store";

export function MessageThread({ messages }: { messages: ChatMessage[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={transitions.thread.initial}
        animate={transitions.thread.animate}
        transition={transitions.thread.transition}
        className="flex-1 overflow-y-auto px-4 py-8"
        data-testid="message-thread"
      >
        <div className="mx-auto max-w-4xl space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "bg-card rounded-[var(--radius-card)] px-4 py-3 shadow-[var(--shadow-input)]"
                  : "bg-accent rounded-[var(--radius-card)] px-4 py-3"
              }
            >
              <p className="text-foreground font-sans text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
