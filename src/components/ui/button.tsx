import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot as SlotPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // SOFT UI ALIGNED VARIANTS

        // Ghost - Default, most common (60% usage)
        ghost:
          "text-foreground/70 hover:text-foreground hover:bg-accent/5",

        // Soft - Primary action in a group (30% usage)
        soft:
          "bg-accent/10 text-foreground hover:bg-accent/15 hover:shadow-sm",

        // Solid - Critical actions only (<10% usage)
        solid:
          "bg-foreground text-background shadow-sm hover:opacity-90",

        // Outline - Alternative to soft for certain contexts
        outline:
          "border border-border bg-transparent hover:bg-accent/5 hover:border-border-hover",

        // Destructive - Special case, still subtle
        destructive:
          "text-destructive hover:bg-destructive/10",

        // Link - Inline text-like buttons
        link:
          "text-foreground/70 underline-offset-4 hover:underline hover:text-foreground p-0 h-auto",

        // Legacy variants (deprecated but kept for compatibility)
        default:
          "bg-accent/10 text-foreground hover:bg-accent/15 hover:shadow-sm", // Maps to soft
        secondary:
          "bg-muted text-foreground hover:bg-muted/80", // Similar to soft but on muted bg
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "ghost", // Changed from "default" to "ghost" - most common
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