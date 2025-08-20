"use client";

import { Code, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function ClaudeArtifactDemo() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h3 className="text-foreground mb-3 flex items-center gap-2 text-xl font-semibold">
          <Code className="h-5 w-5 text-blue-600" />
          Claude&apos;s Contextual Layers Philosophy
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This panel demonstrates Claude&apos;s artifact panel approach:{" "}
          <strong>contextual layers that extend rather than interrupt</strong> your workflow. Notice how the main
          content adjusts to accommodate this panel, creating a side-by-side workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-muted/30 rounded-[var(--radius-card)] border p-4">
          <h4 className="text-foreground mb-2 font-medium">Animation Physics</h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• 400ms open (deliberate)</li>
            <li>• 250ms close (quick dismiss)</li>
            <li>• Custom cubic-bezier easing</li>
            <li>• Transform-based animation</li>
          </ul>
        </div>
        <div className="bg-muted/30 rounded-[var(--radius-card)] border p-4">
          <h4 className="text-foreground mb-2 font-medium">Visual Design</h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Subtle border (not harsh)</li>
            <li>• Soft shadow for depth</li>
            <li>• Unified background</li>
            <li>• Close button inside panel</li>
          </ul>
        </div>
      </div>

      <div className="bg-accent/5 rounded-[var(--radius-card)] border p-4">
        <h4 className="text-foreground mb-2 font-medium">Key Differences from Modals</h4>
        <div className="text-muted-foreground space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">✓</span>
            <span>Main content remains accessible and adjusts naturally</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">✓</span>
            <span>No backdrop overlay - preserves context</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">✓</span>
            <span>Non-modal interaction - both contexts remain active</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">✓</span>
            <span>Smooth physics-based animations</span>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-orange-200/50 bg-orange-50 p-4 dark:border-orange-800/50 dark:bg-orange-950/20">
        <h4 className="text-foreground mb-2 flex items-center gap-2 font-medium">
          <Lightbulb className="h-4 w-4 text-orange-600" />
          Try This
        </h4>
        <p className="text-muted-foreground text-sm">
          Notice how you can still interact with the main content behind this panel. Try scrolling or clicking elements
          - this demonstrates the &ldquo;contextual layers&rdquo; approach where both contexts remain active
          simultaneously.
        </p>
      </div>
    </div>
  );
}

export function ClaudeArtifactHeader() {
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      ARTIFACT
    </Badge>
  );
}
