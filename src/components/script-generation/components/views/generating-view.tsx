"use client";

import React from "react";

import { ScriptGenerationTimeline } from "../../script-generation-timeline";
import type { PersonaOption } from "../../types/script-writer-types";

interface GeneratingViewProps {
  userPrompt: string;
  selectedPersona: PersonaOption | null;
  selectedQuickGenerator: string | null;
  onComplete: (script: string) => void;
}

export function GeneratingView({
  userPrompt,
  selectedPersona,
  selectedQuickGenerator,
  onComplete,
}: GeneratingViewProps) {
  return (
    <ScriptGenerationTimeline
      isActive={true}
      onComplete={onComplete}
      userPrompt={userPrompt}
      selectedPersona={selectedPersona}
      selectedQuickGenerator={selectedQuickGenerator}
    />
  );
}
