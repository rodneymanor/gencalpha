"use client";

import { ChevronDown, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SlideoutHeaderActionsProps {
  selectedOption: string;
  isWritePage: boolean;
  variant: "default" | "profile";
}

export function SlideoutHeaderActions({ selectedOption, isWritePage, variant }: SlideoutHeaderActionsProps) {
  // Hide copy and publish buttons on write page, for creators/ideas views, or profile variant
  if (isWritePage || selectedOption !== "ghostwriter" || variant === "profile") {
    return null;
  }

  return (
    <>
      <div className="border-border flex items-center overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-input)]">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-none border-0 px-3 has-[>svg]:px-2.5"
          onClick={() => {
            try {
              const root = document.querySelector("[data-slideout-editor-root]");
              if (!root) return;
              const text = root.textContent ?? "";
              if (!text.trim()) return;
              void navigator.clipboard.writeText(text);
            } catch {
              /* no-op */
            }
          }}
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
        <div className="bg-border h-8 w-px" />
        <Button variant="ghost" size="icon" className="rounded-none">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="default" size="sm" className="gap-1.5 rounded-[var(--radius-button)] px-3">
        Publish
      </Button>
    </>
  );
}
