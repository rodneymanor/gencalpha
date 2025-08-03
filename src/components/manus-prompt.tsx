"use client";

import React, { useState } from "react";

import { ArrowUp } from "lucide-react";

import HelpNotificationsButtons from "@/components/help-notifications-buttons";
import { PersonaSelector, PersonaType } from "@/components/chatbot/persona-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { cn } from "@/lib/utils";

interface ManusPromptProps {
  greeting?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: (prompt: string, persona: PersonaType) => void;
}

export const ManusPrompt: React.FC<ManusPromptProps> = ({
  greeting = "Hello",
  subtitle = "What will you script today?",
  placeholder = "Give Gen.C a topic to script...",
  className,
  onSubmit,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("MiniBuddy");
  const { toggleChatbotPanel } = useResizableLayout();

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    // Open the chatbot panel with the initial prompt and persona
    toggleChatbotPanel(prompt.trim(), selectedPersona);
    
    // Call the optional onSubmit callback with the prompt and persona
    onSubmit?.(prompt.trim(), selectedPersona);
    
    // Clear the input
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("mx-auto my-24 w-full max-w-3xl min-w-[390px] space-y-4 px-5 text-base", className)}>
      {/* Header */}
      <header className="flex w-full items-end justify-between pb-4 pl-4">
        <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
          {greeting}
          <br />
          <span className="text-muted-foreground">{subtitle}</span>
        </h1>
      </header>

      {/* Input Card */}
      <div className="bg-background rounded-3xl border shadow-md">
        <div className="flex max-h-72 flex-col space-y-3 py-3">
          <div className="overflow-y-auto px-4">
            <Textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="resize-none border-0 bg-transparent focus-visible:ring-0"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 px-3">
            <HelpNotificationsButtons />

            <span className="flex-1" />

            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className={cn(
                "size-9 rounded-full transition-colors",
                prompt.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Persona Selector */}
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-sm font-medium text-foreground">Choose your assistant:</span>
        </div>
        <PersonaSelector
          selectedPersona={selectedPersona}
          onPersonaChange={setSelectedPersona}
          className="justify-center"
        />
      </div>
    </div>
  );
};

export default ManusPrompt;
