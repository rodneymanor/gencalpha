"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ScriptComponent {
  id: string
  type: "hook" | "bridge" | "golden-nugget" | "wta" | "main-content-script"
  title: string
  content: string
  description?: string
  timeRange?: string
}

interface ScriptCardProps {
  scripts: ScriptComponent[]
  className?: string
  initialScript?: "hook" | "bridge" | "golden-nugget" | "wta" | "main-content-script"
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-md bg-primary/10", className)} {...props} />
}

export const ScriptCardSkeleton = ({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) => (
  <div className={cn("flex size-full max-h-max min-w-72 flex-col gap-2 rounded-lg border p-4", className)} {...props}>
    <div className="flex flex-row gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-full" />
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
)

export const ScriptNotFound = ({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) => (
  <div
    className={cn("flex size-full flex-col items-center justify-center gap-2 rounded-lg border p-4", className)}
    {...props}
  >
    <h3>No scripts available</h3>
  </div>
)

const ScriptTypeIcon = ({ type }: { type: ScriptComponent["type"] }) => {
  const icons = {
    hook: "🎣",
    bridge: "🌉",
    "golden-nugget": "💎",
    wta: "🎯",
    "main-content-script": "📄",
  }

  return <span className="text-lg">{icons[type]}</span>
}

export const ScriptHeader = ({
  script,
  currentIndex,
  totalScripts,
  onPrevious,
  onNext,
}: {
  script: ScriptComponent
  currentIndex: number
  totalScripts: number
  onPrevious: () => void
  onNext: () => void
}) => (
  <div className="flex flex-row items-center justify-between tracking-tight">
    <div className="flex items-center space-x-3">
      <ScriptTypeIcon type={script.type} />
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {script.type.replace("-", " ")}
        </h3>
        <h2 className="text-lg font-bold">{script.title}</h2>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="rounded-full p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-[3rem] text-center text-xs text-gray-500">
        {currentIndex + 1} / {totalScripts}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalScripts - 1}
        className="rounded-full p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  </div>
)

export const ScriptBody = ({ script }: { script: ScriptComponent }) => (
  <div className="h-32 space-y-3 overflow-y-auto">
    {script.description && <p className="text-sm italic text-gray-600">{script.description}</p>}
    <div className="break-words leading-relaxed tracking-normal">
      {script.type === "main-content-script" ? (
        <div className="space-y-3 text-sm">
          {script.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm">{script.content}</p>
      )}
    </div>
  </div>
)

export const ScriptCard = ({ scripts, className, initialScript = "hook", ...props }: ScriptCardProps) => {
  const initialIndex = scripts.findIndex((script) => script.type === initialScript)
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)

  if (!scripts || scripts.length === 0) {
    return <ScriptNotFound className={className} {...props} />
  }

  const currentScript = scripts[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(scripts.length - 1, prev + 1))
  }

  const handleUseScript = () => {
    // Placeholder: Hook up to writer/editor if needed
    console.log("Using script:", currentScript.title)
  }

  return (
    <div
      className={cn(
        "relative flex h-64 w-full flex-col gap-4 overflow-hidden rounded-lg border p-4 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <ScriptHeader
        script={currentScript}
        currentIndex={currentIndex}
        totalScripts={scripts.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      <ScriptBody script={currentScript} />
      {/* Section duration indicator (bottom-right) */}
      {currentScript.timeRange && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-neutral-200 bg-white/90 px-2 py-0.5 text-[11px] text-neutral-700">
          {currentScript.timeRange}
        </div>
      )}
      <button
        onClick={handleUseScript}
        className="mt-auto text-left text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800"
      >
        use this script
      </button>
    </div>
  )
}
