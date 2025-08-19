"use client";

import { ThinkingIndicator } from "@/components/ui/skeleton-screens";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingIndicator({ className, size = "md", message }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <ThinkingIndicator message={message} />
    </div>
  );
}
