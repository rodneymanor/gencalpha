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
    <div className="flex min-h-[100dvh] w-full flex-col font-sans">
      {/* Toggle control (temporary test button) */}
      <div className="mb-4 flex w-full justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-[var(--radius-button)]"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Close Test Slideout" : "Open Test Slideout"}
        </Button>
      </div>

      <div className={cn("relative flex flex-1 overflow-hidden")}>
        {/* Left: Main content area (Claude chat) */}
        <div className={cn("min-h-0 transition-all duration-300", isOpen ? "hidden lg:flex lg:w-1/2" : "flex w-full")}>
          <div className="flex w-full flex-col">
            <WriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />
          </div>
        </div>

        {/* Right: Slideout panel (standalone) */}
        <div
          className={cn(
            "border-border bg-card absolute inset-y-0 right-0 z-30 w-full max-w-full border-l shadow-[var(--shadow-soft-drop)] transition-transform duration-300 lg:static lg:h-auto lg:w-1/2",
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
