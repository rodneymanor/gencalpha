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
export function TranscriptionLoader({
  steps,
  currentStepIndex,
  className = "",
}: TranscriptionLoaderProps) {
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Processing Video
            </h2>
            <p className="text-muted-foreground">
              AI is transcribing your content...
            </p>
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
              className={`
                flex items-center space-x-4 p-4 rounded-[var(--radius-card)] border transition-all duration-500
                ${isActive ? 'border-primary bg-primary/5 shadow-sm' : ''}
                ${isCompleted ? 'border-green-200 bg-green-50' : ''}
                ${isPending ? 'border-border bg-muted/30' : ''}
              `}
            >
              {/* Status Icon */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${isActive ? 'bg-primary text-primary-foreground' : ''}
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isPending ? 'bg-muted text-muted-foreground' : ''}
              `}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <p className={`
                  text-sm font-medium transition-colors
                  ${isActive ? 'text-foreground' : ''}
                  ${isCompleted ? 'text-foreground' : ''}
                  ${isPending ? 'text-muted-foreground' : ''}
                `}>
                  {step.label}
                </p>
                <p className={`
                  text-xs transition-colors mt-1
                  ${isActive ? 'text-muted-foreground' : ''}
                  ${isCompleted ? 'text-muted-foreground' : ''}
                  ${isPending ? 'text-muted-foreground/70' : ''}
                `}>
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div className="mt-8 text-center">
        <div className="text-xs text-muted-foreground">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
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
