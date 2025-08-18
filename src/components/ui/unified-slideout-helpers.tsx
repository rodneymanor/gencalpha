import { cn } from "@/lib/utils";

// Claude-style animation classes
const getClaudeAnimationClasses = (isOpen: boolean, position: string) => {
  const claudeEasing = "cubic-bezier(0.32, 0.72, 0, 1)";
  const baseClasses = "transform transition-transform will-change-transform";
  const duration = isOpen ? "duration-[400ms]" : "duration-[250ms]";
  
  const transforms = {
    right: isOpen ? "translate-x-0" : "translate-x-full",
    left: isOpen ? "translate-x-0" : "-translate-x-full", 
    bottom: isOpen ? "translate-y-0" : "translate-y-full"
  };
  
  const transform = transforms[position as keyof typeof transforms] || "translate-x-0";
  
  return cn(baseClasses, duration, `ease-[${claudeEasing}]`, transform);
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

// Get variant styling following Claude's artifact panel design
export const getVariantClasses = (variant?: string) => {
  switch (variant) {
    case "artifact":
      // Claude artifact panel: subtle border, soft shadow, unified background
      return "bg-background border-l border-border-subtle shadow-[-4px_0_24px_rgba(0,0,0,0.08)] dark:shadow-[-4px_0_24px_rgba(0,0,0,0.3)]";
    case "elevated":
      return "bg-background border-l border-border shadow-[var(--shadow-soft-drop)]";
    case "flush":
      return "bg-background border-l border-border";
    case "floating":
      return "bg-card rounded-l-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] border border-border m-4";
    default:
      return "bg-background border-l border-border shadow-[var(--shadow-soft-drop)]";
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

// Width mappings following design system and Claude's patterns
export const widthMap = {
  sm: "w-80",      // 320px - Narrow panels
  md: "w-96",      // 384px - Standard panels  
  lg: "w-[600px]", // 600px - Claude artifact panel width
  xl: "w-[800px]", // 800px - Extra wide panels
  full: "w-full"   // Full width
};

// Get width classes
export const getWidthClasses = (width?: string) => {
  if (typeof width === "string" && width in widthMap) {
    return widthMap[width as keyof typeof widthMap];
  }
  return width ?? widthMap.lg;
};
