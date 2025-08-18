"use client";

import React, { useRef, useState, useEffect } from "react";

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
  const [isHeroState, setIsHeroState] = useState(true);
  const [chatTitle, setChatTitle] = useState<string>("Untitled Chat");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");

  // Unified slideout state
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutContent, setSlideoutContent] = useState<string>("");
  const [slideoutTitle, setSlideoutTitle] = useState<string>("AI Response");

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
      setIsSlideoutOpen(true);
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
  }, []);

  const handleCloseSlideout = () => {
    setIsSlideoutOpen(false);
    // Optional: dispatch close event for compatibility
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }
  };

  return (
    <>
      <main className="relative flex min-h-screen w-full flex-col">
        <div className="relative z-0 flex w-full flex-1 flex-col">
          {/* Hero state with centered layout */}
          {isHeroState && (
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                  <h1 className="text-foreground mb-4 text-4xl font-bold md:text-6xl">What would you like to write?</h1>
                </div>
              </div>
            </div>
          )}

          {/* Non-hero state with sticky header */}
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
                    className="text-foreground placeholder:text-muted-foreground hover:border-input focus:border-input w-full max-w-sm rounded-[var(--radius-input)] border border-transparent bg-transparent px-3 py-2 text-sm font-medium outline-none"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-[var(--radius-button)]">
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

          <div className={isHeroState ? "-mt-24 md:-mt-32" : ""}>
            <ClaudeChat
              initialPrompt={initialPrompt}
              initialPersona={initialPersona}
              onSend={(msg: string) => {
                if (isHeroState && msg.trim()) {
                  setIsHeroState(false);
                  if (chatTitle === "Untitled Chat" && msg.length > 0) {
                    const truncatedTitle = msg.length > 30 ? msg.substring(0, 30) + "..." : msg;
                    setChatTitle(truncatedTitle);
                  }
                }
              }}
              onHeroStateChange={(isHero: boolean) => {
                setIsHeroState(isHero);
              }}
              // When an assistant answer is appended, broadcast event (will be handled by our listener)
              onAnswerReady={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("write:answer-ready"));
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Unified Slideout for AI Responses */}
      <UnifiedSlideout
        isOpen={isSlideoutOpen}
        onClose={handleCloseSlideout}
        title={slideoutTitle}
        config={ClaudeArtifactConfig}
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Copy content to clipboard
                if (slideoutContent) {
                  navigator.clipboard.writeText(slideoutContent);
                }
              }}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Placeholder for publish functionality
                console.log("Publish clicked");
              }}
            >
              Publish
            </Button>
          </div>
        }
      >
        {/* BlockNote Editor for structured content */}
        <div className="h-full">
          <MinimalSlideoutEditor
            initialValue={slideoutContent}
            onChange={(value) => {
              // Handle editor changes if needed
              console.log("Editor content changed:", value);
            }}
          />
        </div>
      </UnifiedSlideout>
    </>
  );
}
