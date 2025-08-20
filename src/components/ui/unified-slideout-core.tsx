"use client";

import React, { useEffect, useRef, useState } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  getAnimationClasses,
  getVariantClasses,
  getPositionClasses,
  getWidthClasses
} from "./unified-slideout-helpers";
import { SlideoutConfig, SlideoutProps, useContentAdjustment, SlideoutBackdrop } from "./unified-slideout-types";

// Custom hooks to reduce complexity
const useSlideoutMounting = (isOpen: boolean, config: SlideoutConfig) => {
  const [isMounted, setIsMounted] = useState(config.persistent);

  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
    } else if (!isOpen && !config.persistent) {
      const timer = setTimeout(() => setIsMounted(false), config.animationType === "claude" ? 250 : 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted, config.persistent, config.animationType]);

  return isMounted;
};

const useSlideoutEffects = (isOpen: boolean, onClose: () => void, config: SlideoutConfig) => {
  // Handle escape key
  useEffect(() => {
    if (!config.escapeToClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, config.escapeToClose]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!config.preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, config.preventBodyScroll]);
};

const getBackdropVariant = () => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
  }
  return "default";
};

// Helper function to build slideout classes
const getSlideoutClasses = (isOpen: boolean, config: SlideoutConfig, className?: string) => {
  return cn(
    // Base positioning and layout
    getPositionClasses(config.position),
    getWidthClasses(config.width, config.modal),

    // Animation classes
    getAnimationClasses(isOpen, config.position ?? "right", config.animationType ?? "claude"),

    // Variant styling
    getVariantClasses(config.variant),

    // Layout - Full height flex column
    "flex flex-col",

    className
  );
};

// Main unified slideout component
export function UnifiedSlideoutCore({
  isOpen,
  onClose,
  title,
  className,
  contentClassName,
  config,
  children,
  headerActions,
  footerActions
}: SlideoutProps) {
  const slideoutRef = useRef<HTMLDivElement>(null);

  // Claude-style content adjustment
  useContentAdjustment(isOpen, config.width!, config.adjustsContent!);

  // Custom hooks for cleaner code
  const isMounted = useSlideoutMounting(isOpen, config);
  useSlideoutEffects(isOpen, onClose, config);

  // Don't render if not mounted (for lazy loading)
  if (!isMounted && config.lazy) return null;

  return (
    <>
      {/* Backdrop - Only for overlay modes, not Claude-style */}
      {config.backdrop && (
        <SlideoutBackdrop
          isOpen={isOpen}
          onClose={onClose}
          modal={config.modal}
          variant={getBackdropVariant()}
        />
      )}

              {/* Slideout Panel Content - Fixed positioned */}
        <div
          ref={slideoutRef}
          className={getSlideoutClasses(isOpen, config, className)}
          role="dialog"
          aria-modal={config.modal}
          aria-labelledby={title ? "slideout-title" : undefined}
        >
        {/* Header - Claude-style with inside close button */}
        {config.showHeader && (
          <div className="border-border flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              {title && (
                <h2 id="slideout-title" className="text-foreground text-lg font-semibold">
                  {title}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {config.showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] transition-colors duration-200"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>
          {/* Conditionally apply padding: if showHeader is false, assume content is modular and handles its own padding */}
          {config.showHeader ? (
            <div className="p-4">
              {children}
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="border-border border-t p-4">
            {footerActions}
          </div>
        )}
      </div>
    </>
  );
}
