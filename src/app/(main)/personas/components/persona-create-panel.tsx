// Persona creation panel component

"use client";

import React from "react";

import { type CustomTabLabels } from "@/components/panels/notion/NotionPanel";
import NotionPanelWrapper from "@/components/panels/notion/NotionPanelWrapper";
import { PersonaCreateContent } from "@/components/persona-details-panel/persona-create-content";

import type { AnalysisProgress, AnalysisMode } from "../types";

interface PersonaCreatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (input: string | string[], mode: AnalysisMode) => Promise<void>;
  isAnalyzing: boolean;
  analysisProgress: AnalysisProgress | null;
  analysisError: string;
}

export function PersonaCreatePanel({
  isOpen,
  onClose,
  onAnalyze,
  isAnalyzing,
  analysisProgress,
  analysisError,
}: PersonaCreatePanelProps) {
  return (
    <NotionPanelWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Create Voice Persona"
      showPageControls={false}
      showHeaderControls={true}
      width={600}
      isNewIdea={false}
      tabData={{
        video: (
          <PersonaCreateContent
            activeTab="profile"
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
            analysisError={analysisError}
          />
        ),
        transcript: (
          <PersonaCreateContent
            activeTab="videos"
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
            analysisError={analysisError}
          />
        ),
      }}
      defaultTab={"video"}
      customTabLabels={
        {
          video: "From Profile",
          transcript: "From Videos",
        } as CustomTabLabels
      }
    >
      {/* Content is handled by tabData */}
    </NotionPanelWrapper>
  );
}
