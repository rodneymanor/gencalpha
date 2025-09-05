"use client";

import React from "react";
import ChatInput from "@/components/ChatInterface/ChatInput";
import { ContentGeneratorCards } from "@/components/content-generator-cards";
import type { PersonaOption } from "../../types/script-writer-types";
import type { QuickGenerator, Template } from "../../types";

interface InputViewProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (value: string) => void;
  selectedPersona: PersonaOption | null;
  onPersonaSelect: (personaId: string) => void;
  quickGenerators: QuickGenerator[];
  templates: Template[];
  selectedQuickGenerator?: string;
  selectedTemplate?: string;
  onQuickGeneratorSelect: (generator: any) => void;
  onTemplateSelect: (template: any) => void;
  onCreateCustomTemplate: () => void;
  className?: string;
}

export function InputView({
  inputValue,
  setInputValue,
  onSubmit,
  selectedPersona,
  onPersonaSelect,
  quickGenerators,
  templates,
  selectedQuickGenerator,
  selectedTemplate,
  onQuickGeneratorSelect,
  onTemplateSelect,
  onCreateCustomTemplate,
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
            <h1 className="mb-6 md:text-4xl text-2xl md:leading-10 leading-8 font-bold tracking-tight">
              <span className="text-foreground">Ready to create something amazing?</span>
              <br />
              <span className="text-brand">Let&apos;s write your script.</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg text-base">
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
              showTrending={true}
              showPersonas={true}
              selectedPersona={selectedPersona?.id}
              onPersonaSelect={onPersonaSelect}
            />
          </div>

          {/* ContentGeneratorCards - Templates and Quick Generators */}
          <div className="mx-auto w-full max-w-5xl">
            <ContentGeneratorCards
              quickGenerators={quickGenerators}
              templates={templates}
              selectedQuickGenerator={selectedQuickGenerator}
              selectedTemplate={selectedTemplate}
              onQuickGeneratorSelect={onQuickGeneratorSelect}
              onTemplateSelect={onTemplateSelect}
              onCreateCustomTemplate={onCreateCustomTemplate}
            />
            <div className="text-muted-foreground mt-6 text-center text-sm">
              💡 Tip: Be specific about your topic and target audience for better results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}