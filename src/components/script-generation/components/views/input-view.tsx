"use client";

import React from "react";

import ChatInput from "@/components/ChatInterface/chat-input";
import { useAuth } from "@/contexts/auth-context";

import type { PersonaOption } from "../../types/script-writer-types";

interface InputViewProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (value: string) => void;
  selectedPersona: PersonaOption | null;
  onPersonaSelect: (personaId: string) => void;
  selectedGenerator?: "hook" | "template" | null;
  onGeneratorSelect?: (generator: "hook" | "template") => void;
  className?: string;
  onBrandModalOpen?: () => void;
  heroBanner?: React.ReactNode;
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
  onBrandModalOpen,
  heroBanner,
}: InputViewProps) {
  const { user, userProfile } = useAuth();

  // Get the first letter of the user's name
  const userName = userProfile?.displayName || user?.displayName || user?.email || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className={`bg-background flex min-h-screen flex-col ${className}`}>
      {/* Brand Settings Icon - Fixed position in upper right */}
      <button
        onClick={() => onBrandModalOpen?.()}
        className="fixed top-6 right-6 z-10 flex h-8 w-8 items-center justify-center transition-all duration-200 hover:opacity-80"
        aria-label="Brand Settings"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" stroke="#667eea" strokeWidth="1" strokeDasharray="4 3" strokeLinecap="round" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="#667eea"
            fontFamily="Arial, sans-serif"
            fontSize="11"
            fontWeight="600"
          >
            {userInitial}
          </text>
        </svg>
      </button>

      {/* Flex container for centering content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero content - centered */}
        <div className="w-full max-w-4xl text-center">
          {/* Hero headline */}
          <div className="mb-8">
            {heroBanner && (
              <div className="mb-8 flex justify-center">{heroBanner}</div>
            )}
            <h1 className="mb-5 text-2xl leading-8 font-bold tracking-tight md:text-4xl md:leading-10">
              <span className="text-foreground">Ready to create something amazing?</span>
              <br />
              <span className="text-brand inline-flex items-center gap-2">
                Let&apos;s write your script.
                <span aria-hidden="true" role="img">
                  💡
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-base md:text-lg">
              Tell me what you want to create, and I&apos;ll help you craft the perfect script.
            </p>
          </div>

          {/* Input field */}
          <div className="mx-auto mb-6 w-full max-w-2xl">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={onSubmit}
              placeholder="Write a script about... or paste an Instagram/TikTok URL"
              disabled={false}
              showTimeLimit={false}
              showSettings={false}
              showTrending={false} // Disabled RSS feed dropdown
              showPersonas={false}
              selectedPersona={selectedPersona?.id}
              onPersonaSelect={onPersonaSelect}
              selectedGenerator={selectedGenerator}
              onGeneratorSelect={onGeneratorSelect}
            />
          </div>

          {/* Tip */}
          <div className="text-muted-foreground mt-2 text-center text-sm">
            * Tip: Be specific about your topic and target audience for better results
          </div>
        </div>
      </div>
    </div>
  );
}
