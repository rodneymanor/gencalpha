import {
  QUICK_GENERATOR_ICONS,
  TEMPLATE_ICONS,
  QUICK_GENERATOR_LABELS,
  TEMPLATE_LABELS,
  TEMPLATE_DURATIONS,
  GENERATOR_PROMPT_ENHANCERS,
  TEMPLATE_PROMPT_ENHANCERS,
} from "../constants";
import { CONTENT_ACTIONS } from "../constants/content-actions";
import type { QuickGenerator, Template } from "../types";
import type { PersonaOption } from "../types/script-writer-types";

/**
 * Transforms CONTENT_ACTIONS into QuickGenerator format
 */
export function mapContentActionsToQuickGenerators(): QuickGenerator[] {
  return CONTENT_ACTIONS.filter((action) => action.category === "generators").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon: QUICK_GENERATOR_ICONS[action.key as keyof typeof QUICK_GENERATOR_ICONS] ?? QUICK_GENERATOR_ICONS.default,
    label: QUICK_GENERATOR_LABELS[action.key as keyof typeof QUICK_GENERATOR_LABELS] ?? QUICK_GENERATOR_LABELS.default,
  }));
}

/**
 * Transforms CONTENT_ACTIONS into Template format
 */
export function mapContentActionsToTemplates(): Template[] {
  return CONTENT_ACTIONS.filter((action) => action.category === "templates").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon: TEMPLATE_ICONS[action.key as keyof typeof TEMPLATE_ICONS] ?? TEMPLATE_ICONS.default,
    label: TEMPLATE_LABELS[action.key as keyof typeof TEMPLATE_LABELS] ?? TEMPLATE_LABELS.default,
    duration: TEMPLATE_DURATIONS[action.key as keyof typeof TEMPLATE_DURATIONS] ?? TEMPLATE_DURATIONS.default,
  }));
}

/**
 * Enhances a prompt based on selected generator
 */
export function enhancePromptForGenerator(prompt: string, generatorId: string, generators: QuickGenerator[]): string {
  const enhancer = GENERATOR_PROMPT_ENHANCERS[generatorId as keyof typeof GENERATOR_PROMPT_ENHANCERS];

  if (enhancer) {
    if (typeof enhancer === "function" && enhancer.length === 1) {
      return enhancer(prompt);
    }
    // For default enhancer that needs generator object
    const generator = generators.find((g) => g.id === generatorId);
    if (generator && GENERATOR_PROMPT_ENHANCERS.default) {
      return GENERATOR_PROMPT_ENHANCERS.default(generator, prompt);
    }
  }

  return prompt;
}

/**
 * Enhances a prompt based on selected template
 */
export function enhancePromptForTemplate(prompt: string, templateId: string, templates: Template[]): string {
  const enhancer = TEMPLATE_PROMPT_ENHANCERS[templateId as keyof typeof TEMPLATE_PROMPT_ENHANCERS];

  if (enhancer) {
    if (typeof enhancer === "function" && enhancer.length === 1) {
      return enhancer(prompt);
    }
    // For default enhancer that needs template object
    const template = templates.find((t) => t.id === templateId);
    if (template && TEMPLATE_PROMPT_ENHANCERS.default) {
      return TEMPLATE_PROMPT_ENHANCERS.default(template, prompt);
    }
  }

  return prompt;
}

/**
 * Extracts title from script content
 */
export function extractScriptTitle(script: string, fallbackTitle: string): string {
  const lines = script.split("\n");
  const firstLine = lines.find((line) => line.trim() && !line.startsWith("**"));
  return firstLine?.trim() ?? fallbackTitle;
}

/**
 * Creates tags array for script saving
 */
export function createScriptTags(
  selectedPersona: PersonaOption | null,
  selectedTemplate: string | null,
  selectedQuickGenerator: string | null,
): string[] {
  return [
    ...(selectedPersona ? [`persona:${selectedPersona.id}`] : []),
    ...(selectedTemplate ? [`template:${selectedTemplate}`] : []),
    ...(selectedQuickGenerator ? [`generator:${selectedQuickGenerator}`] : []),
  ];
}

/**
 * Creates script summary for saving
 */
export function createScriptSummary(selectedPersona: PersonaOption | null): string {
  return `Script generated with ${selectedPersona?.name ?? "default persona"}`;
}

/**
 * Determines script category for saving
 */
export function getScriptCategory(selectedQuickGenerator: string | null, selectedTemplate: string | null): string {
  return selectedQuickGenerator ?? selectedTemplate ?? "general";
}

/**
 * Calculates word count from BlockNote content
 */
export function calculateWordCount(content: any): number {
  if (!content || !Array.isArray(content)) return 0;

  let count = 0;
  content.forEach((block: any) => {
    if (block.type === "paragraph" && block.content) {
      block.content.forEach((item: any) => {
        if (item.type === "text" && item.text) {
          count += item.text.split(/\s+/).filter((word: string) => word.length > 0).length;
        }
      });
    }
  });

  return count;
}

/**
 * Checks if script content indicates a generation error
 */
export function isScriptGenerationError(script: string): boolean {
  return script.includes("⚠️ Note:");
}
