"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

//

import { type AssistantType } from "@/components/chatbot/persona-selector";
import { ScriptPanel } from "@/components/script-panel";
//
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import ClaudeChat from "@/components/write-chat/claude-chat";
import type { ScriptData, ScriptComponent } from "@/types/script-panel";

export function UnifiedWriteClient({
  initialPrompt,
  initialAssistant,
}: {
  initialPrompt?: string;
  initialAssistant?: AssistantType;
}) {
  // State management
  const [isHeroState, setIsHeroState] = useState(true);
  // Unused legacy states/refs removed to satisfy lints

  // Slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);

  // Animation refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Helper function to generate ScriptData from markdown content
  const generateScriptData = useCallback((content: string, title?: string): ScriptData => {
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const estimatedDuration = Math.ceil(wordCount / 2.5); // ~2.5 words per second for speech

    // Basic component parsing (this could be enhanced with actual AI analysis)
    const components: ScriptComponent[] = [];
    const lines = content.split("\n").filter((line) => line.trim().length > 0);

    if (lines.length > 0) {
      // Create a basic hook component from the first few lines
      const hookContent = lines.slice(0, Math.min(2, lines.length)).join(" ");
      if (hookContent.trim()) {
        components.push({
          id: "hook-1",
          type: "hook",
          label: "Opening Hook",
          content: hookContent,
          wordCount: hookContent.split(/\s+/).length,
          estimatedDuration: Math.ceil(hookContent.split(/\s+/).length / 2.5),
        });
      }

      // If there's more content, create a value proposition component
      if (lines.length > 2) {
        const valueContent = lines.slice(2).join(" ");
        components.push({
          id: "value-1",
          type: "value",
          label: "Value Proposition",
          content: valueContent,
          wordCount: valueContent.split(/\s+/).length,
          estimatedDuration: Math.ceil(valueContent.split(/\s+/).length / 2.5),
        });
      }
    }

    return {
      id: `script-${Date.now()}`,
      title: title ?? "Generated Script",
      fullScript: content,
      components,
      metrics: {
        totalWords: wordCount,
        totalDuration: estimatedDuration,
        avgWordsPerSecond: 2.5,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: "1.0",
    };
  }, []);

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

      if (detail.markdown) {
        setIsLoadingScript(true);
        // Generate script data from markdown content
        const newScriptData = generateScriptData(detail.markdown, detail.title ?? undefined);
        setScriptData(newScriptData);
        setIsLoadingScript(false);
        handleSlideoutOpen();
      }
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
  }, [handleSlideoutOpen, generateScriptData]);

  return (
    <div className={`slideout-layout-container ${isHeroState ? "hero-mode" : "chat-mode"}`}>
      {/* Main Content Area - Flexbox approach */}
      <main ref={containerRef} className="main-content">
        {/* Claude Chat with built-in transitions */}
        <ClaudeChat
          initialPrompt={initialPrompt}
          initialAssistant={initialAssistant}
          onHeroStateChange={(isHero: boolean) => {
            setIsHeroState(isHero);
            // Hero state affects the layout behavior
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

      {/* Enhanced Unified Slideout with ScriptPanel */}
      <div className={`slideout-panel ${isSlideoutOpen ? "open" : ""}`} data-panel-width={ClaudeArtifactConfig.width}>
        <UnifiedSlideout
          isOpen={isSlideoutOpen}
          onClose={handleSlideoutClose}
          title={scriptData?.title ?? "Generated Script"}
          config={{
            ...ClaudeArtifactConfig,
            // Simplified configuration for flexbox approach
            animationType: "claude",
            adjustsContent: false, // No longer needed with flexbox
            showHeader: false, // ScriptPanel has its own header
          }}
          className="h-full w-full"
          contentClassName="slideout-content animation-container"
        >
          {/* ScriptPanel with smooth content loading */}
          {scriptData ? (
            <ScriptPanel
              scriptData={scriptData}
              isLoading={isLoadingScript}
              onCopy={(content, componentType) => {
                // Copy to clipboard with feedback
                navigator.clipboard.writeText(content);
                console.log(`Copied ${componentType ?? "script"} content`);
                // TODO: Add toast notification
              }}
              onDownload={(scriptData) => {
                console.log("Download requested for:", scriptData.title);
                // TODO: Implement download workflow
              }}
              onClose={handleSlideoutClose}
              showDownload={true}
              showMetrics={true}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground text-sm">No script data available</div>
            </div>
          )}
        </UnifiedSlideout>
      </div>
    </div>
  );
}
