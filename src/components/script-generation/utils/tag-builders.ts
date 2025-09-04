import type { PersonaOption } from "../types/script-writer-types";

/**
 * Creates tags array for script metadata
 * Consolidates the duplicated logic from lines 276-280 and 299-303
 */
export function buildScriptTags(options: {
  selectedPersona?: PersonaOption | null;
  selectedTemplate?: string | null;
  selectedQuickGenerator?: string | null;
}): string[] {
  const { selectedPersona, selectedTemplate, selectedQuickGenerator } = options;
  
  const tags: string[] = [];
  
  if (selectedPersona) {
    tags.push(`persona:${selectedPersona.id}`);
  }
  
  if (selectedTemplate) {
    tags.push(`template:${selectedTemplate}`);
  }
  
  if (selectedQuickGenerator) {
    tags.push(`generator:${selectedQuickGenerator}`);
  }
  
  return tags;
}

/**
 * Generates a summary string for script metadata
 * Consolidates the repeated summary generation logic
 */
export function buildScriptSummary(selectedPersona?: PersonaOption | null): string {
  const personaName = selectedPersona?.name ?? "default persona";
  return `Script generated with ${personaName}`;
}
