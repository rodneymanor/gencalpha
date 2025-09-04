import React from "react";

import { TRANSCRIPTION_STEPS } from "../../utils/constants";
import { TranscriptionLoader } from "../ui/transcription-loader";

interface TranscribingViewProps {
  className?: string;
  onBackToInput: () => void;
}

/**
 * Transcribing view component showing transcription progress
 * Extracted from lines 527-577 of the original component
 */
export function TranscribingView({ className = "", onBackToInput }: TranscribingViewProps) {
  return (
    <div className={`bg-background flex min-h-screen flex-col ${className}`}>
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBackToInput}
          className="text-muted-foreground hover:text-foreground hover:bg-background-hover flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center">
        {/* Transcription Loader */}
        <TranscriptionLoader steps={TRANSCRIPTION_STEPS} currentStepIndex={1} />
      </div>
    </div>
  );
}
