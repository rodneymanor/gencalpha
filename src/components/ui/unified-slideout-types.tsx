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

// Content adjustment hook for Claude-style contextual layers
export const useContentAdjustment = (isOpen: boolean, width: string, adjustsContent: boolean) => {
  useEffect(() => {
    if (!adjustsContent) {
      return;
    }

    // Smart content element finder - tries multiple strategies
    const findMainContent = () => {
      // Strategy 1: Look for explicit main content selectors
      const explicitMain = document.querySelector('#collections-main-content') ??
                          document.querySelector('main.main-content') ??
                          document.querySelector('[data-slot="sidebar-inset"]') ??
                          document.querySelector('main');

      if (explicitMain) return explicitMain;

      // Strategy 2: Look for the immediate child of body that contains most content
      // This handles simple page structures like test pages
      const bodyChildren = Array.from(document.body.children);
      const contentCandidate = bodyChildren.find(el => {
        // Skip script tags, style tags, and fixed positioned elements
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.position === 'fixed') return false;

        // Look for elements that likely contain the main content
        return el.children.length > 0 || (el as HTMLElement).innerText.length > 100;
      });

      if (contentCandidate) return contentCandidate;

      // Strategy 3: Look for common layout patterns
      const layoutSelectors = [
        '.min-h-screen',
        '[class*="container"]',
        '[class*="wrapper"]',
        '[class*="layout"]',
        'div[class*="p-"]', // Tailwind padding classes
      ];

      for (const selector of layoutSelectors) {
        const element = document.querySelector(selector);
        if (element && element !== document.body) {
          return element;
        }
      }

      // Strategy 4: Fallback to body
      return document.body;
    };

    const applyContentAdjustment = () => {
      const mainContent = findMainContent();
      if (!(mainContent instanceof HTMLElement)) {
        return;
      }

      // Apply slideout adjustment
      if (isOpen) {
        mainContent.classList.add('slideout-open');
        mainContent.setAttribute('data-slideout-width', width);
      } else {
        mainContent.classList.remove('slideout-open');
        mainContent.removeAttribute('data-slideout-width');
      }
    };

    applyContentAdjustment();

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
