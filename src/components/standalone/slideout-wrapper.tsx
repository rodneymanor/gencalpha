"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { ChevronDown, Copy, X } from "lucide-react";

import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideoutWrapperProps {
  children: ReactNode;
  slideout: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SlideoutWrapper({ children, slideout: _slideout, className, contentClassName }: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Reference to satisfy linter while we intentionally ignore external slideout content
  void _slideout;

  // Open slideout when an answer is displayed in chat
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setIsOpen(true);
    window.addEventListener("write:answer-ready", handler as EventListener);
    return () => {
      window.removeEventListener("write:answer-ready", handler as EventListener);
    };
  }, []);

  return (
    <div className={cn("flex min-h-[100dvh] w-full flex-col font-sans", className)}>
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
          <div className="flex h-full flex-col">
            {/* Toolbar/Header (preserved) */}
            <div className="bg-card border-border flex items-center justify-between border-b px-3 py-2">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="border-border flex items-center overflow-hidden rounded-[var(--radius-button)] border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-none border-0 px-3 has-[>svg]:px-2.5"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </Button>
                  <div className="bg-border h-8 w-px" />
                  <Button variant="ghost" size="icon" className="size-8 rounded-none">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="default" size="sm" className="h-8 gap-1.5 rounded-[var(--radius-button)] px-3">
                  Publish
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-[var(--radius-button)]"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor area - minimal, no extra borders, specified padding */}
            <div className="flex-1 overflow-y-auto">
              <MinimalSlideoutEditor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideoutWrapper;
