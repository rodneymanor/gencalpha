export type FlowState = "input" | "generating" | "transcribing" | "editing";

export type SidebarTab = "analysis" | "metrics" | "suggestions";

export interface StreamlinedScriptWriterProps {
  initialPrompt?: string;
  onScriptComplete?: (script: string) => void;
  className?: string;
  fromLibrary?: boolean;
  preselectedGenerator?: string;
  preselectedTemplate?: string;
}

export interface QuickGenerator {
  id: string;
  title: string;
  description: string;
  icon: "send" | "sparkles" | "heart";
  label: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: "power" | "check-circle" | "layers";
  label: string;
  duration: string;
}

export interface ScriptGenerationState {
  flowState: FlowState;
  inputValue: string;
  generatedScript: string;
  scriptTitle: string;
  isSaving: boolean;
  savedScriptId: string | null;
  selectedQuickGenerator: string | null;
  selectedTemplate: string | null;
  sidebarTab: SidebarTab;
  wordCount: number;
  showComplexityView: boolean;
  recentActions: string[];
  lastError: string | null;
}
