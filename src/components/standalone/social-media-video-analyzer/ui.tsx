import * as React from "react";

import { cn } from "@/lib/utils";

export function SegmentedBar({
  total = 20,
  filled = 0,
  className,
}: {
  total?: number;
  filled?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const key = `seg-${i}`;
        return (
          <div
            key={key}
            className={cn("h-2 flex-1 rounded-[var(--radius-button)]", i < filled ? "bg-primary" : "bg-accent")}
          />
        );
      })}
    </div>
  );
}

export function TickScale({ total = 20, position = 0 }: { total?: number; position?: number }) {
  const activeIndex = Math.round((position / 100) * (total - 1));
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-[11px]">Casual</span>
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const key = `tick-${i}`;
          return (
            <div
              key={key}
              className={cn(
                "h-1.5 flex-1 rounded-[var(--radius-button)]",
                i <= activeIndex ? "bg-primary" : "bg-accent",
              )}
            />
          );
        })}
      </div>
      <span className="text-muted-foreground text-[11px]">Formal</span>
    </div>
  );
}

export function EnergyDots({ level = 0 }: { level?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const key = `dot-${i}`;
        return <div key={key} className={cn("size-3 rounded-full", i < level ? "bg-primary" : "bg-accent")} />;
      })}
    </div>
  );
}
