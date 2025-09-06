import type { ScriptGeneratorData, TranscriptionStepData } from "../types/script-writer-types";

export const FLOW_STATES = {
  INPUT: "input",
  GENERATING: "generating",
  TRANSCRIBING: "transcribing",
  EDITING: "editing",
} as const;

export const SIDEBAR_TABS = {
  ANALYSIS: "analysis",
  METRICS: "metrics",
  SUGGESTIONS: "suggestions",
} as const;

export const GENERATOR_TEMPLATES = {
  GENERATE_HOOKS: {
    id: "generate-hooks",
    promptTemplate: "Generate 10 different hooks for: {input}",
  },
  CONTENT_IDEAS: {
    id: "content-ideas",
    promptTemplate: "Generate content ideas for: {input}",
  },
} as const;

export const SCRIPT_TEMPLATES = {
  IF_THEN: {
    id: "if-then-script",
    promptTemplate: 'Create an "If this, then that" conditional script about: {input}',
  },
  PROBLEM_SOLUTION: {
    id: "problem-solution",
    promptTemplate: "Write a problem-solution format script about: {input}",
  },
} as const;

export const TOAST_MESSAGES = {
  NO_SCRIPT_TO_SAVE: {
    title: "No script to save",
    description: "Generate a script first before saving",
  },
  SCRIPT_UPDATED: {
    title: "Script updated successfully",
    description: "Your changes have been saved to the library",
  },
  SCRIPT_SAVED: {
    title: "Script saved to library",
    description: (title: string) => `"${title}" has been added to your scripts`,
  },
  SAVE_FAILED: {
    title: "Failed to save script",
    description: "Please try again or check your connection",
  },
} as const;

export const TRANSCRIPTION_STEPS: TranscriptionStepData[] = [
  {
    id: "url_detection",
    label: "URL Detection",
    status: "completed",
    description: "Social media URL recognized",
  },
  {
    id: "video_extraction",
    label: "Video Extraction",
    status: "in_progress",
    description: "Extracting video from platform",
  },
  {
    id: "transcription",
    label: "Transcription",
    status: "pending",
    description: "Converting audio to text using AI",
  },
  {
    id: "analysis_prep",
    label: "Analysis Preparation",
    status: "pending",
    description: "Preparing content for script analysis",
  },
];

export const ORCHESTRATOR_CONFIG = {
  ENABLE_LOGGING: true,
  TIMEOUT: 120000, // 2 minutes
} as const;

export const QUICK_GENERATORS_CONFIG: Record<string, Partial<ScriptGeneratorData>> = {
  "generate-hooks": {
    icon: "send",
    label: "Hook Generator",
  },
  "content-ideas": {
    icon: "sparkles",
    label: "Ideation",
  },
} as const;

export const TEMPLATES_CONFIG: Record<string, Partial<ScriptGeneratorData & { duration: string }>> = {
  "if-then-script": {
    icon: "power",
    label: "Conditional",
    duration: "2 min",
  },
  "problem-solution": {
    icon: "check-circle",
    label: "Solution-Based",
    duration: "3 min",
  },
} as const;

export const DEFAULT_VALUES = {
  SCRIPT_TITLE: "Generated Script",
  PERSONA_NAME: "default persona",
  CATEGORY: "general",
  APPROACH: "ai-voice" as const,
  SOURCE: "scripting" as const,
  FALLBACK_CONTENT: "No content available",
} as const;

export const UI_CONSTANTS = {
  CHAT_INPUT_PLACEHOLDER: "Write a script about... or paste an Instagram/TikTok URL",
  HERO_TITLE_LINE_1: "Ready to create something amazing?",
  HERO_TITLE_LINE_2: "Let's write your script.",
  HERO_SUBTITLE: "Tell me what you want to create, and I'll help you craft the perfect script.",
  TIP_MESSAGE: "💡 Tip: Be specific about your topic and target audience for better results",
  ACTION_HINT: "💡 Click any script section above to access AI-powered improvements",
  TOOLBAR_BACK_BUTTON: "Back to Input",
} as const;
