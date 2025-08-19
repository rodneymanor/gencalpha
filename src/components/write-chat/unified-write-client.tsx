"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

import { ChevronDown } from "lucide-react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { Button } from "@/components/ui/button";
import { CollectionCombobox } from "@/components/ui/collection-combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [_isTransitioning, _setIsTransitioning] = useState(false);
  const [_chatTitle, _setChatTitle] = useState<string>("Untitled Chat");
  const _titleInputRef = useRef<HTMLInputElement | null>(null);
  const [_selectedCollectionId, _setSelectedCollectionId] = useState<string>("all-videos");

  // Slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutContent, setSlideoutContent] = useState<string>("");
  const [slideoutTitle, setSlideoutTitle] = useState<string>("AI Response");

  // Animation refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  // FLIP animation for hero to chat expansion (unused in Claude-style implementation)
  const _expandFromHero = useCallback(() => {
    if (!containerRef.current || _isTransitioning) return;

    const container = containerRef.current;
    _setIsTransitioning(true);

    // Capture first state (hero)
    const firstRect = container.getBoundingClientRect();

    // Apply expanded state
    setIsHeroState(false);

    // Force layout calculation
    void container.offsetHeight;

    // Capture last state (expanded)
    const lastRect = container.getBoundingClientRect();

    // Calculate difference
    const deltaY = firstRect.top - lastRect.top;

    // Apply initial transform to match first state
    container.style.transform = `translateY(${deltaY}px)`;
    container.classList.add("transitioning");

    // Animate to final position
    requestAnimationFrame(() => {
      container.style.transform = "";

      // Clean up after animation
      const cleanup = () => {
        _setIsTransitioning(false);
        container.classList.remove("transitioning");
        container.removeEventListener("transitionend", cleanup);
      };

      container.addEventListener("transitionend", cleanup, { once: true });

      // Fallback cleanup after max duration
      setTimeout(cleanup, 500);
    });
  }, [_isTransitioning]);

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
    <>
      {/* Simplified wrapper for Claude-style chat */}
      <main
        ref={containerRef}
        className={`main-content relative w-full ${isSlideoutOpen ? "slideout-open" : ""}`}
      >
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

      {/* Slideout Backdrop for tablet/mobile */}
      {isSlideoutOpen && (
                <>
          <div
            className="slideout-backdrop md:hidden open"
            onClick={handleSlideoutClose}
            aria-hidden="true"
          />
          <div
            className="slideout-backdrop hidden md:block lg:hidden open"
            onClick={handleSlideoutClose}
            aria-hidden="true"
          />
        </>
      )}

      {/* Enhanced Unified Slideout with smooth transitions */}
      <UnifiedSlideout
        isOpen={isSlideoutOpen}
        onClose={handleSlideoutClose}
        title={slideoutTitle}
        config={{
          ...ClaudeArtifactConfig,
          // Enhanced Claude-style configuration
          animationType: "claude",
          adjustsContent: true,
          responsive: {
            mobile: "takeover",
            tablet: "overlay",
            desktop: "sidebar",
          },
        }}
        className={`slideout-panel gpu-accelerated ${isSlideoutOpen ? "open" : ""}`}
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
    </>
  );
}
