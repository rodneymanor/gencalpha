import type { QuickGenerator, Template } from "../types";

// Icon mapping for quick generators
export const QUICK_GENERATOR_ICONS = {
  "generate-hooks": "send" as const,
  "content-ideas": "sparkles" as const,
  "value-bombs": "zap" as const,
  default: "heart" as const,
} as const;

// Icon mapping for templates
export const TEMPLATE_ICONS = {
  "if-then-script": "power" as const,
  "problem-solution": "check-circle" as const,
  default: "layers" as const,
} as const;

// Label mapping for quick generators
export const QUICK_GENERATOR_LABELS = {
  "generate-hooks": "Hook Generator",
  "content-ideas": "Ideation",
  "value-bombs": "Value Tips",
  default: "Value Content",
} as const;

// Label mapping for templates
export const TEMPLATE_LABELS = {
  "if-then-script": "Conditional",
  "problem-solution": "Solution-Based",
  default: "Tutorial",
} as const;

// Duration mapping for templates
export const TEMPLATE_DURATIONS = {
  "if-then-script": "2 min",
  "problem-solution": "3 min",
  default: "5 min",
} as const;

// Prompt enhancement mapping for generators
export const GENERATOR_PROMPT_ENHANCERS = {
  "generate-hooks": (prompt: string) => `Generate 10 different hooks for: ${prompt}`,
  "content-ideas": (prompt: string) => `Generate content ideas for: ${prompt}`,
  "value-bombs": (prompt: string) => `Generate 10 high-value actionable tips for: ${prompt}`,
  default: (generator: { title: string }, prompt: string) => `${generator.title}: ${prompt}`,
} as const;

// Prompt enhancement mapping for templates
export const TEMPLATE_PROMPT_ENHANCERS = {
  "if-then-script": (prompt: string) => `Create an "If this, then that" conditional script about: ${prompt}`,
  "problem-solution": (prompt: string) => `Write a problem-solution format script about: ${prompt}`,
  default: (template: { title: string }, prompt: string) => `${template.title} script: ${prompt}`,
} as const;

// Default values
export const DEFAULT_SCRIPT_TITLE = "Generated Script";
export const DEFAULT_CATEGORY = "general";
export const DEFAULT_PERSONA_NAME = "default persona";
export const DEFAULT_APPROACH = "ai-voice" as const;
export const DEFAULT_SOURCE = "scripting" as const;

// Toast messages
export const TOAST_MESSAGES = {
  NO_SCRIPT_TO_SAVE: {
    title: "No script to save",
    description: "Generate a script first before saving",
    duration: 3000,
  },
  SCRIPT_UPDATED: {
    title: "Script updated successfully",
    description: "Your changes have been saved to the library",
    duration: 3000,
  },
  SCRIPT_SAVED: {
    title: "Script saved to library",
    duration: 3000,
  },
  SAVE_ERROR: {
    title: "Failed to save script",
    description: "Please try again or check your connection",
    duration: 4000,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERATION_FALLBACK: "Script generation encountered an issue, but we provided a template to get you started.",
  FALLBACK_INDICATOR: "⚠️ Note:",
} as const;
