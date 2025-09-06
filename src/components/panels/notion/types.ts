import { ReactNode } from "react";

// Re-export types from sub-components
export interface PageProperty {
  id: string;
  type: "url" | "status" | "text" | "select" | "date";
  name: string;
  value?: string | { label: string; color: string };
  icon?: string;
}

export type TabType = "video" | "transcript" | "components" | "metadata" | "suggestions" | "analysis";

export interface TabData {
  video?: ReactNode;
  transcript?: ReactNode;
  components?: ReactNode;
  metadata?: ReactNode;
  suggestions?: ReactNode;
  analysis?: ReactNode;
}

// Panel mode types
export type PanelMode = "view" | "new-idea" | "edit";

// Panel configuration
export interface NotionPanelConfig {
  // Display settings
  mode?: PanelMode;
  title?: string;
  placeholder?: string;

  // Features
  showPageControls?: boolean;
  showProperties?: boolean;
  showTabs?: boolean;

  // Size constraints
  width?: number;
  minWidth?: number;
  maxWidth?: number;

  // State
  isOpen?: boolean;
  isFullScreen?: boolean;

  // Content
  defaultTab?: TabType;
}

// Complete panel props
export interface NotionPanelProps {
  // Core props
  title?: string;
  onTitleChange?: (title: string) => void;

  // Properties
  properties?: PageProperty[];
  onPropertyChange?: (id: string, value: string | { label: string; color: string }) => void;

  // Controls
  showPageControls?: boolean;
  onRewrite?: () => void;
  onAddHooks?: () => void;
  onAddContentIdeas?: () => void;

  // Panel state
  isOpen?: boolean;
  isFullScreen?: boolean;
  onClose?: () => void;
  onToggleFullScreen?: () => void;

  // Content
  children?: ReactNode;
  editorContent?: ReactNode;
  tabData?: TabData;
  defaultTab?: TabType;

  // Sizing
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;

  // Mode
  isNewIdea?: boolean;
  placeholder?: string;

  // Actions
  onCopy?: () => void;
  onDownload?: () => void;
}

// Preset configurations
export const PanelPresets = {
  newIdea: {
    isNewIdea: true,
    title: "",
    placeholder: "Enter text or type / for commands",
    showPageControls: true,
    properties: [{ id: "1", type: "url" as const, name: "URL", value: "", icon: "link" }],
  },

  contentGeneration: {
    isNewIdea: false,
    showPageControls: true,
    properties: [
      { id: "1", type: "url" as const, name: "URL", value: "", icon: "link" },
      {
        id: "2",
        type: "status" as const,
        name: "Generation",
        value: { label: "Script Ready", color: "success" },
        icon: "burst",
      },
    ],
  },

  scriptView: {
    isNewIdea: false,
    showPageControls: true,
    properties: [
      {
        id: "1",
        type: "status" as const,
        name: "Status",
        value: { label: "Complete", color: "success" },
        icon: "burst",
      },
    ],
  },
} as const;
