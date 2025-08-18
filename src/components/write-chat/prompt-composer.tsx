"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PromptComposerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Called when user presses the send button or hits Enter (without Shift) */
  onSubmit?: () => void;
  /** Disable input and actions while processing */
  isProcessing?: boolean;
  /** Optional compact variant used for sticky chat input */
  variant?: "hero" | "compact";
  /** When false, do not render the card container so parents can wrap it themselves */
  wrapInCard?: boolean;
  /** Optional className applied to the wrapping card when wrapInCard is true */
  containerClassName?: string;
  /** Left-side controls row (e.g., idea toggle, switches, badges) */
  leftControls?: React.ReactNode;
  /** If provided, replaces the default send button on the right */
  rightControls?: React.ReactNode;
  /** Whether the default send button should be enabled */
  submitEnabled?: boolean;
  /** Highlight the submit button to indicate a detected action (e.g., valid URL) */
  highlightSubmit?: boolean;
  /** Icon to render inside the default submit button when not processing */
  submitIcon?: React.ReactNode;
  /** Footer banner rendered inside the input container (e.g., URL detection/status) */
  footerBanner?: React.ReactNode;
  /** Optional className for the root container */
  className?: string;
  /** Forward a ref to the textarea for focus management */
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  /** Keydown hook to allow parent to intercept Enter/Shift-Enter behavior */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function PromptComposer({
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
  textareaRef,
  onKeyDown,
}: PromptComposerProps) {
  const inner = (
    <div className={cn("flex flex-col space-y-3 py-3", variant === "hero" ? "max-h-72" : undefined)}>
      <div className="relative overflow-y-auto px-4">
        <Textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (onKeyDown) onKeyDown(e);
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!isProcessing && submitEnabled) onSubmit?.();
            }
          }}
          placeholder={placeholder}
          className={cn(
            "resize-none border-0 bg-transparent focus-visible:ring-0",
            footerBanner ? "pb-12" : undefined,
          )}
        />

        {footerBanner && <div className="absolute right-0 bottom-2 left-0 mx-3">{footerBanner}</div>}
      </div>

      <div className="flex items-center gap-2 px-3">
        {leftControls}
        <span className="flex-1" />
        {rightControls ?? (
          <Button
            size="icon"
            disabled={isProcessing || !submitEnabled}
            onClick={() => {
              if (!isProcessing && submitEnabled) onSubmit?.();
            }}
            className={cn(
              "size-9 rounded-full transition-colors",
              submitEnabled
                ? cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    highlightSubmit ? "animate-clarity-pulse shadow-[var(--shadow-soft-drop)]" : undefined,
                  )
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground border",
            )}
          >
            {isProcessing ? submitIcon /* parent can pass a spinner */ : submitIcon}
          </Button>
        )}
      </div>
    </div>
  );

  if (!wrapInCard) {
    return <div className={className}>{inner}</div>;
  }
  return <div className={cn("bg-card rounded-3xl border shadow-md", containerClassName, className)}>{inner}</div>;
}

export default PromptComposer;


