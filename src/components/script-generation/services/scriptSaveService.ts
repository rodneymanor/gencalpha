import { toast } from "sonner";

import { TOAST_MESSAGES, DEFAULT_APPROACH, DEFAULT_SOURCE } from "../constants";
import type { PersonaOption } from "../types/script-writer-types";
import { extractScriptTitle, createScriptTags, createScriptSummary, getScriptCategory } from "../utils";

export interface ScriptSaveParams {
  generatedScript: string;
  scriptTitle: string;
  savedScriptId: string | null;
  selectedPersona: PersonaOption | null;
  selectedTemplate: string | null;
  selectedQuickGenerator: string | null;
  inputValue: string;
}

export interface ScriptApiHooks {
  createScript: (params: any) => Promise<any>;
  updateScript: (id: string, params: any) => Promise<any>;
}

export class ScriptSaveService {
  constructor(
    private apiHooks: ScriptApiHooks,
    private onSuccess: (scriptId: string, title: string) => void,
  ) {}

  async saveScript(params: ScriptSaveParams): Promise<void> {
    const {
      generatedScript,
      scriptTitle,
      savedScriptId,
      selectedPersona,
      selectedTemplate,
      selectedQuickGenerator,
      inputValue,
    } = params;

    if (!generatedScript.trim()) {
      console.error("No script to save");
      toast.error(TOAST_MESSAGES.NO_SCRIPT_TO_SAVE.title, {
        description: TOAST_MESSAGES.NO_SCRIPT_TO_SAVE.description,
        duration: TOAST_MESSAGES.NO_SCRIPT_TO_SAVE.duration,
      });
      return;
    }

    try {
      const extractedTitle = extractScriptTitle(generatedScript, scriptTitle);
      const tags = createScriptTags(selectedPersona, selectedTemplate, selectedQuickGenerator);
      const summary = createScriptSummary(selectedPersona);

      if (savedScriptId) {
        await this.updateExistingScript(savedScriptId, extractedTitle, generatedScript, tags, summary);
      } else {
        const scriptId = await this.createNewScript(
          extractedTitle,
          generatedScript,
          tags,
          summary,
          inputValue,
          selectedQuickGenerator,
          selectedTemplate,
        );
        if (scriptId) {
          this.onSuccess(scriptId, extractedTitle);
        }
      }
    } catch (error) {
      console.error("Error saving script:", error);
      toast.error(TOAST_MESSAGES.SAVE_ERROR.title, {
        description: TOAST_MESSAGES.SAVE_ERROR.description,
        duration: TOAST_MESSAGES.SAVE_ERROR.duration,
      });
      throw error;
    }
  }

  private async updateExistingScript(
    scriptId: string,
    title: string,
    content: string,
    tags: string[],
    summary: string,
  ): Promise<void> {
    const updatedScript = await this.apiHooks.updateScript(scriptId, {
      content,
      title,
      tags,
      summary,
    });

    if (updatedScript) {
      console.log("Script updated successfully:", updatedScript.id);
      toast.success(TOAST_MESSAGES.SCRIPT_UPDATED.title, {
        description: TOAST_MESSAGES.SCRIPT_UPDATED.description,
        duration: TOAST_MESSAGES.SCRIPT_UPDATED.duration,
      });
    }
  }

  private async createNewScript(
    title: string,
    content: string,
    tags: string[],
    summary: string,
    originalIdea: string,
    selectedQuickGenerator: string | null,
    selectedTemplate: string | null,
  ): Promise<string | null> {
    const category = getScriptCategory(selectedQuickGenerator, selectedTemplate);

    const newScript = await this.apiHooks.createScript({
      title,
      content,
      category,
      tags,
      summary,
      approach: DEFAULT_APPROACH,
      originalIdea,
      source: DEFAULT_SOURCE,
    });

    if (newScript) {
      console.log("Script saved successfully:", newScript.id);
      toast.success(TOAST_MESSAGES.SCRIPT_SAVED.title, {
        description: `"${title}" has been added to your scripts`,
        duration: TOAST_MESSAGES.SCRIPT_SAVED.duration,
      });
      return newScript.id;
    }

    return null;
  }
}
