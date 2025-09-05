import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-neutral-50 text-neutral-900",
        "flex flex-col gap-4 p-4", // Reduced gap and padding
        "rounded-[var(--radius-card)]", // Theme-appropriate radius
        "border border-neutral-500", // Enhanced accessible border contrast
        "transition-all duration-300 ease-out", // Smoother transition
        "hover:shadow-lg hover:border-neutral-500", // Enhanced hover state
        className
      )}
      {...props}
    />
  )
}

function CardElevated({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-neutral-50 text-neutral-900",
        "flex flex-col gap-4 p-4", // Reduced gap and padding
        "rounded-[var(--radius-card)]", // Theme-appropriate radius
        "border border-neutral-500", // Enhanced accessible border contrast
        "shadow-sm transition-all duration-300 ease-out", // Default elevation with smoother transition
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-neutral-500", // Enhanced hover with lift
        className
      )}
      {...props}
    />
  )
}

function CardInteractive({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-neutral-50 text-neutral-900",
        "flex flex-col gap-4 p-4", // Reduced gap and padding
        "rounded-[var(--radius-card)]", // Theme-appropriate radius
        "border border-neutral-400 cursor-pointer", // Accessible border contrast with cursor
        "transition-all duration-300 ease-out", // Smoother transition
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-400", // Enhanced hover with lift
        "active:scale-[0.98] active:translate-y-0", // Click feedback
        className
      )}
      {...props}
    />
  )
}

function CardBorderless({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-neutral-50 text-neutral-900",
        "flex flex-col gap-4 p-4",
        "rounded-[var(--radius-card)]", // Theme-appropriate radius
        "border border-neutral-500", // Enhanced accessible border contrast
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-neutral-500", // Enhanced border on hover
        "active:scale-[0.98]", // Add click feedback
        className
      )}
      {...props}
    />
  )
}

function CardTransparent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styling
        "border border-neutral-500", // Enhanced accessible border contrast
        "text-base font-medium", // font-large equivalent
        "flex cursor-pointer",
        "overflow-x-hidden text-ellipsis whitespace-nowrap",
        "rounded-xl",
        // Background gradients using design system colors
        "bg-gradient-to-b from-neutral-100 to-neutral-100/30",
        // Padding
        "py-4 pl-5 pr-4",
        // Transitions and interactions
        "transition-all ease-in-out duration-300",
        "hover:shadow-sm active:scale-[0.98]",
        // Hover states using design system colors
        "hover:from-neutral-200 hover:to-neutral-200/80 hover:border-neutral-400",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-neutral-600 text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardElevated,
  CardInteractive,
  CardBorderless,
  CardTransparent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
