export interface PersonaOption {
  id: string;
  name: string;
  description: string;
}

export type FlowState = "input" | "generating" | "transcribing" | "editing";

export interface StreamlinedScriptWriterProps {
  initialPrompt?: string;
  onScriptComplete?: (script: string) => void;
  className?: string;
  fromLibrary?: boolean;
  preselectedGenerator?: string;
  preselectedTemplate?: string;
  onBrandModalOpen?: () => void;
}

export interface ScriptGeneratorData {
  id: string;
  title: string;
  description: string;
  icon: "send" | "sparkles" | "heart" | "power" | "check-circle" | "layers";
  label: string;
  duration?: string;
}

export interface ScriptFormattingComponent {
  label?: string;
  type?: string;
  content?: string;
}

export interface ScriptWriterState {
  flowState: FlowState;
  inputValue: string;
  selectedPersona: PersonaOption | null;
  generatedScript: string;
  scriptTitle: string;
  isSaving: boolean;
  savedScriptId: string | null;
  selectedQuickGenerator: string | null;
  selectedTemplate: string | null;
  sidebarTab: "analysis" | "metrics" | "suggestions";
  wordCount: number;
  showComplexityView: boolean;
  recentActions: string[];
  lastError: string | null;
  isTranscribing: boolean;
}

export interface TranscriptionStepData {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  description: string;
}

export interface ScriptSaveData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  summary: string;
  approach: "ai-voice";
  originalIdea: string;
  source: "scripting";
}

export interface ScriptUpdateData {
  content: string;
  title: string;
  tags: string[];
  summary: string;
}
