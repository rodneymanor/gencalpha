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
  <div className="flex flex-row justify-between items-center tracking-tight">
    <div className="flex items-center space-x-3">
      <ScriptTypeIcon type={script.type} />
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">{script.type.replace("-", " ")}</h3>
        <h2 className="font-bold text-lg">{script.title}</h2>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="text-xs text-gray-500 min-w-[3rem] text-center">
        {currentIndex + 1} / {totalScripts}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalScripts - 1}
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  </div>
)

export const ScriptBody = ({ script }: { script: ScriptComponent }) => (
  <div className="space-y-3 h-32 overflow-y-auto">
    {script.description && <p className="text-sm text-gray-600 italic">{script.description}</p>}
    <div className="break-words leading-relaxed tracking-normal">
      {script.type === "main-content-script" ? (
        <div className="text-sm space-y-3">
          {script.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{script.content}</p>
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
    console.log("Using script:", currentScript.title)
    // Add your script usage logic here
  }

  return (
    <div
      className={cn(
        "relative flex w-96 h-64 flex-col gap-4 overflow-hidden rounded-lg border p-4 backdrop-blur-md",
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
      <button
        onClick={handleUseScript}
        className="mt-auto text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-left"
      >
        use this script
      </button>
    </div>
  )
}
