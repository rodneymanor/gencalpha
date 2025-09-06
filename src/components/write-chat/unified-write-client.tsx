"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

//

import { ScriptPanel } from "@/components/script-panel/script-panel";
import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { Button } from "@/components/ui/button";
//
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import ClaudeChat from "@/components/write-chat/claude-chat";
import { type ActionType } from "@/components/write-chat/persona-selector";
import { ScriptData } from "@/types/script-panel";

export function UnifiedWriteClient({
  initialPrompt,
  conversationIdToLoad,
  useActionSystem = true,
  onActionTrigger,
}: {
  initialPrompt?: string;
  conversationIdToLoad?: string;
  useActionSystem?: boolean;
  onActionTrigger?: (action: ActionType, prompt: string) => void;
}) {
  // State management
  const [_isHeroState, setIsHeroState] = useState(true);
  // Unused legacy states/refs removed to satisfy lints

  // Slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutContent, setSlideoutContent] = useState<string>("");
  const [slideoutTitle, setSlideoutTitle] = useState<string>("AI Response");
  const [slideoutType, setSlideoutType] = useState<"editor" | "script">("editor");
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  // Animation refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  //

  // Handle action triggers from the new system
  const handleActionTrigger = useCallback(
    (action: ActionType, prompt: string) => {
      console.log(`🎯 [UnifiedWriteClient] Action triggered: ${action} with prompt: ${prompt}`);

      // Call the external handler if provided
      if (onActionTrigger) {
        onActionTrigger(action, prompt);
      }

      // The action will be processed through the normal chat flow in ClaudeChat
      // This handler is mainly for tracking and external integration
    },
    [onActionTrigger],
  );

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

      // Set content and title for editor
      setSlideoutContent(detail.markdown ?? "");
      setSlideoutTitle(detail.title ?? "AI Response");
      setSlideoutType("editor");
      setScriptData(null);
      handleSlideoutOpen();
    };

    const handleScriptContent = (e: Event) => {
      const event = e as CustomEvent<{
        scriptData: ScriptData;
        title?: string;
      }>;
      const detail = event.detail;

      // Set script data for script panel
      setScriptData(detail.scriptData);
      setSlideoutTitle(detail.title ?? detail.scriptData.title ?? "Script");
      setSlideoutType("script");
      setSlideoutContent(""); // Clear markdown content
      handleSlideoutOpen();
    };

    const handleAnswerReady = () => {
      // This event is fired when a chat answer is ready
      // The content will be set via the editor-set-content or script-set-content event
    };

    window.addEventListener("write:editor-set-content", handleEditorContent as EventListener);
    window.addEventListener("write:script-set-content", handleScriptContent as EventListener);
    window.addEventListener("write:answer-ready", handleAnswerReady as EventListener);

    return () => {
      window.removeEventListener("write:editor-set-content", handleEditorContent as EventListener);
      window.removeEventListener("write:script-set-content", handleScriptContent as EventListener);
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
          conversationIdToLoad={conversationIdToLoad}
          useActionSystem={useActionSystem}
          onActionTrigger={handleActionTrigger}
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
          title={slideoutType === "editor" ? slideoutTitle : undefined}
          config={{
            ...ClaudeArtifactConfig,
            // Configure based on content type
            showHeader: slideoutType === "editor", // ScriptPanel handles its own header
            animationType: "claude",
            adjustsContent: false, // No longer needed with flexbox
          }}
          className="h-full w-full"
          contentClassName="slideout-content animation-container"
          headerActions={
            slideoutType === "editor" ? (
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
            ) : null
          }
        >
          {/* Conditional content based on slideout type */}
          <div className="slideout-content h-full">
            {slideoutType === "editor" ? (
              <div className="fade-in">
                <MinimalSlideoutEditor
                  initialValue={slideoutContent}
                  onChange={(value) => {
                    // Handle editor changes if needed
                    console.log("Editor content changed:", value);
                  }}
                />
              </div>
            ) : slideoutType === "script" && scriptData ? (
              <ScriptPanel
                scriptData={scriptData}
                onCopy={(content, componentType) => {
                  navigator.clipboard.writeText(content);
                  console.log(`Copied ${componentType ?? "content"}:`, content);
                }}
                onDownload={(data) => {
                  console.log("Downloaded script:", data.title);
                }}
                onClose={handleSlideoutClose}
                showDownload={true}
                showMetrics={true}
              />
            ) : null}
          </div>
        </UnifiedSlideout>
      </div>
    </div>
  );
}
