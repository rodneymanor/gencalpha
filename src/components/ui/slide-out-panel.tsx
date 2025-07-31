"use client";

import React from "react";

import { PanelHeader } from "@/components/ui/panel-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TweetStyleComposer } from "@/components/writing-panel/tweet-style-composer";

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlideOutPanel({ isOpen, onClose }: SlideOutPanelProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md border-l-4 border-primary p-0"
      >
        {/* Header */}
        <PanelHeader title="Quick Composer" onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <TweetStyleComposer className="max-w-none" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
