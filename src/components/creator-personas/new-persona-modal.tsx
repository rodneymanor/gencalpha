"use client";

import React, { useState } from "react";

import { X, Loader2, Sparkles, AlertCircle, Check, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoredPersona } from "@/lib/services/persona-storage";
import { cn } from "@/lib/utils";

// Interface for the modal props
interface NewPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonaCreated: (persona: StoredPersona) => void;
}

// Interface for generation state
interface GenerationState {
  step: "input" | "fetching" | "transcribing" | "analyzing" | "complete" | "error";
  progress: number;
  message: string;
  videosProcessed?: number;
  totalVideos?: number;
}

export function NewPersonaModal({ isOpen, onClose, onPersonaCreated }: NewPersonaModalProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [generationState, setGenerationState] = useState<GenerationState>({
    step: "input",
    progress: 0,
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Handle modal close
  const handleClose = () => {
    if (generationState.step === "input" || generationState.step === "complete" || generationState.step === "error") {
      setInputUrl("");
      setGenerationState({ step: "input", progress: 0, message: "" });
      setError(null);
      onClose();
    }
  };

  // Extract username from URL or handle direct username input
  const extractUsername = (input: string): { username: string; platform: "tiktok" | "instagram" } | null => {
    const trimmed = input.trim();

    // TikTok patterns
    if (trimmed.includes("tiktok.com")) {
      const match = trimmed.match(/@([^/?]+)/);
      return match ? { username: match[1], platform: "tiktok" } : null;
    }

    // Instagram patterns
    if (trimmed.includes("instagram.com")) {
      const match = trimmed.match(/instagram\.com\/([^/?]+)/);
      return match ? { username: match[1], platform: "instagram" } : null;
    }

    // Direct username with @ prefix
    if (trimmed.startsWith("@")) {
      return { username: trimmed.substring(1), platform: "tiktok" }; // Default to TikTok
    }

    // Direct username without @
    if (trimmed && !trimmed.includes("/") && !trimmed.includes(".")) {
      return { username: trimmed, platform: "tiktok" }; // Default to TikTok
    }

    return null;
  };

  // Process streaming response
  const processStreamUpdate = (data: string) => {
    if (data === "[DONE]") {
      setGenerationState({
        step: "complete",
        progress: 100,
        message: "Persona created successfully!",
      });
      return;
    }

    try {
      const update = JSON.parse(data);
      switch (update.type) {
        case "progress":
          setGenerationState({
            step: update.step,
            progress: update.progress,
            message: update.message,
            videosProcessed: update.videosProcessed,
            totalVideos: update.totalVideos,
          });
          break;
        case "complete":
          onPersonaCreated(update.persona);
          setGenerationState({
            step: "complete",
            progress: 100,
            message: "Persona created successfully!",
          });
          setTimeout(handleClose, 2000);
          break;
        case "error":
          throw new Error(update.message);
      }
    } catch (e) {
      console.error("Failed to parse update:", e);
    }
  };

  // Handle persona generation
  const handleGenerate = async () => {
    const extracted = extractUsername(inputUrl);

    if (!extracted) {
      setError("Please enter a valid TikTok or Instagram profile URL or username");
      return;
    }

    // Instagram check
    if (extracted.platform === "instagram") {
      setError("Instagram support is coming soon! Please use a TikTok profile for now.");
      return;
    }

    try {
      setError(null);

      // Step 1: Fetching user feed
      setGenerationState({
        step: "fetching",
        progress: 20,
        message: `Fetching videos from @${extracted.username}...`,
      });

      // Use simplified endpoint that doesn't require OpenAI
      const response = await fetch("/api/personas/generate-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: extracted.username,
          platform: extracted.platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to generate persona");
      }

      // Handle streaming updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Stream not available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            processStreamUpdate(data);
          }
        }
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGenerationState({
        step: "error",
        progress: 0,
        message: err instanceof Error ? err.message : "Failed to generate persona",
      });
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    // Full-page overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal content */}
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] bg-neutral-50 shadow-[var(--shadow-soft-drop)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <Sparkles className="text-primary-700 h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Create AI Persona</h2>
              <p className="text-sm text-neutral-600">Generate a persona from a creator&apos;s profile</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {generationState.step === "input" ? (
            // Input state
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Creator Profile URL or Username</label>
                <Input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g., @username or https://tiktok.com/@username"
                  className={cn(
                    "focus:border-primary-400 border-neutral-200 bg-neutral-50",
                    "placeholder:text-neutral-400",
                    error && "border-destructive-400",
                  )}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                {error && (
                  <div className="text-destructive-600 flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Platform support note */}
              <div className="space-y-2 rounded-[var(--radius-card)] bg-neutral-100 p-3">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Check className="text-success-600 h-4 w-4" />
                  <span>TikTok profiles supported</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Instagram support coming soon</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="flex-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="soft"
                  disabled={!inputUrl.trim()}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-900 flex-1"
                >
                  Generate Persona
                </Button>
              </div>
            </div>
          ) : (
            // Processing state
            <div className="space-y-4">
              {/* Progress indicator */}
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="relative">
                  <div className="bg-primary-100 flex h-16 w-16 items-center justify-center rounded-full">
                    {generationState.step === "complete" ? (
                      <Check className="text-primary-700 h-8 w-8" />
                    ) : generationState.step === "error" ? (
                      <X className="text-destructive-600 h-8 w-8" />
                    ) : (
                      <Loader2 className="text-primary-700 h-8 w-8 animate-spin" />
                    )}
                  </div>
                  {generationState.step !== "complete" && generationState.step !== "error" && (
                    <div className="absolute inset-0 rounded-full">
                      <svg className="h-16 w-16 -rotate-90 transform">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-neutral-200"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${generationState.progress * 1.76} 176`}
                          className="text-primary-500 transition-all duration-300"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Status message */}
                <div className="space-y-1 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      generationState.step === "complete"
                        ? "text-success-700"
                        : generationState.step === "error"
                          ? "text-destructive-700"
                          : "text-neutral-900",
                    )}
                  >
                    {generationState.message}
                  </p>
                  {generationState.videosProcessed !== undefined && (
                    <p className="text-xs text-neutral-600">
                      Processing video {generationState.videosProcessed} of {generationState.totalVideos}
                    </p>
                  )}
                </div>
              </div>

              {/* Step indicators */}
              {generationState.step !== "error" && (
                <div className="space-y-2">
                  {[
                    { step: "fetching", label: "Fetching creator's videos" },
                    { step: "transcribing", label: "Transcribing content" },
                    { step: "analyzing", label: "Analyzing voice patterns" },
                    { step: "complete", label: "Creating persona profile" },
                  ].map((item) => {
                    const isActive = item.step === generationState.step;
                    const isPast =
                      ["fetching", "transcribing", "analyzing", "complete"].indexOf(item.step) <
                      ["fetching", "transcribing", "analyzing", "complete"].indexOf(generationState.step);

                    return (
                      <div
                        key={item.step}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-button)] p-2 transition-all",
                          isActive && "bg-primary-50",
                          isPast && "opacity-60",
                        )}
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            isActive ? "bg-primary-500 animate-pulse" : isPast ? "bg-success-500" : "bg-neutral-300",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            isActive
                              ? "text-primary-900 font-medium"
                              : isPast
                                ? "text-neutral-600"
                                : "text-neutral-400",
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action buttons for error state */}
              {generationState.step === "error" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    className="flex-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="soft"
                    className="bg-primary-100 hover:bg-primary-200 text-primary-900 flex-1"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
