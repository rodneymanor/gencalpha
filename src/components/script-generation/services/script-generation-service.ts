import type { PersonaOption } from "../types/script-writer-types";
import type { ScriptGeneratorData } from "../types/script-writer-types";
import { enhancePrompt } from "../utils/prompt-enhancers";

export interface ScriptGenerationOptions {
  prompt: string;
  selectedPersona: PersonaOption | null;
  selectedQuickGenerator: string | null;
  selectedTemplate: string | null;
  generators: ScriptGeneratorData[];
  templates: ScriptGeneratorData[];
}

export interface ScriptGenerationCallbacks {
  onStart: (enhancedPrompt: string) => void;
  onComplete: (script: string) => void;
  onError: (error: string) => void;
}

/**
 * Service class for handling script generation operations
 * Consolidates the generation logic and prompt enhancement from lines 170-208
 */
export class ScriptGenerationService {
  /**
   * Processes script generation request
   * Replaces the prompt enhancement logic from lines 170-208
   */
  async generateScript(options: ScriptGenerationOptions, callbacks: ScriptGenerationCallbacks): Promise<void> {
    const { prompt, selectedQuickGenerator, selectedTemplate, generators, templates } = options;

    if (!prompt.trim()) {
      callbacks.onError("Empty prompt provided");
      return;
    }

    try {
      // Enhance prompt based on template/generator selection
      const enhancedPrompt = enhancePrompt(prompt.trim(), {
        selectedGenerator: selectedQuickGenerator,
        selectedTemplate: selectedTemplate,
        generators,
        templates,
      });

      console.log("🎯 [ScriptGenerationService] Enhanced prompt:", enhancedPrompt);

      // Notify that generation is starting
      callbacks.onStart(enhancedPrompt);

      // Note: The actual generation logic is handled by ScriptGenerationTimeline
      // This service focuses on prompt preparation and flow coordination
    } catch (error) {
      console.error("❌ [ScriptGenerationService] Error during generation:", error);
      callbacks.onError(`Generation error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Validates if a script generation result indicates an error
   * Extracted from lines 211-216
   */
  isErrorScript(script: string): boolean {
    return script.includes("⚠️ Note:");
  }

  /**
   * Processes the completion of script generation
   * Extracted from handleGenerationComplete logic
   */
  processGenerationResult(script: string): {
    script: string;
    hasError: boolean;
    errorMessage?: string;
  } {
    const hasError = this.isErrorScript(script);

    return {
      script,
      hasError,
      errorMessage: hasError
        ? "Script generation encountered an issue, but we provided a template to get you started."
        : undefined,
    };
  }
}
