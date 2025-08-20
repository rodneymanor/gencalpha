import React, { useEffect } from "react";

import { cn } from "@/lib/utils";

// Unified slideout configuration types following Claude's artifact panel philosophy
export interface SlideoutConfig {
  // Animation and positioning - Claude-style defaults
  width?: "sm" | "md" | "lg" | "xl" | "full" | string;
  position?: "right" | "left" | "bottom";
  animationType?: "claude" | "overlay" | "takeover"; // Renamed for clarity

  // Contextual layers approach
  adjustsContent?: boolean; // Whether main content margin adjusts (Claude-style)
  backdrop?: boolean;
  backdropBlur?: boolean;
  modal?: boolean; // Whether clicking backdrop closes slideout

  // Responsive behavior following the guidelines
  responsive?: {
    mobile?: "takeover" | "overlay" | "drawer";      // Mobile: full screen takeover
    tablet?: "overlay" | "sidebar";                   // Tablet: overlay with scrim
    desktop?: "sidebar" | "overlay";                  // Desktop: side-by-side
  };

  // Visual styling - Soft UI principles
  variant?: "default" | "elevated" | "flush" | "artifact";
  showHeader?: boolean;
  showCloseButton?: boolean;

  // Interaction
  escapeToClose?: boolean;
  preventBodyScroll?: boolean;

  // Performance
  lazy?: boolean; // Lazy load content until opened
  persistent?: boolean; // Keep DOM mounted when closed
}

export interface SlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  contentClassName?: string;
  config: SlideoutConfig;
  children: React.ReactNode;

  // Header actions
  headerActions?: React.ReactNode;

  // Footer actions
  footerActions?: React.ReactNode;
}

// Backdrop component for overlay modes (not used in Claude-style)
export const SlideoutBackdrop = ({
  isOpen,
  onClose,
  modal = true,
  variant = "default"
}: {
  isOpen: boolean;
  onClose: () => void;
  modal?: boolean;
  variant?: string;
}) => {
  if (!isOpen) return null;

  // Different backdrop styles for different contexts
  const getBackdropStyles = () => {
    switch (variant) {
      case "tablet":
        // Tablet overlay: 30% scrim as per guidelines
        return "bg-background/30 backdrop-blur-sm";
      case "mobile":
        // Mobile: stronger backdrop for full takeover
        return "bg-background/60 backdrop-blur-md";
      default:
        // Standard overlay
        return "bg-background/60 backdrop-blur-sm";
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-all duration-300",
        getBackdropStyles(),
        modal && "cursor-pointer"
      )}
      onClick={modal ? onClose : undefined}
      aria-hidden="true"
    />
  );
};

// Simplified content adjustment hook - No longer needed for flexbox approach
// This hook is kept for backward compatibility but does nothing when adjustsContent is false
export const useContentAdjustment = (isOpen: boolean, width: string, adjustsContent: boolean) => {
  useEffect(() => {
    // With flexbox approach, no manual content adjustment is needed
    // The flex container automatically handles layout changes
    if (!adjustsContent) {
      return;
    }

    // Legacy support: For layouts that still need manual adjustment
    // This will primarily be for non-flexbox layouts
    const findMainContent = () => {
      return document.querySelector('main.main-content') ??
             document.querySelector('[data-slot="sidebar-inset"]') ??
             document.querySelector('main') ??
             document.body;
    };

    const applyLegacyAdjustment = () => {
      const currentMainContent = findMainContent();
      if (!(currentMainContent instanceof HTMLElement)) {
        return;
      }

      // For legacy layouts, just toggle a class - let CSS handle the rest
      if (isOpen) {
        currentMainContent.classList.add('slideout-open');
        currentMainContent.setAttribute('data-slideout-width', width);
      } else {
        currentMainContent.classList.remove('slideout-open');
        currentMainContent.removeAttribute('data-slideout-width');
      }
    };

    applyLegacyAdjustment();

    // Cleanup function
    return () => {
      const mainContent = findMainContent();
      if (mainContent instanceof HTMLElement) {
        mainContent.classList.remove('slideout-open');
        mainContent.removeAttribute('data-slideout-width');
      }
    };
  }, [isOpen, width, adjustsContent]);
};
