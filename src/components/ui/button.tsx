import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot as SlotPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // SOFT UI ALIGNED VARIANTS - Enhanced with better visibility

        // Ghost - Default, most common (60% usage)
        // Subtle hover with slight elevation
        ghost:
          "text-foreground/70 hover:text-foreground hover:bg-accent/10 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]",

        // Soft - Primary action in a group (30% usage)
        // More visible with gradient-like effect and stronger border
        soft:
          "bg-accent/10 text-foreground border border-border-visible/30 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:bg-accent/20 hover:border-border-visible/40 hover:-translate-y-px hover:shadow-[var(--shadow-soft-drop)]",

        // Solid - Critical actions only (<10% usage)
        // Strong presence with good shadow depth
        solid:
          "bg-foreground text-background border border-foreground/10 shadow-[var(--shadow-soft-drop)] hover:opacity-90 hover:-translate-y-px hover:shadow-[var(--shadow-hover)]",

        // Outline - Alternative to soft for certain contexts
        // More visible border that matches Claude's approach
        outline:
          "border border-border-visible/40 bg-gradient-to-b from-background to-background/80 hover:from-accent/5 hover:to-accent/10 hover:border-border-visible/50 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]",

        // Destructive - Special case, still subtle but visible
        destructive:
          "text-destructive border border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(239,68,68,0.08),0_0_0_1px_rgba(239,68,68,0.15)]",

        // Link - Inline text-like buttons
        link:
          "text-foreground/70 underline-offset-4 hover:underline hover:text-foreground p-0 h-auto",

        // Legacy variants (deprecated but kept for compatibility)
        default:
          "bg-accent/10 text-foreground border border-border-visible/30 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:bg-accent/20 hover:border-border-visible/40 hover:-translate-y-px hover:shadow-[var(--shadow-soft-drop)]", // Maps to soft
        secondary:
          "bg-muted text-foreground border border-border/50 hover:bg-muted/80 hover:border-border hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06)]",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }