"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface GenericSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}

export function GenericSlideout({ isOpen, onClose, title, className, children }: GenericSlideoutProps) {
  const slideoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Soft UI overlay with subtle blur */}
      <div
        className="bg-background/60 fixed inset-0 z-50 backdrop-blur-sm transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1)"
        onClick={onClose}
      />

      {/* Slideout Panel - Following Sliding Panel Implementation Rules */}
      <div
        ref={slideoutRef}
        className={cn(
          // Fixed positioning and dimensions (600px width for desktop)
          "fixed top-0 bottom-0 right-0 z-50 w-[600px] max-w-[90vw]",
          // Background and elevation following Soft UI principles  
          "bg-background border-l border-border",
          "shadow-[var(--shadow-soft-drop)]",
          // Transform-based animation with custom easing
          "transform transition-transform duration-300 cubic-bezier(0.32, 0.72, 0, 1)",
          "translate-x-0",
          // Layout structure
          "flex flex-col",
          // Performance optimization
          "will-change-transform",
          className,
        )}
      >
        {/* Header - Compressed hierarchy for panel content */}
        {title && (
          <div className="border-border flex items-center justify-between border-b p-4">
            <h3 className="text-foreground text-sm font-medium">{title}</h3>
            <button 
              onClick={onClose}
              className="hover:bg-accent/10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}

        {/* Scrollable content area - Panel content with compressed spacing */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="h-full p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}