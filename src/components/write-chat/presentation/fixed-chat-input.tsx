"use client";

import { ArrowUp, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonasDropdown } from "@/components/write-chat/personas-dropdown";

export function FixedChatInput(props: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  selectedPersona?: string;
  onPersonaSelect?: (persona: string) => void;
  showPersonas?: boolean;
}) {
  const { 
    inputValue, 
    setInputValue, 
    onSubmit, 
    textareaRef,
    selectedPersona,
    onPersonaSelect,
    showPersonas = true
  } = props;
  return (
    <div className="chat-input-fixed">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-card border-border-subtle rounded-[var(--radius-card)] border shadow-[var(--shadow-input)]">
          <div className="flex items-center gap-3 p-3">
            {/* Personas dropdown on far left */}
            {showPersonas && (
              <PersonasDropdown
                selectedPersona={selectedPersona}
                onPersonaSelect={onPersonaSelect}
              />
            )}

            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Reply to Gen.C..."
                className="placeholder:text-neutral-500 w-full resize-none border-0 bg-transparent font-sans text-sm outline-none shadow-none ring-0 focus:ring-0 focus:outline-none focus:shadow-none"
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
