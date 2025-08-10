"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";

import { transitions } from "@/lib/animations/transitions";
import { useChatStore } from "@/lib/stores/write-chat-store";
import { cn } from "@/lib/utils";

export function ChatContainer({ children }: { children: ReactNode }) {
  const state = useChatStore((s) => s.state);

  return (
    <motion.div
      className={cn(
        "relative h-[calc(100vh-0px)] w-full transition-all duration-300",
        state === "empty" ? "flex items-center justify-center" : "flex flex-col",
      )}
      layout
      transition={transitions.layout}
    >
      {children}
    </motion.div>
  );
}
