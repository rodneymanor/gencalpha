"use client";

import React from "react";

import { Send } from "lucide-react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import { MarkdownSlideout } from "@/components/slideouts/markdown-slideout";
import { Button } from "@/components/ui/button";
import { WriteClient } from "@/components/write-chat/write-client";

interface SlideoutWrapperProps {
  initialPrompt?: string;
  initialPersona?: PersonaType;
  remountKey?: string;
}

export function SlideoutWrapper({ initialPrompt, initialPersona, remountKey }: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const sampleMarkdown = `# AI Prompt: Generate 3 Fresh Content Ideas from Video Transcript\n\n- Provide three distinct angles\n- Keep audience the same\n- Explore new perspectives\n\n## Input Required\nPaste transcript here...`;

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate async work
    await new Promise((r) => setTimeout(r, 900));
    setIsPublishing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sampleMarkdown);
    } catch {
      // no-op
    }
  };

  return (
    <div className="text-foreground bg-background font-sans">
      <div className="flex w-full items-start">
        {/* Main content area shrinks on large screens when slideout is open */}
        <div className={["transition-all duration-300", isOpen ? "w-full lg:w-1/2" : "w-full"].join(" ")}>
          <div className="border-border flex items-center justify-end border-b px-4 py-3">
            <Button variant="default" className="rounded-[var(--radius-button)]" onClick={() => setIsOpen(true)}>
              <Send className="mr-2 h-4 w-4" /> Test Slideout
            </Button>
          </div>

          <div className="min-h-[60vh]">
            <WriteClient key={remountKey} initialPrompt={initialPrompt} initialPersona={initialPersona} />
          </div>
        </div>

        {/* Spacer to visually create split when sheet overlays; only on large screens */}
        {isOpen ? <div className="hidden w-[32rem] shrink-0 lg:block" aria-hidden /> : null}
      </div>

      <MarkdownSlideout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Content Preview"
        markdown={sampleMarkdown}
        side="right"
        onCopy={handleCopy}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
}
