"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        // Subtle tri-color gradient using brand-friendly tokens
        "bg-gradient-to-r from-brand-600/80 via-primary-600/80 to-neutral-700/80",
        // Clip gradient to text
        "bg-clip-text text-transparent",
        // Slow animated pan for a premium feel
        "animate-gradient-slow",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;

