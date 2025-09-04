import { toast } from "sonner";
import { useScriptsApi } from "@/hooks/use-scripts-api";
import type { PersonaOption } from "../types/script-writer-types";
import { buildScriptTags, buildScriptSummary } from "../utils/tag-builders";
import { extractScriptTitle } from "../utils/formatters";
import { TOAST_MESSAGES, DEFAULT_VALUES } from "../utils/constants";
import type { ScriptSaveData, ScriptUpdateData } from "../types/script-writer-types";

export interface ScriptPersistenceOptions {
  generatedScript: string;
  scriptTitle: string;
  savedScriptId: string | null;
  selectedPersona: PersonaOption | null;
  selectedTemplate: string | null;
  selectedQuickGenerator: string | null;
  inputValue: string;
}

export interface ScriptPersistenceCallbacks {
  onSaveStart: () => void;
  onSaveComplete: (scriptId: string, title: string) => void;
  onSaveError: () => void;
}

/**
 * Service class for handling script persistence operations
 * Consolidates save/update logic from lines 254-331
 */
export class ScriptPersistenceService {
  constructor(
    private createScript: ReturnType<typeof useScriptsApi>['createScript'],
    private updateScript: ReturnType<typeof useScriptsApi>['updateScript']
  ) {}

  async saveScript(
    options: ScriptPersistenceOptions,
    callbacks: ScriptPersistenceCallbacks
  ): Promise<void> {
    const {
      generatedScript,
      scriptTitle,
      savedScriptId,
      selectedPersona,
      selectedTemplate,
      selectedQuickGenerator,
      inputValue,
    } = options;

    if (!generatedScript.trim()) {
      console.error("No script to save");
      toast.error(TOAST_MESSAGES.NO_SCRIPT_TO_SAVE.title, {
        description: TOAST_MESSAGES.NO_SCRIPT_TO_SAVE.description,
        duration: 3000,
      });
      return;
    }

    callbacks.onSaveStart();

    try {
      // Extract title from the script or use the provided title
      const extractedTitle = extractScriptTitle(generatedScript, scriptTitle);

      // Build common metadata
      const tags = buildScriptTags({
        selectedPersona,
        selectedTemplate,
        selectedQuickGenerator,
      });
      const summary = buildScriptSummary(selectedPersona);

      if (savedScriptId) {
        // Update existing script
        await this.updateExistingScript(savedScriptId, {
          content: generatedScript,
          title: extractedTitle,
          tags,
          summary,
        });
        callbacks.onSaveComplete(savedScriptId, extractedTitle);
      } else {
        // Create new script
        const newScriptId = await this.createNewScript({
          title: extractedTitle,
          content: generatedScript,
          category: selectedQuickGenerator ?? selectedTemplate ?? DEFAULT_VALUES.CATEGORY,
          tags,
          summary,
          approach: DEFAULT_VALUES.APPROACH,
          originalIdea: inputValue,
          source: DEFAULT_VALUES.SOURCE,
        });
        
        if (newScriptId) {
          callbacks.onSaveComplete(newScriptId, extractedTitle);
        }
      }
    } catch (error) {
      console.error("Error saving script:", error);
      toast.error(TOAST_MESSAGES.SAVE_FAILED.title, {
        description: TOAST_MESSAGES.SAVE_FAILED.description,
        duration: 4000,
      });
      callbacks.onSaveError();
    }
  }

  private async updateExistingScript(
    scriptId: string,
    updateData: ScriptUpdateData
  ): Promise<void> {
    const updatedScript = await this.updateScript(scriptId, updateData);

    if (updatedScript) {
      console.log("Script updated successfully:", updatedScript.id);
      toast.success(TOAST_MESSAGES.SCRIPT_UPDATED.title, {
        description: TOAST_MESSAGES.SCRIPT_UPDATED.description,
        duration: 3000,
      });
    }
  }

  private async createNewScript(saveData: ScriptSaveData): Promise<string | null> {
    const newScript = await this.createScript(saveData);

    if (newScript) {
      console.log("Script saved successfully:", newScript.id);
      toast.success(TOAST_MESSAGES.SCRIPT_SAVED.title, {
        description: TOAST_MESSAGES.SCRIPT_SAVED.description(saveData.title),
        duration: 3000,
      });
      return newScript.id;
    }
    
    return null;
  }
}
