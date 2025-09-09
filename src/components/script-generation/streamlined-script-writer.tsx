"use client";

import React from "react";

import { EditingView } from "./components/views/editing-view";
import { GeneratingView } from "./components/views/generating-view";
import { InputView } from "./components/views/input-view";
import { TranscribingView } from "./components/views/transcribing-view";
import { useScriptGeneration } from "./hooks/useScriptGeneration";
import type { StreamlinedScriptWriterProps } from "./types";

export function StreamlinedScriptWriter({
  initialPrompt = "",
  onScriptComplete,
  className = "",
  fromLibrary = false,
  preselectedGenerator,
  preselectedTemplate,
  onBrandModalOpen,
  heroBanner,
}: StreamlinedScriptWriterProps) {
  // Use the main orchestrator hook that manages all state and logic
  const {
    // State
    flowState,
    inputValue,
    selectedPersona,
    generatedScript,
    sidebarTab,
    wordCount,
    showComplexityView,
    lastError,
    scriptAnalysis,
    isSaving,
    selectedQuickGenerator,
    selectedTemplate,
    quickGenerators,
    templates,
    transcriptionDebug,

    // Setters
    setInputValue,
    setSidebarTab,
    setLastError,

    // Handlers
    handleSend,
    handleGenerationComplete,
    handleBackToInput,
    handleSaveScript,
    handleToolbarAction,
    handleActionTrigger,
    handleCreateCustomTemplate,
    handlePersonaSelect,
    handleChatPersonaSelect,
    handleQuickGeneratorSelect,
    handleTemplateSelect,
    handleScriptUpdate,
    showFullTranscript,
    setShowFullTranscript,
  } = useScriptGeneration({
    initialPrompt,
    onScriptComplete,
    fromLibrary,
    preselectedGenerator,
    preselectedTemplate,
  });

  // Render the appropriate view based on flow state
  if (flowState === "input") {
    return (
      <InputView
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSend}
        selectedPersona={selectedPersona}
        onPersonaSelect={handleChatPersonaSelect}
        onBrandModalOpen={onBrandModalOpen}
        heroBanner={heroBanner}
        className={className}
      />
    );
  }

  if (flowState === "generating") {
    return (
      <GeneratingView
        userPrompt={inputValue}
        selectedPersona={selectedPersona}
        selectedQuickGenerator={selectedQuickGenerator}
        onComplete={handleGenerationComplete}
      />
    );
  }

  if (flowState === "transcribing") {
    return <TranscribingView className={className} onBackToInput={handleBackToInput} />;
  }

  return (
    <EditingView
      generatedScript={generatedScript}
      selectedQuickGenerator={selectedQuickGenerator}
      onScriptUpdate={handleScriptUpdate}
      onBackToInput={handleBackToInput}
      lastError={lastError}
      onDismissError={() => setLastError(null)}
      scriptAnalysis={scriptAnalysis}
      showComplexityView={showComplexityView}
      sidebarTab={sidebarTab}
      setSidebarTab={setSidebarTab}
      wordCount={wordCount}
      onSave={handleSaveScript}
      onPersonaSelect={handlePersonaSelect}
      onActionTrigger={handleActionTrigger}
      onToolbarAction={handleToolbarAction}
      isSaving={isSaving}
      showFullTranscript={showFullTranscript}
      onTranscriptToggle={setShowFullTranscript}
      transcriptionDebug={transcriptionDebug}
      className={className}
    />
  );
}
