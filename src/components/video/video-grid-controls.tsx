"use client";

import { cn } from "@/lib/utils";

export type GridType = "videos" | "collections" | "creators";

export interface VideoGridControlsProps {
  columns: 1 | 2 | 3 | 4 | 5 | 6;
  onColumnsChange: (columns: 1 | 2 | 3 | 4 | 5 | 6) => void;
  slideoutOpen: boolean;
  onSlideoutToggle: () => void;
  gridType?: GridType;
  onGridTypeChange?: (type: GridType) => void;
  className?: string;
}

export function VideoGridControls({
  columns,
  onColumnsChange,
  slideoutOpen,
  onSlideoutToggle,
  gridType = "videos",
  onGridTypeChange,
  className,
}: VideoGridControlsProps) {
  const columnOptions: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];
  const gridTypes: Array<{ value: GridType; label: string }> = [
    { value: "videos", label: "Videos" },
    { value: "collections", label: "Collections" },
    { value: "creators", label: "Creators" },
  ];

  const getItemLabel = () => {
    switch (gridType) {
      case "videos":
        return "Videos per row";
      case "collections":
        return "Collections per row";
      case "creators":
        return "Creators per row";
      default:
        return "Items per row";
    }
  };

  return (
    <div className={cn("bg-card rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-soft-drop)]", className)}>
      <div className="space-y-6">
        {onGridTypeChange && (
          <div className="space-y-3">
            <label className="text-foreground text-sm font-medium">Grid Type:</label>
            <div className="bg-muted/30 flex rounded-[var(--radius-button)] p-1">
              {gridTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onGridTypeChange(type.value)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium transition-all duration-200",
                    "rounded-[var(--radius-button)]",
                    gridType === type.value
                      ? "bg-background text-foreground shadow-[var(--shadow-soft-drop)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-foreground text-sm font-medium">{getItemLabel()} (desktop):</label>
          <div className="flex flex-wrap gap-2">
            {columnOptions.map((cols) => (
              <button
                key={cols}
                onClick={() => onColumnsChange(cols)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200",
                  "rounded-[var(--radius-button)]",
                  columns === cols
                    ? "bg-accent/10 text-foreground shadow-[var(--shadow-soft-drop)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/5",
                )}
              >
                {cols}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSlideoutToggle}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all duration-200",
              "rounded-[var(--radius-button)]",
              slideoutOpen
                ? "bg-accent/10 text-foreground shadow-[var(--shadow-soft-drop)]"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/5",
            )}
          >
            {slideoutOpen ? "Close" : "Open"} Slideout Panel
          </button>
          <span className="text-muted-foreground text-sm">Test responsive behavior</span>
        </div>
      </div>
    </div>
  );
}
