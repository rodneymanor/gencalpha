import { useState, useCallback } from "react";
import type { PersonaOption } from "../types/script-writer-types";
import type { FlowState, ScriptWriterState } from "../types/script-writer-types";
import { FLOW_STATES, SIDEBAR_TABS, DEFAULT_VALUES } from "../utils/constants";

/**
 * Custom hook for managing all script writer state
 * Consolidates the 15+ useState hooks from the original component
 */
export function useScriptWriterState(initialPrompt = "") {
  // Core flow state
  const [flowState, setFlowState] = useState<FlowState>(FLOW_STATES.INPUT as FlowState);
  const [inputValue, setInputValue] = useState(initialPrompt);
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [scriptTitle, setScriptTitle] = useState(DEFAULT_VALUES.SCRIPT_TITLE);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null);
  
  // Template and generator selection state
  const [selectedQuickGenerator, setSelectedQuickGenerator] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Editing state - sidebar and toolbar management
  const [sidebarTab, setSidebarTab] = useState<"analysis" | "metrics" | "suggestions">(SIDEBAR_TABS.ANALYSIS as "analysis");
  const [wordCount, setWordCount] = useState(0);
  const [showComplexityView, setShowComplexityView] = useState(true);
  
  // AI Action Sidebar state
  const [recentActions, setRecentActions] = useState<string[]>([]);
  
  // Error handling state
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);

  // State transition functions
  const startTranscription = useCallback(() => {
    setFlowState(FLOW_STATES.TRANSCRIBING as FlowState);
    setIsTranscribing(true);
  }, []);

  const startGeneration = useCallback((enhancedPrompt: string) => {
    setInputValue(enhancedPrompt);
    setFlowState(FLOW_STATES.GENERATING as FlowState);
  }, []);

  const completeGeneration = useCallback((script: string, hasError?: boolean, errorMessage?: string) => {
    setGeneratedScript(script);
    setFlowState(FLOW_STATES.EDITING as FlowState);
    if (hasError && errorMessage) {
      setLastError(errorMessage);
    } else {
      setLastError(null);
    }
  }, []);

  const completeTranscription = useCallback((script: string, title: string) => {
    setGeneratedScript(script);
    setScriptTitle(title);
    setFlowState(FLOW_STATES.EDITING as FlowState);
    setIsTranscribing(false);
  }, []);

  const handleError = useCallback((error: string) => {
    setLastError(error);
    setFlowState(FLOW_STATES.INPUT as FlowState);
    setIsTranscribing(false);
  }, []);

  const resetToInput = useCallback(() => {
    setFlowState(FLOW_STATES.INPUT as FlowState);
    setInputValue("");
    setGeneratedScript("");
    setLastError(null);
    setSelectedQuickGenerator(null);
    setSelectedTemplate(null);
    setIsTranscribing(false);
  }, []);

  const updateScript = useCallback((updatedScript: string) => {
    setGeneratedScript(updatedScript);
    if (lastError) {
      setLastError(null);
    }
  }, [lastError]);

  const handlePersonaSelect = useCallback((persona: PersonaOption | null) => {
    setSelectedPersona(persona);
  }, []);

  const handleChatPersonaSelect = useCallback((personaId: string) => {
    const personaOption = selectedPersona?.id === personaId 
      ? null 
      : ({ id: personaId, name: personaId, description: "" } as PersonaOption);
    setSelectedPersona(personaOption);
  }, [selectedPersona]);

  const handleQuickGeneratorSelect = useCallback((generatorId: string) => {
    if (selectedQuickGenerator === generatorId) {
      setSelectedQuickGenerator(null);
      setSelectedTemplate(null);
    } else {
      setSelectedQuickGenerator(generatorId);
      setSelectedTemplate(null);
    }
  }, [selectedQuickGenerator]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      setSelectedQuickGenerator(null);
    } else {
      setSelectedTemplate(templateId);
      setSelectedQuickGenerator(null);
    }
  }, [selectedTemplate]);

  const addRecentAction = useCallback((action: string) => {
    setRecentActions(prev => [action, ...prev.slice(0, 4)]);
  }, []);

  const handleSaveComplete = useCallback((scriptId: string, title: string) => {
    setSavedScriptId(scriptId);
    setScriptTitle(title);
    setIsSaving(false);
  }, []);

  // Computed state
  const state: ScriptWriterState = {
    flowState,
    inputValue,
    selectedPersona,
    generatedScript,
    scriptTitle,
    isSaving,
    savedScriptId,
    selectedQuickGenerator,
    selectedTemplate,
    sidebarTab,
    wordCount,
    showComplexityView,
    recentActions,
    lastError,
    isTranscribing,
  };

  // Actions
  const actions = {
    setInputValue,
    setIsSaving,
    setSidebarTab,
    setWordCount,
    setLastError,
    startTranscription,
    startGeneration,
    completeGeneration,
    completeTranscription,
    handleError,
    resetToInput,
    updateScript,
    handlePersonaSelect,
    handleChatPersonaSelect,
    handleQuickGeneratorSelect,
    handleTemplateSelect,
    addRecentAction,
    handleSaveComplete,
  };

  return {
    state,
    actions,
  };
}
