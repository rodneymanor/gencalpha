"use client";

import { ClarityLoader } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

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
