"use client";

import React from "react";

import { Copy, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import { cn } from "@/lib/utils";

export interface PreviewSlideoutProps {
  open: boolean;
  onClose: () => void;
  onCopy?: () => void;
  onPublish?: () => void;
  className?: string;
}

export function PreviewSlideout({ open, onClose, onCopy, onPublish, className }: PreviewSlideoutProps) {
  if (!open) return null;

  return (
    <aside
      aria-label="Preview panel"
      className={cn(
        "bg-card border-border flex h-full min-h-0 w-full flex-col border-l lg:w-1/2",
        "rounded-none",
        className,
      )}
    >
      <PanelHeader title="Content Preview" onClose={onClose} className="bg-background/60" />

      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-[var(--radius-button)]" onClick={onCopy}>
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="default" size="sm" className="rounded-[var(--radius-button)]" onClick={onPublish}>
            Publish
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[var(--radius-button)]">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <article className="mx-auto max-w-3xl font-sans">
          <h1 className="text-xl font-semibold tracking-tight">AI Prompt: Generate 3 Fresh Content Ideas</h1>
          <p className="text-muted-foreground mt-3">
            Analyze a provided transcript and produce three unique angles targeting the same audience while exploring
            new approaches.
          </p>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-semibold">Instructions</h2>
            <p className="text-muted-foreground text-sm">
              Use the transcript as inspiration, not the main content. Provide clear hooks and concrete talking points.
            </p>
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-base font-semibold">Generate 3 Content Ideas</h2>
            <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-sm">
              <li>
                <span className="font-medium">Alternative Angle:</span> Flip the perspective or target a new context.
              </li>
              <li>
                <span className="font-medium">Deep-Dive:</span> Expand a single point into a comprehensive breakdown.
              </li>
              <li>
                <span className="font-medium">Format Transformation:</span> Turn it into a challenge, comparison, or
                troubleshooting guide.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <div className="bg-background/50 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-input)]">
              <p className="text-muted-foreground text-sm">
                Tip: Use the Copy button to bring this structure into your editor and refine as needed.
              </p>
            </div>
          </section>
        </article>
      </div>
    </aside>
  );
}
