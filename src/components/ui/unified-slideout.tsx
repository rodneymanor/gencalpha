"use client";

import React from "react";

import { UnifiedSlideoutCore } from "./unified-slideout-core";
import { SlideoutConfig } from "./unified-slideout-types";

// Default configuration following Claude's artifact panel philosophy
const defaultConfig: SlideoutConfig = {
  width: "lg",
  position: "right",
  animationType: "claude",        // Claude-style by default
  adjustsContent: true,           // Main content adjusts (non-modal)
  backdrop: false,                // No backdrop for Claude-style
  backdropBlur: false,
  modal: false,                   // Non-modal by default
  responsive: {
    mobile: "takeover",           // Mobile: full screen takeover
    tablet: "overlay",            // Tablet: overlay with scrim
    desktop: "sidebar"            // Desktop: side-by-side
  },
  variant: "artifact",            // Artifact panel styling
  showHeader: false,
  showCloseButton: true,
  escapeToClose: true,
  preventBodyScroll: false,       // Don't prevent scroll for non-modal
  lazy: false,
  persistent: false
};

export interface UnifiedSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  contentClassName?: string;
  config?: SlideoutConfig;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}

// Main unified slideout component
export function UnifiedSlideout({
  config: userConfig,
  ...props
}: UnifiedSlideoutProps) {
  const config = { ...defaultConfig, ...userConfig };
  return (
    <UnifiedSlideoutCore
      {...props}
      config={config}
    />
  );
}

// Convenience hook for managing slideout state
export function useSlideout(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Pre-configured slideout variants following Claude's artifact panel philosophy

// Claude Artifact Panel - The gold standard
export const ClaudeArtifactConfig: SlideoutConfig = {
  width: "lg",                    // 600px - Claude's standard width
  position: "right",
  animationType: "claude",        // Signature easing and timing
  adjustsContent: true,           // Main content adjusts (non-modal)
  backdrop: false,                // No backdrop - contextual layers
  modal: false,                   // Non-modal interaction
  variant: "artifact",            // Claude's visual styling
  showHeader: false,
  showCloseButton: true,
  escapeToClose: true,
  preventBodyScroll: false,       // Allow scrolling in both contexts
  responsive: {
    mobile: "takeover",           // Full screen on mobile
    tablet: "overlay",            // Overlay with 30% scrim on tablet
    desktop: "sidebar"            // Side-by-side on desktop
  }
};

// Video Content Panel - For video analysis and previews
export const VideoSlideoutConfig: SlideoutConfig = {
  width: "xl",                    // 800px for video content
  animationType: "claude",
  adjustsContent: true,
  backdrop: false,
  modal: false,
  variant: "artifact",
  showHeader: true,
  responsive: {
    mobile: "takeover",
    tablet: "overlay",
    desktop: "sidebar"
  }
};

// Markdown/Documentation Panel - For content preview
export const MarkdownSlideoutConfig: SlideoutConfig = {
  width: "md",                    // 384px for text content
  animationType: "claude",
  adjustsContent: true,
  backdrop: false,
  modal: false,
  variant: "artifact",
  showHeader: true,
  responsive: {
    mobile: "takeover",
    tablet: "overlay",
    desktop: "sidebar"
  }
};

// Modal Overlay - For when you need traditional modal behavior
export const ModalOverlayConfig: SlideoutConfig = {
  width: "lg",
  animationType: "overlay",
  adjustsContent: false,          // Don't adjust content
  backdrop: true,                 // Show backdrop
  backdropBlur: true,
  modal: true,                    // Modal behavior
  variant: "elevated",
  preventBodyScroll: true,        // Prevent body scroll
  responsive: {
    mobile: "takeover",
    tablet: "overlay",
    desktop: "overlay"            // Always overlay, never sidebar
  }
};

// Compact Panel - For narrow content like navigation or tools
export const CompactSlideoutConfig: SlideoutConfig = {
  width: "sm",                    // 320px
  animationType: "claude",
  adjustsContent: true,
  backdrop: false,
  modal: false,
  variant: "flush",
  showHeader: false,              // Minimal header
  responsive: {
    mobile: "takeover",
    tablet: "overlay",
    desktop: "sidebar"
  }
};

// Re-export types
export type { SlideoutConfig };

// Legacy compatibility exports
export { UnifiedSlideout as GenericSlideout };
export { useSlideout as useGenericSlideout };