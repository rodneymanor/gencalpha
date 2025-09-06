import { useState } from "react";

import type { FlowState, SidebarTab } from "../types";
import type { PersonaOption } from "../types/script-writer-types";

export function useScriptState(initialPrompt = "") {
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [inputValue, setInputValue] = useState(initialPrompt);
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [scriptTitle, setScriptTitle] = useState("Generated Script");
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null);

  // Editing state
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("analysis");
  const [wordCount, setWordCount] = useState(0);
  const [showComplexityView, setShowComplexityView] = useState(true);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  // Debug state for transcription
  const [transcriptionDebug, setTranscriptionDebug] = useState<{
    currentStep: string;
    status: string;
    error?: string;
    url?: string;
    transcript?: string;
    formattedScript?: string;
  }>({
    currentStep: "Idle",
    status: "Ready",
  });

  // Toggle for transcript view mode
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const handleScriptUpdate = (updatedScript: string) => {
    setGeneratedScript(updatedScript);
    // Clear error state when user starts editing
    if (lastError) {
      setLastError(null);
    }
  };

  const handleBackToInput = () => {
    setFlowState("input");
    setInputValue("");
    setGeneratedScript("");
    setLastError(null);
  };

  const handlePersonaSelect = (persona: PersonaOption | null) => {
    setSelectedPersona(persona);
  };

  const handleChatPersonaSelect = (personaId: string) => {
    const personaOption =
      selectedPersona?.id === personaId ? null : ({ id: personaId, name: personaId, description: "" } as PersonaOption);
    handlePersonaSelect(personaOption);
  };

  const addRecentAction = (action: string) => {
    setRecentActions((prev) => [action, ...prev.slice(0, 4)]);
  };

  return {
    // State
    flowState,
    inputValue,
    selectedPersona,
    generatedScript,
    scriptTitle,
    savedScriptId,
    sidebarTab,
    wordCount,
    showComplexityView,
    recentActions,
    lastError,
    transcriptionDebug,
    showFullTranscript,

    // Setters
    setFlowState,
    setInputValue,
    setGeneratedScript,
    setScriptTitle,
    setSavedScriptId,
    setSidebarTab,
    setWordCount,
    setLastError,
    setTranscriptionDebug,
    setShowFullTranscript,

    // Actions
    handleScriptUpdate,
    handleBackToInput,
    handlePersonaSelect,
    handleChatPersonaSelect,
    addRecentAction,
  };
}
