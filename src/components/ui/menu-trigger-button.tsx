"use client";

import * as React from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type MenuTriggerButtonProps = {
  label?: string;
  ariaLabel?: string;
  isOpen?: boolean;
  id?: string;
  leadingIcon?: React.ComponentType<{ className?: string }>;
  trailingIcon?: React.ComponentType<{ className?: string }>;
  hideLabelOnMobile?: boolean;
  selected?: boolean;
  pill?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">;

export function MenuTriggerButton({
  label = "Menu",
  ariaLabel,
  isOpen = false,
  id,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon = ChevronDown,
  hideLabelOnMobile = false,
  selected = false,
  pill = false,
  className,
  ...props
}: MenuTriggerButtonProps) {
  return (
    <button
      id={id}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={ariaLabel ?? label}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none",
        pill ? "border-0" : "border border-border",
        pill ? "rounded-[var(--radius-pill)]" : "rounded-[var(--radius-button)]",
        "h-9 px-3 whitespace-nowrap gap-1",
        // Base colors: use background-hover for pill (closest to requested), card for default
        pill ? "bg-[var(--pill-bg)] text-foreground" : "bg-card text-foreground",
        // Selected state adds subtle elevation
        selected ? "shadow-[var(--shadow-soft-drop)]" : "text-muted-foreground",
        "transition duration-200 ease-linear hover:-translate-y-[1px] active:scale-[0.98]",
        // Hover colors
        pill ? "hover:bg-[var(--pill-bg)]" : "hover:bg-[var(--background-hover)]",
        // Focus/disabled
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {LeadingIcon ? <LeadingIcon className="size-4" aria-hidden="true" /> : null}
      <span className={cn(hideLabelOnMobile ? "hidden md:inline" : "")}>{label}</span>
      {TrailingIcon ? <TrailingIcon className="size-4 md:hidden" aria-hidden="true" /> : null}
    </button>
  );
}

export default MenuTriggerButton;

