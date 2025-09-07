"use client";

import React from "react";

import ChatInput from "@/components/ChatInterface/chat-input";
import type { PersonaOption } from "../../types/script-writer-types";

interface InputViewProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (value: string) => void;
  selectedPersona: PersonaOption | null;
  onPersonaSelect: (personaId: string) => void;
  selectedGenerator?: 'hook' | 'template' | null;
  onGeneratorSelect?: (generator: 'hook' | 'template') => void;
  className?: string;
}

export function InputView({
  inputValue,
  setInputValue,
  onSubmit,
  selectedPersona,
  onPersonaSelect,
  selectedGenerator,
  onGeneratorSelect,
  className = "",
}: InputViewProps) {
  return (
    <div className={`bg-background flex min-h-screen flex-col ${className}`}>
      {/* Flex container for centering content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Hero content - centered */}
        <div className="w-full max-w-4xl text-center">
          {/* Hero headline */}
          <div className="mb-8">
            <h1 className="mb-6 text-2xl leading-8 font-bold tracking-tight md:text-4xl md:leading-10">
              <span className="text-foreground">Ready to create something amazing?</span>
              <br />
              <span className="text-brand">Let&apos;s write your script.</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
              Tell me what you want to create, and I&apos;ll help you craft the perfect script.
            </p>
          </div>

          {/* Input field */}
          <div className="mx-auto mb-8 w-full max-w-3xl">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={onSubmit}
              placeholder="Write a script about... or paste an Instagram/TikTok URL"
              disabled={false}
              showTimeLimit={false}
              showSettings={false}
              showTrending={false} // Disabled RSS feed dropdown
              showPersonas={true}
              selectedPersona={selectedPersona?.id}
              onPersonaSelect={onPersonaSelect}
              selectedGenerator={selectedGenerator}
              onGeneratorSelect={onGeneratorSelect}
            />
          </div>

          {/* Tip */}
          <div className="text-muted-foreground mt-6 text-center text-sm">
            💡 Tip: Be specific about your topic and target audience for better results
          </div>
        </div>
      </div>
    </div>
  );
}
