"use client";

import React from "react";

import { EnhancedToolbar } from "@/components/editor/enhanced-toolbar";
import { AnalysisSidebar } from "@/components/writing-analysis/analysis-sidebar";
import { FloatingAiActionsPanel } from "@/components/writing-analysis/floating-ai-actions-panel";
import { InteractiveScript } from "@/components/writing-analysis/interactive-script";

import type { SidebarTab } from "../../types";
import type { PersonaOption } from "../../types/script-writer-types";
import { TranscriptToggle } from "../ui/transcript-toggle";

import { ContentListView } from "./content-list-view";

interface EditingViewProps {
  generatedScript: string;
  selectedQuickGenerator?: string | null;
  onScriptUpdate: (script: string) => void;
  onBackToInput: () => void;
  lastError: string | null;
  onDismissError: () => void;

  // Script analysis
  scriptAnalysis: any;
  showComplexityView: boolean;

  // Sidebar state
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  wordCount: number;

  // Toolbar handlers
  onSave: () => void;
  onPersonaSelect: (persona: PersonaOption | null) => void;
  onActionTrigger: (action: string, prompt: string) => void;
  onToolbarAction: (action: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Save state
  isSaving: boolean;

  // Transcript toggle state
  showFullTranscript: boolean;
  onTranscriptToggle: (showFull: boolean) => void;
  transcriptionDebug?: {
    transcript?: string;
    formattedScript?: string;
  };

  className?: string;
  onBrandModalOpen?: () => void;
}

export function EditingView({
  generatedScript,
  selectedQuickGenerator,
  onScriptUpdate,
  onBackToInput,
  lastError,
  onDismissError,
  scriptAnalysis,
  showComplexityView,
  sidebarTab,
  setSidebarTab,
  wordCount,
  onSave,
  onPersonaSelect,
  onActionTrigger,
  onToolbarAction,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  showFullTranscript,
  onTranscriptToggle,
  transcriptionDebug,
  className = "",
  onBrandModalOpen,
}: EditingViewProps) {
  // Helper function to filter out full transcript sections from components
  const filterOutFullTranscript = (script: string): string => {
    const lines = script.split("\n");
    const filteredLines: string[] = [];
    let skipSection = false;

    for (const line of lines) {
      // Check if this is a section header
      if (line.startsWith("## ")) {
        const sectionTitle = line.replace("## ", "").toLowerCase().trim();

        // Skip sections that look like full transcript sections
        skipSection = sectionTitle.includes("transcript");

        if (!skipSection) {
          filteredLines.push(line);
        }

        console.log(`🔍 [filterOutFullTranscript] Section "${sectionTitle}": ${skipSection ? "SKIPPED" : "KEPT"}`);
      } else if (!skipSection) {
        filteredLines.push(line);
      }
    }

    const result = filteredLines.join("\n");
    console.log(`🔍 [filterOutFullTranscript] Original length: ${script.length}, Filtered length: ${result.length}`);
    return result;
  };

  // Determine if transcript data is available
  const hasTranscriptData = !!(transcriptionDebug?.transcript ?? transcriptionDebug?.formattedScript);

  // Calculate the content to display based on toggle state
  const getDisplayScript = () => {
    console.log("🔄 [EditingView] Calculating displayScript:", {
      hasTranscriptData,
      showFullTranscript,
      hasTranscript: !!transcriptionDebug?.transcript,
      hasFormattedScript: !!transcriptionDebug?.formattedScript,
      transcriptLength: transcriptionDebug?.transcript?.length ?? 0,
      formattedScriptLength: transcriptionDebug?.formattedScript?.length ?? 0,
    });

    if (!hasTranscriptData) {
      console.log("📝 [EditingView] No transcript data, using generatedScript");
      return generatedScript;
    }

    if (showFullTranscript && transcriptionDebug?.transcript) {
      console.log("📰 [EditingView] Showing full transcript");
      return `## Full Transcript\n${transcriptionDebug.transcript}`;
    }

    if (!showFullTranscript && transcriptionDebug?.formattedScript) {
      console.log("🏗️ [EditingView] Showing formatted components");

      // Filter out any sections that might contain the full transcript
      const componentsOnly = filterOutFullTranscript(transcriptionDebug.formattedScript);
      console.log("🔍 [EditingView] Filtered components:", componentsOnly.substring(0, 200));

      return componentsOnly;
    }

    console.log("⚠️ [EditingView] Fallback to generatedScript");
    return generatedScript;
  };

  const displayScript = React.useMemo(getDisplayScript, [
    generatedScript,
    transcriptionDebug,
    showFullTranscript,
    hasTranscriptData,
  ]);

  // Generate key for forced re-render
  const scriptKey = `script-${showFullTranscript ? "full" : "components"}-${displayScript.length}`;
  console.log("🔑 [EditingView] InteractiveScript key:", scriptKey);

  // Keyboard shortcuts: Undo/Redo
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        onRedo?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onUndo, onRedo]);

  return (
    <div className={`bg-background fixed inset-0 z-50 flex flex-col ${className}`}>
      {/* Enhanced Toolbar - Static Header with Back Button */}
      <div className="border-border-subtle bg-background-elevated flex-shrink-0 border-b shadow-[var(--shadow-soft-minimal)]">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Back Button */}
          <button
            onClick={onBackToInput}
            className="text-muted-foreground hover:text-foreground hover:bg-background-hover flex flex-shrink items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors md:flex-shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">Back to Input</span>
          </button>

          {/* Enhanced Toolbar */}
          <div className="flex flex-1 justify-center px-2 md:px-4">
            <EnhancedToolbar
              onSave={onSave}
              onSimplify={() => onToolbarAction("simplify")}
              onHumanize={() => onToolbarAction("humanize")}
              onShorten={() => onToolbarAction("shorten")}
              onExpand={() => onToolbarAction("expand")}
              onChangeTone={(tone: string) => onToolbarAction(`change-tone-${tone}`)}
              onGenerateIdeas={() => onToolbarAction("generate-ideas")}
              onCheckGrammar={() => onToolbarAction("check-grammar")}
              onTranslate={() => onToolbarAction("translate")}
              onUndo={onUndo}
              onRedo={onRedo}
              onShare={() => console.log("Share")}
              canUndo={!!canUndo}
              canRedo={!!canRedo}
              isSaving={isSaving}
            />
          </div>

          {/* Transcript Toggle */}
          <div className="flex flex-shrink items-center md:flex-shrink-0">
            <TranscriptToggle
              showFullTranscript={showFullTranscript}
              onToggle={onTranscriptToggle}
              hasTranscriptData={hasTranscriptData}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Left Sidebar - AI Actions Panel - Static */}
        <div className="border-border bg-card hidden w-full border-b p-4 md:block md:w-80 md:flex-shrink-0 md:border-r md:border-b-0">
          <FloatingAiActionsPanel
            onPersonaSelect={onPersonaSelect}
            onActionTrigger={onActionTrigger}
            onOpenBrandHub={onBrandModalOpen}
          />
        </div>

        {/* Main Editor - Scrollable Content */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Error Banner */}
            {lastError && (
              <div className="mb-4 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div className="flex items-start space-x-2">
                  <span className="text-amber-500">⚠️</span>
                  <div className="flex-1">
                    <p className="font-medium">Generation Notice</p>
                    <p className="mt-1">{lastError}</p>
                  </div>
                  <button
                    onClick={onDismissError}
                    className="p-1 text-amber-500 hover:text-amber-700"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="mx-auto max-w-4xl">
              <div className="bg-card border-border rounded-[var(--radius-card)] border p-8 shadow-[var(--shadow-soft-minimal)]">
                {/* Debug logging for content rendering */}
                {console.log("🎯 [EditingView] Rendering decision:", {
                  selectedQuickGenerator,
                  isHooks: selectedQuickGenerator === "generate-hooks",
                  isIdeas: selectedQuickGenerator === "content-ideas",
                  isTips: selectedQuickGenerator === "value-bombs",
                  displayScriptLength: displayScript?.length,
                  displayScriptPreview: displayScript?.substring(0, 100),
                })}
                {/* Conditional Content Rendering */}
                {selectedQuickGenerator === "generate-hooks" ||
                selectedQuickGenerator === "content-ideas" ||
                selectedQuickGenerator === "value-bombs" ? (
                  <ContentListView
                    contentType={
                      selectedQuickGenerator === "generate-hooks"
                        ? "hooks"
                        : selectedQuickGenerator === "content-ideas"
                          ? "ideas"
                          : "tips"
                    }
                    content={displayScript}
                    onContentUpdate={(updatedContent) => {
                      console.log(
                        "📝 [EditingView] Content updated via ContentListView:",
                        updatedContent.substring(0, 100),
                      );
                      onScriptUpdate(updatedContent);
                    }}
                  />
                ) : (
                  /* Interactive Script Editor for full scripts */
                  <InteractiveScript
                    key={scriptKey}
                    script={displayScript}
                    onScriptUpdate={(updatedScript) => {
                      console.log(
                        "📝 [EditingView] Script updated via InteractiveScript:",
                        updatedScript.substring(0, 100),
                      );
                      onScriptUpdate(updatedScript);
                    }}
                    scriptAnalysis={{
                      hasComponentAnalysis: scriptAnalysis.hasComponentAnalysis,
                      componentAnalysis: scriptAnalysis.componentAnalysis
                        ? {
                            components: scriptAnalysis.componentAnalysis.components,
                          }
                        : undefined,
                    }}
                    className="min-h-[600px]"
                  />
                )}

                {/* Complexity Legend - only show if analysis exists and complexity view is on */}
                {scriptAnalysis.hasComponentAnalysis && showComplexityView && (
                  <div className="border-border mt-8 border-t pt-6">
                    <h4 className="text-foreground mb-3 text-sm font-medium">Readability Analysis</h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-4 rounded-sm" style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }} />
                        <span className="text-muted-foreground text-xs">Middle School</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-4 rounded-sm" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }} />
                        <span className="text-muted-foreground text-xs">High School</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-4 rounded-sm" style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }} />
                        <span className="text-muted-foreground text-xs">College</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-4 rounded-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }} />
                        <span className="text-muted-foreground text-xs">Graduate</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted-foreground text-xs">
                        5th grade and below are not highlighted (optimal readability)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Analysis - Static */}
        <div className="border-border bg-card hidden w-full border-t p-4 md:block md:w-80 md:flex-shrink-0 md:border-t-0 md:border-l">
          <AnalysisSidebar
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            scriptAnalysis={scriptAnalysis}
            wordCount={wordCount}
          />
        </div>
      </div>
    </div>
  );
}
