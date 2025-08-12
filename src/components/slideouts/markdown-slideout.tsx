"use client";

import React, { useMemo } from "react";

import type { PartialBlock } from "@blocknote/core";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { Copy, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import "@blocknote/core/style.css";
import "@blocknote/react/style.css";

export interface MarkdownSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  markdown: string;
  side?: "right" | "left";
  className?: string;
  onCopy?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

export function MarkdownSlideout({
  isOpen,
  onClose,
  title = "Markdown Preview",
  markdown,
  side = "right",
  className,
  onCopy,
  onPublish,
  isPublishing,
}: MarkdownSlideoutProps) {
  const initialContent: PartialBlock[] = useMemo(() => {
    return [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: markdown,
          },
        ],
      },
    ];
  }, [markdown]);

  const editor = useCreateBlockNote({
    initialContent,
  });

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side={side} className={["bg-card p-0", "border-l sm:max-w-lg", className ?? ""].join(" ")}>
        <div className="flex h-full min-h-0 flex-col">
          <PanelHeader title={title} onClose={onClose} className="bg-background/60" />

          <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="font-medium">Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-[var(--radius-button)]" onClick={onCopy}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-[var(--radius-button)]"
                onClick={onPublish}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing…" : "Publish"}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[var(--radius-button)]">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="bg-background/50 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-input)]">
              <BlockNoteView editor={editor} editable={false} className="font-serif" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
