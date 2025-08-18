"use client";

import { cn } from "@/lib/utils";

export interface VideoGridSlideoutProps {
  isOpen: boolean;
  columns: number;
  className?: string;
  children?: React.ReactNode;
}

export function VideoGridSlideout({ isOpen, columns, className, children }: VideoGridSlideoutProps) {
  return (
    <div
      className={cn(
        "bg-background border-border overflow-hidden border-l transition-all duration-300 ease-out",
        "shadow-[var(--shadow-soft-drop)]",
        isOpen ? "w-80" : "w-0",
        className,
      )}
    >
      <div className="h-full p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">Slideout Panel</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          This panel demonstrates how the main content reflows when a slideout opens.
        </p>

        <div className="space-y-4">
          <div className="bg-accent/10 rounded-[var(--radius-button)] p-4">
            <p className="text-foreground text-sm font-medium">Current layout: {columns} columns</p>
          </div>
          <div className="bg-muted/50 rounded-[var(--radius-button)] p-4">
            <p className="text-muted-foreground text-sm">Max width maintained for optimal readability</p>
          </div>

          {children && <div className="border-border border-t pt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
