import { GENERATOR_TEMPLATES, SCRIPT_TEMPLATES } from "./constants";
import type { ScriptGeneratorData } from "../types/script-writer-types";

/**
 * Enhances a prompt based on selected quick generator
 * Consolidates the switch logic from lines 177-187
 */
export function enhancePromptWithGenerator(
  prompt: string,
  selectedGenerator: string | null,
  generators: ScriptGeneratorData[]
): string {
  if (!selectedGenerator) return prompt;
  
  const generator = generators.find((g) => g.id === selectedGenerator);
  if (!generator) return prompt;
  
  switch (generator.id) {
    case GENERATOR_TEMPLATES.GENERATE_HOOKS.id:
      return GENERATOR_TEMPLATES.GENERATE_HOOKS.promptTemplate.replace("{input}", prompt);
    case GENERATOR_TEMPLATES.CONTENT_IDEAS.id:
      return GENERATOR_TEMPLATES.CONTENT_IDEAS.promptTemplate.replace("{input}", prompt);
    default:
      return `${generator.title}: ${prompt}`;
  }
}

/**
 * Enhances a prompt based on selected template
 * Consolidates the switch logic from lines 193-203
 */
export function enhancePromptWithTemplate(
  prompt: string,
  selectedTemplate: string | null,
  templates: ScriptGeneratorData[]
): string {
  if (!selectedTemplate) return prompt;
  
  const template = templates.find((t) => t.id === selectedTemplate);
  if (!template) return prompt;
  
  switch (template.id) {
    case SCRIPT_TEMPLATES.IF_THEN.id:
      return SCRIPT_TEMPLATES.IF_THEN.promptTemplate.replace("{input}", prompt);
    case SCRIPT_TEMPLATES.PROBLEM_SOLUTION.id:
      return SCRIPT_TEMPLATES.PROBLEM_SOLUTION.promptTemplate.replace("{input}", prompt);
    default:
      return `${template.title} script: ${prompt}`;
  }
}

/**
 * Applies all prompt enhancements in sequence
 * Replaces the combined logic from lines 174-204
 */
export function enhancePrompt(
  basePrompt: string,
  options: {
    selectedGenerator?: string | null;
    selectedTemplate?: string | null;
    generators: ScriptGeneratorData[];
    templates: ScriptGeneratorData[];
  }
): string {
  let enhancedPrompt = basePrompt;
  
  // Apply generator enhancement first
  enhancedPrompt = enhancePromptWithGenerator(
    enhancedPrompt,
    options.selectedGenerator,
    options.generators
  );
  
  // Then apply template enhancement
  enhancedPrompt = enhancePromptWithTemplate(
    enhancedPrompt,
    options.selectedTemplate,
    options.templates
  );
  
  return enhancedPrompt;
}
