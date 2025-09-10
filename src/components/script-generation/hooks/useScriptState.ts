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

  // History for undo/redo
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const applyGeneratedScript = (next: string) => {
    if (next === generatedScript) return;
    setPast((p) => [...p, generatedScript]);
    setGeneratedScript(next);
    setFuture([]);
    // Clear error state when content changes
    if (lastError) setLastError(null);
  };

  const undo = () => {
    if (!canUndo) return;
    setPast((p) => {
      const prev = [...p];
      const last = prev.pop() as string;
      setFuture((f) => [generatedScript, ...f]);
      setGeneratedScript(last);
      return prev;
    });
  };

  const redo = () => {
    if (!canRedo) return;
    setFuture((f) => {
      const nextArr = [...f];
      const next = nextArr.shift() as string;
      setPast((p) => [...p, generatedScript]);
      setGeneratedScript(next);
      return nextArr;
    });
  };

  const handleScriptUpdate = (updatedScript: string) => {
    applyGeneratedScript(updatedScript);
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
    canUndo,
    canRedo,

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
    applyGeneratedScript,
    undo,
    redo,
  };
}
