"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import ChatInput from "./ChatInput";

type ChatInputWrapperProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  isProcessing?: boolean;
  variant?: "hero" | "compact";
  wrapInCard?: boolean;
  containerClassName?: string;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  submitEnabled?: boolean;
  highlightSubmit?: boolean;
  submitIcon?: React.ReactNode;
  footerBanner?: React.ReactNode;
  className?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function ChatInputWrapper({
  value,
  onChange,
  placeholder,
  onSubmit,
  isProcessing = false,
  variant = "hero",
  wrapInCard = true,
  containerClassName,
  leftControls,
  rightControls,
  submitEnabled = false,
  highlightSubmit = false,
  submitIcon,
  footerBanner,
  className,
  textareaRef, // Note: ChatInput uses Input not Textarea, so this won't be forwarded
  onKeyDown, // Note: ChatInput handles Enter differently
}: ChatInputWrapperProps) {
  // Handle the submit with timeLimit (ChatInput provides both message and timeLimit)
  const handleChatSubmit = (message: string, timeLimit: string) => {
    // For now, we'll ignore timeLimit and just call the original onSubmit
    // The parent can access the message via the value prop
    onSubmit?.();
  };

  // If we have custom rightControls or complex processing states,
  // we should fall back to a different approach, but for initial integration:
  const shouldUseChatInput = !rightControls && !footerBanner && !leftControls;

  if (shouldUseChatInput) {
    // Use the new ChatInput for simple cases
    return (
      <div className={className}>
        <ChatInput
          value={value}
          onChange={onChange}
          onSubmit={handleChatSubmit}
          placeholder={placeholder}
          disabled={isProcessing}
          showTimeLimit={false} // Keep simple for now
          showSettings={false} // Keep simple for now
          showTrending={false} // Keep simple for now
          className="w-full"
        />
      </div>
    );
  }

  // For complex cases with leftControls, rightControls, footerBanner, etc.
  // we'll create a hybrid approach that uses ChatInput's styling but PromptComposer's layout
  const inner = (
    <div className={cn("flex flex-col space-y-3 py-3", variant === "hero" ? "max-h-72" : undefined)}>
      {/* Use ChatInput's styled container but with custom content */}
      <div className="relative overflow-y-auto px-4">
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-2 shadow-[var(--shadow-input)] transition-all duration-200 hover:border-neutral-300">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (onKeyDown) {
                // Convert to textarea event for compatibility
                onKeyDown(e as any);
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isProcessing && submitEnabled) onSubmit?.();
              }
            }}
            placeholder={placeholder}
            disabled={isProcessing}
            className="flex-1 border-0 bg-transparent px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {footerBanner && <div className="absolute right-0 bottom-2 left-0 mx-3">{footerBanner}</div>}
      </div>

      <div className="flex items-center gap-2 px-3">
        {leftControls}
        <span className="flex-1" />
        {rightControls}
      </div>
    </div>
  );

  if (!wrapInCard) {
    return <div className={className}>{inner}</div>;
  }
  return <div className={cn("bg-card rounded-3xl border shadow-md", containerClassName, className)}>{inner}</div>;
}

export default ChatInputWrapper;
