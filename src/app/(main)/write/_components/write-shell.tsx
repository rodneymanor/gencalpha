"use client";

import React, { useState } from "react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import ContentViewer from "@/components/standalone/content-viewer";
import { Button } from "@/components/ui/button";
import { WriteClient } from "@/components/write-chat/write-client";
import { cn } from "@/lib/utils";

export function WriteShell({
  initialPrompt,
  initialPersona,
}: {
  initialPrompt?: string;
  initialPersona?: PersonaType;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col font-sans">
      <div className="bg-background border-border sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4">
          <div className="text-sm font-medium">Write</div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[var(--radius-button)]"
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? "Close Test Slideout" : "Open Test Slideout"}
          </Button>
        </div>
      </div>

      <div className={cn("flex flex-1 overflow-hidden")}>
        {/* Left: Main content area (Claude chat) */}
        <div className={cn("transition-all duration-300", isOpen ? "hidden lg:flex lg:w-1/2" : "flex w-full")}>
          <div className="flex w-full flex-col">
            <WriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />
          </div>
        </div>

        {/* Right: Slideout panel (standalone) */}
        <div
          className={cn(
            "bg-card border-border fixed inset-y-12 right-0 z-30 w-full max-w-full border-l shadow-[var(--shadow-soft-drop)] transition-transform duration-300 lg:static lg:inset-auto lg:h-auto lg:w-1/2",
            isOpen ? "translate-x-0" : "translate-x-full lg:hidden lg:translate-x-0",
          )}
        >
          <ContentViewer
            isSlideOutOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onCopy={() => {
              navigator.clipboard.writeText("Example copied content").catch(() => {});
            }}
            onPublish={() => {
              console.log("Publish clicked");
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default WriteShell;
