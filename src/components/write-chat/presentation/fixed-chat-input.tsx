"use client";

import { ArrowUp, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FixedChatInput(props: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { inputValue, setInputValue, onSubmit, textareaRef } = props;
  return (
    <div className="chat-input-fixed">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-card border-border-subtle rounded-[var(--radius-card)] border shadow-[var(--shadow-input)]">
          <div className="flex items-center gap-3 p-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Reply to Gen.C..."
                className="placeholder:text-muted-foreground w-full resize-none border-0 bg-transparent font-sans text-sm focus:ring-0 focus:outline-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) onSubmit();
                  }
                }}
                style={{ minHeight: "20px", maxHeight: "100px", height: "auto" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 100) + "px";
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground hover:bg-accent/5 size-8 rounded-[var(--radius-button)] transition-colors duration-200"
            >
              <SlidersHorizontal className="h-3 w-3" />
            </Button>
            <Button onClick={onSubmit} disabled={!inputValue.trim()} size="sm" className="rounded-full">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FixedChatInput;
