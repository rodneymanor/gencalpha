"use client";

import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ className, size = "md" }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex space-x-1">
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8"
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8"
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8"
          )}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}