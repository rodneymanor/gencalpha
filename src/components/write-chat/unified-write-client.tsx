"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

//

import { type PersonaType } from "@/components/chatbot/persona-selector";
import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { Button } from "@/components/ui/button";
//
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import ClaudeChat from "@/components/write-chat/claude-chat";

export function UnifiedWriteClient({
  initialPrompt,
  initialPersona,
}: {
  initialPrompt?: string;
  initialPersona?: PersonaType;
}) {
  // State management
  const [isHeroState, setIsHeroState] = useState(true);
  // Unused legacy states/refs removed to satisfy lints

  // Slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutContent, setSlideoutContent] = useState<string>("");
  const [slideoutTitle, setSlideoutTitle] = useState<string>("AI Response");

  // Animation refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  //

  // Handle slideout opening with content adjustment
  const handleSlideoutOpen = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.classList.add("slideout-open");
    }
    setIsSlideoutOpen(true);
  }, []);

  const handleSlideoutClose = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.classList.remove("slideout-open");
    }
    setIsSlideoutOpen(false);

    // Optional: dispatch close event for compatibility
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }
  }, []);

  // Listen for content from chat responses
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleEditorContent = (e: Event) => {
      const event = e as CustomEvent<{
        markdown?: string;
        blocks?: unknown[];
        title?: string;
      }>;
      const detail = event.detail;

      // Set content and title
      setSlideoutContent(detail.markdown ?? "");
      setSlideoutTitle(detail.title ?? "AI Response");
      handleSlideoutOpen();
    };

    const handleAnswerReady = () => {
      // This event is fired when a chat answer is ready
      // The content will be set via the editor-set-content event
    };

    window.addEventListener("write:editor-set-content", handleEditorContent as EventListener);
    window.addEventListener("write:answer-ready", handleAnswerReady as EventListener);

    return () => {
      window.removeEventListener("write:editor-set-content", handleEditorContent as EventListener);
      window.removeEventListener("write:answer-ready", handleAnswerReady as EventListener);
    };
  }, [handleSlideoutOpen]);

  return (
    <div className="slideout-layout-container">
      {/* Main Content Area - Flexbox approach */}
      <main ref={containerRef} className="main-content">
        {/* Claude Chat with built-in transitions */}
        <ClaudeChat
          initialPrompt={initialPrompt}
          initialPersona={initialPersona}
          onHeroStateChange={(isHero: boolean) => {
            setIsHeroState(isHero);
          }}
          /* When an assistant answer is appended, broadcast event */
          onAnswerReady={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("write:answer-ready"));
            }
          }}
        />
      </main>

      {/* Slideout Backdrop for tablet/mobile - Only show when needed */}
      {isSlideoutOpen && (
        <div
          className={`slideout-backdrop ${isSlideoutOpen ? "open" : ""}`}
          onClick={handleSlideoutClose}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Unified Slideout with flexbox approach */}
      <div className={`slideout-panel ${isSlideoutOpen ? "open" : ""}`} data-panel-width={ClaudeArtifactConfig.width}>
        <UnifiedSlideout
          isOpen={isSlideoutOpen}
          onClose={handleSlideoutClose}
          title={slideoutTitle}
          config={{
            ...ClaudeArtifactConfig,
            // Simplified configuration for flexbox approach
            animationType: "claude",
            adjustsContent: false, // No longer needed with flexbox
          }}
          className="h-full w-full"
          contentClassName="slideout-content animation-container"
          headerActions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="interactive-element rounded-[var(--radius-button)]"
                onClick={() => {
                  // Copy content to clipboard with feedback
                  if (slideoutContent) {
                    navigator.clipboard.writeText(slideoutContent);
                    // TODO: Add toast notification
                  }
                }}
              >
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="interactive-element rounded-[var(--radius-button)]"
                onClick={() => {
                  // Placeholder for publish functionality
                  console.log("Publish clicked");
                  // TODO: Implement publish workflow
                }}
              >
                Publish
              </Button>
            </div>
          }
        >
          {/* Enhanced BlockNote Editor with smooth content loading */}
          <div className="slideout-content h-full">
            <div className="fade-in">
              <MinimalSlideoutEditor
                initialValue={slideoutContent}
                onChange={(value) => {
                  // Handle editor changes if needed
                  console.log("Editor content changed:", value);
                }}
              />
            </div>
          </div>
        </UnifiedSlideout>
      </div>
    </div>
  );
}
