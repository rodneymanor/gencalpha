"use client";

import { InlineLoader } from "@/components/ui/loading";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ className, size = "md" }: LoadingIndicatorProps) {
  const normalizedSize = size === "sm" ? "sm" : "md"; // inline loader supports sm|md
  return <InlineLoader action="fetch" size={normalizedSize} className={className} />;
}