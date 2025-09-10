import { useState, useCallback } from "react";

import { useScriptsApi } from "@/hooks/use-scripts-api";

import { ScriptSaveService } from "../services/scriptSaveService";
import type { PersonaOption } from "../types/script-writer-types";
import { extractScriptTitle, getScriptCategory } from "../utils";
import { DEFAULT_APPROACH, DEFAULT_SOURCE } from "../constants";

interface UseScriptSaveParams {
  generatedScript: string;
  scriptTitle: string;
  savedScriptId: string | null;
  selectedPersona: PersonaOption | null;
  selectedTemplate: string | null;
  selectedQuickGenerator: string | null;
  inputValue: string;
  onSaveSuccess: (scriptId: string, title: string) => void;
}

export function useScriptSave(params: UseScriptSaveParams) {
  const [isSaving, setIsSaving] = useState(false);
  const { createScript, updateScript } = useScriptsApi();

  const handleSaveScript = useCallback(async () => {
    setIsSaving(true);

    try {
      const scriptSaveService = new ScriptSaveService({ createScript, updateScript }, params.onSaveSuccess);

      await scriptSaveService.saveScript({
        generatedScript: params.generatedScript,
        scriptTitle: params.scriptTitle,
        savedScriptId: params.savedScriptId,
        selectedPersona: params.selectedPersona,
        selectedTemplate: params.selectedTemplate,
        selectedQuickGenerator: params.selectedQuickGenerator,
        inputValue: params.inputValue,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    createScript,
    updateScript,
    params.generatedScript,
    params.scriptTitle,
    params.savedScriptId,
    params.selectedPersona,
    params.selectedTemplate,
    params.selectedQuickGenerator,
    params.inputValue,
    params.onSaveSuccess,
  ]);

  // Silent autosave that does not show toasts
  const handleAutoSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (params.savedScriptId) {
        await updateScript(params.savedScriptId, {
          content: params.generatedScript,
          title: params.scriptTitle,
        });
      } else {
        // Silent create with minimal required fields
        const title = extractScriptTitle(params.generatedScript, params.scriptTitle || "Generated Script");
        const category = getScriptCategory(params.selectedQuickGenerator, params.selectedTemplate);
        const created = await createScript({
          title,
          content: params.generatedScript,
          category,
          approach: DEFAULT_APPROACH,
          originalIdea: params.inputValue,
          source: DEFAULT_SOURCE,
        });
        if (created) {
          // Inform upstream to set ids/titles without user-facing toasts
          params.onSaveSuccess(created.id, title);
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    updateScript,
    createScript,
    params.savedScriptId,
    params.generatedScript,
    params.scriptTitle,
    params.selectedQuickGenerator,
    params.selectedTemplate,
    params.inputValue,
    params.onSaveSuccess,
  ]);

  return {
    isSaving,
    handleSaveScript,
    handleAutoSave,
  };
}
