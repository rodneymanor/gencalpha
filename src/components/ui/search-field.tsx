"use client"

import * as React from "react"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type SearchFieldProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  iconClassName?: string
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "placeholder">

export function SearchField(props: SearchFieldProps) {
  const { value, onChange, placeholder = "Search...", className, inputClassName, iconClassName, ...rest } = props

  return (
    <div
      className={cn(
        "inline-flex h-11 w-full cursor-text items-center gap-2",
        "bg-card border border-border",
        "rounded-[var(--radius-button)] px-3",
        "shadow-[var(--shadow-input)]",
        "transition-colors",
        "focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <Search className={cn("text-muted-foreground size-4", iconClassName)} aria-hidden="true" />
      <Input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11",
          "border-0 bg-transparent shadow-none",
          "placeholder:text-muted-foreground/70",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          inputClassName,
        )}
        {...rest}
      />
    </div>
  )
}

export default SearchField

