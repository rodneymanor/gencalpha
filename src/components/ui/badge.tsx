import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot as SlotPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-primary-50 [a&]:hover:bg-primary-700",
        secondary:
          "border-transparent bg-neutral-200 text-neutral-800 [a&]:hover:bg-neutral-300",
        destructive:
          "border-transparent bg-destructive-500 text-white [a&]:hover:bg-destructive-600 focus-visible:ring-destructive-200 dark:focus-visible:ring-destructive-300 dark:bg-destructive-600",
        outline:
          "text-neutral-900 border-neutral-300 [a&]:hover:bg-neutral-100 [a&]:hover:text-neutral-900",
        success:
          "border-transparent bg-success-500 text-white [a&]:hover:bg-success-600 focus-visible:ring-success-200 dark:focus-visible:ring-success-300",
        instagram:
          "border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white [a&]:hover:from-purple-600 [a&]:hover:via-pink-600 [a&]:hover:to-orange-500 focus-visible:ring-purple-500/20 dark:focus-visible:ring-purple-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
