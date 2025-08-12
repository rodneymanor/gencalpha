"use client";

import React, { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideoutWrapperProps {
  children: ReactNode;
  slideout: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SlideoutWrapper({ children, slideout, className, contentClassName }: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex min-h-[100dvh] w-full flex-col font-sans", className)}>
      {/* Test toggle control */}
      <div className="mb-4 flex w-full justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-[var(--radius-button)]"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Close Test Slideout" : "Open Test Slideout"}
        </Button>
      </div>

      <div className={cn("relative flex flex-1 overflow-hidden")}>
        {/* Main content area (wrapped) */}
        <div
          className={cn(
            "min-h-0 transition-all duration-300",
            isOpen ? "hidden lg:flex lg:w-1/2" : "flex w-full",
            contentClassName,
          )}
        >
          <div className="flex w-full flex-col">{children}</div>
        </div>

        {/* Slideout panel */}
        <div
          className={cn(
            "border-border bg-card absolute inset-y-0 right-0 z-30 w-full max-w-full border-l shadow-[var(--shadow-soft-drop)] transition-transform duration-300 lg:static lg:h-auto lg:w-1/2",
            isOpen ? "translate-x-0" : "translate-x-full lg:hidden lg:translate-x-0",
          )}
        >
          {slideout}
        </div>
      </div>
    </div>
  );
}

export default SlideoutWrapper;
