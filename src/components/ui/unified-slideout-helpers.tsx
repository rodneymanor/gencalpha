import { cn } from "@/lib/utils";

// Claude-style animation classes
const getClaudeAnimationClasses = (isOpen: boolean, position: string) => {
  const baseClasses = "transform will-change-transform slideout-claude-transition";
  const stateClass = isOpen ? "opening" : "closing";

  const transforms = {
    right: isOpen ? "translate-x-0" : "translate-x-full",
    left: isOpen ? "translate-x-0" : "-translate-x-full",
    bottom: isOpen ? "translate-y-0" : "translate-y-full"
  };

  const transform = transforms[position as keyof typeof transforms] || "translate-x-0";

  return cn(
    baseClasses,
    stateClass,
    transform
  );
};

// Animation variants following Claude's artifact panel physics
export const getAnimationClasses = (
  isOpen: boolean,
  position: string,
  animationType: string
) => {
  if (animationType === "claude") {
    return getClaudeAnimationClasses(isOpen, position);
  }

  if (animationType === "overlay") {
    return cn(
      "transform transition-all duration-300 ease-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    );
  }

  if (animationType === "takeover") {
    return cn(
      "transform transition-transform duration-300 ease-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    );
  }

  return "transform transition-transform duration-300 ease-out";
};

// Get variant styling following Soft UI principles - borders over shadows
export const getVariantClasses = (variant?: string) => {
  switch (variant) {
    case "artifact":
      // Soft UI artifact panel: subtle border, no shadow - contextual layers approach
      return "bg-background border-l border-border-subtle";
    case "elevated":
      // Slightly more visible border for elevated panels
      return "bg-background border-l border-border-hover";
    case "flush":
      // Minimal border for flush panels
      return "bg-background border-l border-border";
    case "floating":
      // Floating panels can have subtle shadows since they're detached
      return "bg-card rounded-l-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] border border-border m-4";
    default:
      // Default to soft border approach
      return "bg-background border-l border-border";
  }
};

// Get positioning classes
export const getPositionClasses = (position?: string) => {
  const base = "fixed z-50";

  switch (position) {
    case "right":
      return cn(base, "top-0 bottom-0 right-0");
    case "left":
      return cn(base, "top-0 bottom-0 left-0");
    case "bottom":
      return cn(base, "bottom-0 left-0 right-0");
    default:
      return cn(base, "top-0 bottom-0 right-0");
  }
};

// Width mappings with responsive behavior following Claude's patterns
export const widthMap = {
  sm: "w-full md:w-[320px] lg:w-[320px]",  // 320px on desktop, responsive on mobile/tablet
  md: "w-full md:w-[384px] lg:w-[384px]",  // 384px on desktop, responsive on mobile/tablet
  lg: "w-full md:w-[70vw] md:max-w-[480px] lg:w-[600px]", // Claude artifact panel width with responsive behavior
  xl: "w-full md:w-[70vw] md:max-w-[600px] lg:w-[800px]", // Extra wide panels with responsive behavior
  full: "w-full"   // Full width on all breakpoints
};

// Non-modal width mappings - for Claude-style contextual layers
export const nonModalWidthMap = {
  sm: "w-full sm:w-[320px] md:w-[320px] lg:w-[320px]",    // Responsive but not modal
  md: "w-full sm:w-[384px] md:w-[384px] lg:w-[384px]",    // Responsive but not modal
  lg: "w-full sm:w-[480px] md:w-[480px] lg:w-[600px]",    // Claude artifact panel - never full overlay
  xl: "w-full sm:w-[600px] md:w-[600px] lg:w-[800px]",    // Extra wide panels - never full overlay
  full: "w-full"   // Full width on all breakpoints
};

// Get width classes with responsive behavior that considers modal setting
export const getWidthClasses = (width?: string, modal?: boolean) => {
  // For non-modal behavior, use different width mapping that avoids full overlay
  const selectedMap = modal === false ? nonModalWidthMap : widthMap;

  if (typeof width === "string" && width in selectedMap) {
    return selectedMap[width as keyof typeof selectedMap];
  }
  // Default to lg width with responsive behavior
  return modal === false ? nonModalWidthMap.lg : widthMap.lg;
};
