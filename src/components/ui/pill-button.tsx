"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PillButtonProps = {
  label: string;
  selected?: boolean;
  ariaLabel?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">;

export function PillButton({ label, selected = false, ariaLabel, className, ...props }: PillButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel ?? label}
      className={cn(
        "inline-flex items-center justify-center select-none",
        "h-8 px-3 text-sm",
        "rounded-[var(--radius-pill)]",
        // No border per spec
        "border-0",
        // Colors: only selected has background; others are ghost
        selected ? "bg-[var(--pill-bg)] text-foreground" : "bg-transparent text-muted-foreground",
        // Hover
        selected ? "hover:bg-[var(--pill-bg)]" : "hover:bg-[var(--background-hover)]",
        // Motion and focus
        "transition duration-200 ease-linear hover:-translate-y-[1px] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
}

export default PillButton;


