"use client";

import { cn } from "@/lib/utils";
import { ClarityLoader } from "@/components/ui/loading";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ className, size = "md" }: LoadingIndicatorProps) {
  const map = { sm: "inline", md: "sm", lg: "md" } as const;
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <ClarityLoader size={map[size]} />
    </div>
  );
}