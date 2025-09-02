import { useState, useCallback } from "react";
import { type ActionType } from "@/components/write-chat/persona-selector";

export interface UseActionSelectionStateReturn {
  // Action system state
  selectedAction: ActionType | null;
  setSelectedAction: React.Dispatch<React.SetStateAction<ActionType | null>>;
  selectedQuickGenerator: string | undefined;
  setSelectedQuickGenerator: (id: string | undefined) => void;
  selectedTemplate: string | undefined;
  setSelectedTemplate: (id: string | undefined) => void;
  
  // Helper methods
  clearAllSelections: () => void;
  getSelectedActionKey: () => string | null;
}

export function useActionSelectionState(): UseActionSelectionStateReturn {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [selectedQuickGenerator, setSelectedQuickGenerator] = useState<string | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  
  const clearAllSelections = useCallback(() => {
    setSelectedAction(null);
    setSelectedQuickGenerator(undefined);
    setSelectedTemplate(undefined);
  }, []);
  
  const getSelectedActionKey = useCallback((): string | null => {
    return selectedAction ?? selectedQuickGenerator ?? selectedTemplate ?? null;
  }, [selectedAction, selectedQuickGenerator, selectedTemplate]);
  
  return {
    // State
    selectedAction,
    setSelectedAction,
    selectedQuickGenerator,
    setSelectedQuickGenerator,
    selectedTemplate,
    setSelectedTemplate,
    
    // Methods
    clearAllSelections,
    getSelectedActionKey,
  };
}
