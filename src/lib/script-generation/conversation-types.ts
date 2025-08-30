// Conversation types for interactive script generation
export type ConversationRole = "user" | "assistant" | "system";

export type ActionType =
  | "generate_initial"
  | "refine_hook"
  | "change_tone"
  | "add_cta"
  | "expand_section"
  | "shorten_content"
  | "generate_variations"
  | "apply_voice_persona"
  | "adjust_pacing"
  | "add_emotional_beat";

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: Date;
  scriptSnapshot?: string; // Current state of the script at this message
  metadata?: {
    action?: ActionType;
    changes?: string[]; // List of changes made
    targetSection?: string; // Which part of script was modified
    previousVersion?: string; // For undo capability
  };
}

export interface ScriptIteration {
  version: number;
  content: string;
  elements: {
    hook: string;
    bridge: string;
    goldenNugget: string;
    wta: string;
  };
  metadata: {
    tone: "professional" | "casual" | "energetic" | "educational" | "viral";
    duration: string;
    wordCount: number;
    lastModified: Date;
    changeLog: string[];
  };
}

export interface ConversationContext {
  sessionId: string;
  originalIdea: string;
  currentScript: ScriptIteration;
  history: ConversationMessage[];
  preferences: {
    platform?: "youtube" | "tiktok" | "instagram";
    targetAudience?: string;
    voicePersona?: string;
    desiredOutcome?: string;
  };
}

export interface IterationRequest {
  context: ConversationContext;
  userMessage: string;
  requestedAction: ActionType;
  actionDetails?: {
    targetSection?: string;
    newTone?: string;
    additionalContext?: string;
  };
}

export interface IterationResponse {
  success: boolean;
  updatedScript: ScriptIteration;
  assistantMessage: string;
  suggestions?: string[]; // Next possible actions
  error?: string;
}
