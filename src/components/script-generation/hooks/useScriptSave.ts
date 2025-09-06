import { useState, useCallback } from "react";

import { useScriptsApi } from "@/hooks/use-scripts-api";

import { ScriptSaveService } from "../services/scriptSaveService";
import type { PersonaOption } from "../types/script-writer-types";

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

  return {
    isSaving,
    handleSaveScript,
  };
}
