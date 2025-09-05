import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-neutral-900 placeholder:text-neutral-500 selection:bg-primary-200 selection:text-primary-900 bg-neutral-50 border-neutral-500 flex h-9 w-full min-w-0 rounded-[var(--radius-button)] border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm",
        "focus-visible:border-primary-500 focus-visible:ring-primary-300 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive-200 dark:aria-invalid:ring-destructive-300 aria-invalid:border-destructive-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
