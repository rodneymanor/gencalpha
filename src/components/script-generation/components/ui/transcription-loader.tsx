import React from "react";

import { Loader2, CheckCircle2 } from "lucide-react";

import type { TranscriptionStepData } from "../../types/script-writer-types";

interface TranscriptionLoaderProps {
  steps: TranscriptionStepData[];
  currentStepIndex: number;
  className?: string;
}

/**
 * Transcription progress loader component
 * Shows the current transcription process with animated steps
 */
export function TranscriptionLoader({ steps, currentStepIndex, className = "" }: TranscriptionLoaderProps) {
  return (
    <div className={`mx-auto max-w-md ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center space-x-3">
          <div className="relative">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold">Processing Video</h2>
            <p className="text-muted-foreground">AI is transcribing your content...</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-4 rounded-[var(--radius-card)] border p-4 transition-all duration-500 ${isActive ? "border-primary bg-primary/5 shadow-sm" : ""} ${isCompleted ? "border-green-200 bg-green-50" : ""} ${isPending ? "border-border bg-muted/30" : ""} `}
            >
              {/* Status Icon */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isActive ? "bg-primary text-primary-foreground" : ""} ${isCompleted ? "bg-green-500 text-white" : ""} ${isPending ? "bg-muted text-muted-foreground" : ""} `}
              >
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : ""} ${isCompleted ? "text-foreground" : ""} ${isPending ? "text-muted-foreground" : ""} `}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-1 text-xs transition-colors ${isActive ? "text-muted-foreground" : ""} ${isCompleted ? "text-muted-foreground" : ""} ${isPending ? "text-muted-foreground/70" : ""} `}
                >
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div className="mt-8 text-center">
        <div className="text-muted-foreground text-xs">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </div>
        <div className="bg-muted mt-2 h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
