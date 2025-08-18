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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>("Untitled Chat");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");

  // Slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutContent, setSlideoutContent] = useState<string>("");
  const [slideoutTitle, setSlideoutTitle] = useState<string>("AI Response");

  // Animation refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  // FLIP animation for hero to chat expansion
  const expandFromHero = useCallback(() => {
    if (!containerRef.current || isTransitioning) return;

    const container = containerRef.current;
    setIsTransitioning(true);

    // Capture first state (hero)
    const firstRect = container.getBoundingClientRect();

    // Apply expanded state
    setIsHeroState(false);

    // Force layout calculation
    container.offsetHeight;

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
        setIsTransitioning(false);
        container.classList.remove("transitioning");
        container.removeEventListener("transitionend", cleanup);
      };

      container.addEventListener("transitionend", cleanup, { once: true });

      // Fallback cleanup after max duration
      setTimeout(cleanup, 500);
    });
  }, [isTransitioning]);

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
      {/* Main Content Area with smooth transitions */}
      <main
        ref={containerRef}
        className={`chat-container main-content gpu-accelerated relative flex min-h-screen w-full flex-col ${
          isHeroState ? "hero-state" : "expanded"
        } ${isSlideoutOpen ? "slideout-open" : ""}`}
      >
        <div className="relative z-0 flex w-full flex-1 flex-col">
          {/* Chat Interface - revealed after hero expansion */}
          <div className="chat-interface">
            {/* Sticky Header - shown only in expanded state */}
            {!isHeroState && (
              <div className="bg-background border-border sticky top-0 z-10 -mb-6 border-b">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 -z-10"
                  style={{
                    bottom: "-20px",
                    backgroundImage: "linear-gradient(var(--background), var(--background) 65%, rgba(0,0,0,0))",
                    filter: "blur(4px)",
                  }}
                />
                <div className="flex h-12 w-full items-center justify-between pr-3 pl-8">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <input
                      ref={titleInputRef}
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      placeholder="Untitled Chat"
                      className="text-foreground placeholder:text-muted-foreground hover:border-input focus:border-input focus-ring w-full max-w-sm rounded-[var(--radius-input)] border border-transparent bg-transparent px-3 py-2 text-sm font-medium transition-all duration-200 outline-none"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="interactive-element rounded-[var(--radius-button)]"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            const el = titleInputRef.current;
                            if (el) {
                              el.focus();
                              el.select();
                            }
                          }}
                        >
                          Rename title
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit options</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <CollectionCombobox
                      selectedCollectionId={selectedCollectionId}
                      onChange={setSelectedCollectionId}
                      placeholder="Select collection"
                      className="hidden sm:flex"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chat Component with enhanced positioning */}
            <div className={isHeroState ? "-mt-24 md:-mt-32" : ""}>
              <ClaudeChat
                initialPrompt={initialPrompt}
                initialPersona={initialPersona}
                onSend={(msg: string) => {
                  if (isHeroState && msg.trim()) {
                    // Trigger smooth expansion
                    expandFromHero();
                    
                    // Update title if needed
                    if (chatTitle === "Untitled Chat" && msg.length > 0) {
                      const truncatedTitle = msg.length > 30 ? msg.substring(0, 30) + "..." : msg;
                      setChatTitle(truncatedTitle);
                    }
                  }
                }}
                onHeroStateChange={(isHero: boolean) => {
                  if (!isHero && isHeroState) {
                    expandFromHero();
                  }
                }}
                // When an assistant answer is appended, broadcast event
                onAnswerReady={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("write:answer-ready"));
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Slideout Backdrop for tablet/mobile */}
      {isSlideoutOpen && (
                <>
          <div
            className={`slideout-backdrop md:hidden ${isSlideoutOpen ? "open" : ""}`}
            onClick={handleSlideoutClose}
            aria-hidden="true"
          />
          <div
            className={`slideout-backdrop hidden md:block lg:hidden ${isSlideoutOpen ? "open" : ""}`}
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
