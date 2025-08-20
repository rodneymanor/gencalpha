import { Play, Settings, Users, Code, Grid3X3, Layers } from "lucide-react";

export interface SlideoutType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  implementation: string;
  width: string;
  backdrop: string;
  responsive: string;
  patterns: string[];
}

export const slideoutTypes: SlideoutType[] = [
  // Legacy components have been removed and replaced with UnifiedSlideout
  {
    id: "slideoutWrapper" as const,
    name: "SlideoutWrapper",
    description: "Complex multi-tab slideout with feature flags and contextual menus",
    icon: <Settings className="h-5 w-5" />,
    implementation: "Transform + tabs",
    width: "Configurable",
    backdrop: "Yes",
    responsive: "Full responsive",
    patterns: ["Multi-tab", "Feature flags", "Contextual menus", "Event-driven"],
  },
  {
    id: "floating" as const,
    name: "FloatingVideoPlayer",
    description: "Fixed/sticky positioning video player (not a true slideout)",
    icon: <Play className="h-5 w-5" />,
    implementation: "Fixed positioning",
    width: "420px / sticky",
    backdrop: "None",
    responsive: "Fixed + sticky modes",
    patterns: ["Fixed positioning", "Sticky variant", "Video integration"],
  },
  {
    id: "unified" as const,
    name: "UnifiedSlideout",
    description: "New unified slideout component - single source of truth",
    icon: <Layers className="h-5 w-5" />,
    implementation: "Configurable",
    width: "Configurable",
    backdrop: "Configurable",
    responsive: "Full responsive",
    patterns: ["Unified API", "Configuration-driven", "Multiple animation types", "Preset system"],
  },
  {
    id: "claudeArtifact" as const,
    name: "Claude Artifact Panel",
    description: "Claude-style artifact panel with contextual layers philosophy",
    icon: <Code className="h-5 w-5" />,
    implementation: "Claude physics",
    width: "600px fixed",
    backdrop: "None (contextual)",
    responsive: "Content-adjusting",
    patterns: ["Contextual layers", "Content adjustment", "Non-modal", "Custom easing"],
  },
  {
    id: "modalOverlay" as const,
    name: "Modal Overlay",
    description: "Traditional modal overlay when interruption is needed",
    icon: <Grid3X3 className="h-5 w-5" />,
    implementation: "Modal overlay",
    width: "600px fixed",
    backdrop: "Yes (modal)",
    responsive: "Overlay all screens",
    patterns: ["Modal behavior", "Backdrop click", "Body scroll lock", "Interrupting"],
  },
  {
    id: "compact" as const,
    name: "Compact Panel",
    description: "Narrow panel for navigation or tool palettes",
    icon: <Users className="h-5 w-5" />,
    implementation: "Claude physics",
    width: "320px fixed",
    backdrop: "None",
    responsive: "Content-adjusting",
    patterns: ["Minimal header", "Narrow width", "Tool palettes", "Navigation"],
  },
];
