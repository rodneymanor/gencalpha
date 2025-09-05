import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot as SlotPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // SOFT UI ALIGNED VARIANTS - Enhanced with better visibility

        // Ghost - Default, most common (60% usage)
        // Subtle hover with slight elevation
        ghost:
          "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]",

        // Soft - Primary action in a group (30% usage)
        // More visible with gradient-like effect and stronger border
        soft:
          "bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:bg-neutral-200 hover:border-neutral-300 hover:-translate-y-px hover:shadow-[var(--shadow-soft-drop)]",

        // Solid - Critical actions only (<10% usage)
        // Strong presence with good shadow depth
        solid:
          "bg-neutral-900 text-neutral-50 border border-neutral-800 shadow-[var(--shadow-soft-drop)] hover:bg-neutral-800 hover:-translate-y-px hover:shadow-[var(--shadow-hover)]",

        // Outline - Alternative to soft for certain contexts
        // More visible border that matches Claude's approach
        outline:
          "border border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 hover:border-neutral-400 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]",

        // Destructive - Special case, still subtle but visible
        destructive:
          "text-destructive-600 border border-destructive-200 hover:bg-destructive-50 hover:border-destructive-300 hover:-translate-y-px hover:shadow-[0_0.25rem_0.75rem_rgba(239,68,68,0.08),0_0_0_1px_rgba(239,68,68,0.15)]",

        // Link - Inline text-like buttons
        link:
          "text-neutral-600 underline-offset-4 hover:underline hover:text-neutral-900 p-0 h-auto",

        // Legacy variants (deprecated but kept for compatibility)
        default:
          "bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:bg-neutral-200 hover:border-neutral-300 hover:-translate-y-px hover:shadow-[var(--shadow-soft-drop)]", // Maps to soft
        secondary:
          "bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06)]",
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