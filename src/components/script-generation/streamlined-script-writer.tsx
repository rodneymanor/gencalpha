"use client";

import React, { useState, useCallback } from "react";

import { toast } from "sonner";

import ChatInput from "@/components/ChatInterface/ChatInput";
import { ContentGeneratorCards } from "@/components/content-generator-cards";
import { EnhancedToolbar } from "@/components/editor/enhanced-toolbar";
import { CONTENT_ACTIONS, type PersonaOption } from "@/components/write-chat/persona-selector";
import { AnalysisSidebar } from "@/components/writing-analysis/analysis-sidebar";
import { FloatingAiActionsPanel } from "@/components/writing-analysis/floating-ai-actions-panel";
import { InteractiveScript } from "@/components/writing-analysis/interactive-script";
import { useEnhancedScriptAnalytics } from "@/hooks/use-script-analytics";
import { useScriptsApi } from "@/hooks/use-scripts-api";

import { ScriptGenerationTimeline } from "./script-generation-timeline";

type FlowState = "input" | "generating" | "editing";

interface StreamlinedScriptWriterProps {
  initialPrompt?: string;
  onScriptComplete?: (script: string) => void;
  className?: string;
}

export function StreamlinedScriptWriter({
  initialPrompt = "",
  onScriptComplete,
  className = "",
}: StreamlinedScriptWriterProps) {
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [inputValue, setInputValue] = useState(initialPrompt);
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [scriptTitle, setScriptTitle] = useState("Generated Script");
  const [isSaving, setIsSaving] = useState(false);
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null);

  // Use scripts API for saving to library
  const { createScript, updateScript } = useScriptsApi();

  // Template and generator selection state
  const [selectedQuickGenerator, setSelectedQuickGenerator] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Editing state - sidebar and toolbar management
  const [sidebarTab, setSidebarTab] = useState<"analysis" | "metrics" | "suggestions">("analysis");
  const [wordCount, setWordCount] = useState(0);
  const [showComplexityView, setShowComplexityView] = useState(true);

  // AI Action Sidebar state
  const [recentActions, setRecentActions] = useState<string[]>([]);

  // Error handling state
  const [lastError, setLastError] = useState<string | null>(null);

  // Analyze the generated script for complexity highlighting
  const scriptAnalysis = useEnhancedScriptAnalytics(generatedScript);

  const handleSend = (value: string) => {
    if (!value.trim()) return;

    let enhancedPrompt = value.trim();

    // Enhance prompt based on template/generator selection
    if (selectedQuickGenerator) {
      const generator = quickGenerators.find((g) => g.id === selectedQuickGenerator);
      if (generator) {
        switch (generator.id) {
          case "generate-hooks":
            enhancedPrompt = `Generate 10 different hooks for: ${enhancedPrompt}`;
            break;
          case "content-ideas":
            enhancedPrompt = `Generate content ideas for: ${enhancedPrompt}`;
            break;
          default:
            enhancedPrompt = `${generator.title}: ${enhancedPrompt}`;
        }
      }
    }

    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        switch (template.id) {
          case "if-then-script":
            enhancedPrompt = `Create an "If this, then that" conditional script about: ${enhancedPrompt}`;
            break;
          case "problem-solution":
            enhancedPrompt = `Write a problem-solution format script about: ${enhancedPrompt}`;
            break;
          default:
            enhancedPrompt = `${template.title} script: ${enhancedPrompt}`;
        }
      }
    }

    setInputValue(enhancedPrompt);
    setFlowState("generating");
  };

  const handleGenerationComplete = (script: string) => {
    // Check if this is a fallback script (indicates an error occurred)
    if (script.includes("⚠️ Note:")) {
      setLastError("Script generation encountered an issue, but we provided a template to get you started.");
    } else {
      setLastError(null);
    }

    setGeneratedScript(script);
    setFlowState("editing");
    onScriptComplete?.(script);
  };

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
    // Clear template/generator selections when starting fresh
    setSelectedQuickGenerator(null);
    setSelectedTemplate(null);
  };

  const handlePersonaSelect = (persona: PersonaOption | null) => {
    setSelectedPersona(persona);
  };

  const handleChatPersonaSelect = (personaId: string) => {
    const personaOption =
      selectedPersona?.id === personaId ? null : ({ id: personaId, name: personaId, description: "" } as PersonaOption);
    handlePersonaSelect(personaOption);
  };

  // Save script to library
  const handleSaveScript = useCallback(async () => {
    if (!generatedScript.trim()) {
      console.error("No script to save");
      toast.error("No script to save", {
        description: "Generate a script first before saving",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Extract title from the script or use a generated title
      const lines = generatedScript.split("\n");
      const firstLine = lines.find((line) => line.trim() && !line.startsWith("**"));
      const extractedTitle = firstLine?.trim() || scriptTitle;

      if (savedScriptId) {
        // Update existing script
        const updatedScript = await updateScript(savedScriptId, {
          content: generatedScript,
          title: extractedTitle,
          tags: [
            ...(selectedPersona ? [`persona:${selectedPersona.id}`] : []),
            ...(selectedTemplate ? [`template:${selectedTemplate}`] : []),
            ...(selectedQuickGenerator ? [`generator:${selectedQuickGenerator}`] : []),
          ],
          summary: `Script generated with ${selectedPersona?.name || "default persona"}`,
        });

        if (updatedScript) {
          console.log("Script updated successfully:", updatedScript.id);
          setScriptTitle(extractedTitle); // Update title state
          // Show success toast notification
          toast.success("Script updated successfully", {
            description: "Your changes have been saved to the library",
            duration: 3000,
          });
        }
      } else {
        // Create new script
        const newScript = await createScript({
          title: extractedTitle,
          content: generatedScript,
          category: selectedQuickGenerator || selectedTemplate || "general",
          tags: [
            ...(selectedPersona ? [`persona:${selectedPersona.id}`] : []),
            ...(selectedTemplate ? [`template:${selectedTemplate}`] : []),
            ...(selectedQuickGenerator ? [`generator:${selectedQuickGenerator}`] : []),
          ],
          summary: `Script generated with ${selectedPersona?.name || "default persona"}`,
          approach: "ai-voice" as const,
          originalIdea: inputValue,
          source: "scripting" as const,
        });

        if (newScript) {
          setSavedScriptId(newScript.id);
          setScriptTitle(extractedTitle); // Update title state
          console.log("Script saved successfully:", newScript.id);
          // Show success toast notification
          toast.success("Script saved to library", {
            description: `"${extractedTitle}" has been added to your scripts`,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error saving script:", error);
      // Show error toast notification
      toast.error("Failed to save script", {
        description: "Please try again or check your connection",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    generatedScript,
    scriptTitle,
    savedScriptId,
    selectedPersona,
    selectedTemplate,
    selectedQuickGenerator,
    createScript,
    updateScript,
    inputValue,
  ]);

  // Enhanced Toolbar Handlers
  const handleToolbarAction = (action: string) => {
    console.log("Toolbar action:", action);
    setRecentActions((prev) => [action, ...prev.slice(0, 4)]);
  };

  // AI Action Sidebar Handlers
  const handleActionTrigger = (action: string, prompt: string) => {
    console.log("Triggered action:", action, "with prompt:", prompt);
    setRecentActions((prev) => [action, ...prev.slice(0, 4)]);
  };

  // Content Change Handler (for word count)
  const handleContentChange = (content: any) => {
    // Calculate word count from content if needed
    if (content && Array.isArray(content)) {
      let count = 0;
      content.forEach((block: any) => {
        if (block.type === "paragraph" && block.content) {
          block.content.forEach((item: any) => {
            if (item.type === "text" && item.text) {
              count += item.text.split(/\s+/).filter((word: string) => word.length > 0).length;
            }
          });
        }
      });
      setWordCount(count);
    }
  };

  // Map CONTENT_ACTIONS to ContentGeneratorCards format
  const quickGenerators = CONTENT_ACTIONS.filter((action) => action.category === "generators").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon:
      action.key === "generate-hooks"
        ? ("send" as const)
        : action.key === "content-ideas"
          ? ("sparkles" as const)
          : ("heart" as const),
    label:
      action.key === "generate-hooks"
        ? "Hook Generator"
        : action.key === "content-ideas"
          ? "Ideation"
          : "Value Content",
  }));

  const templates = CONTENT_ACTIONS.filter((action) => action.category === "templates").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon:
      action.key === "if-then-script"
        ? ("power" as const)
        : action.key === "problem-solution"
          ? ("check-circle" as const)
          : ("layers" as const),
    label:
      action.key === "if-then-script"
        ? "Conditional"
        : action.key === "problem-solution"
          ? "Solution-Based"
          : "Tutorial",
    duration: action.key === "if-then-script" ? "2 min" : action.key === "problem-solution" ? "3 min" : "5 min",
  }));

  const handleQuickGeneratorSelect = (generator: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedQuickGenerator === generator.id) {
      setSelectedQuickGenerator(null);
      setSelectedTemplate(null); // Clear template selection when generator changes
    } else {
      setSelectedQuickGenerator(generator.id);
      setSelectedTemplate(null); // Clear template selection when generator changes
    }
  };

  const handleTemplateSelect = (template: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedTemplate === template.id) {
      setSelectedTemplate(null);
      setSelectedQuickGenerator(null); // Clear generator selection when template changes
    } else {
      setSelectedTemplate(template.id);
      setSelectedQuickGenerator(null); // Clear generator selection when template changes
    }
  };

  const handleCreateCustomTemplate = () => {
    // Focus the input - this could be extended with a modal
    // For now, just ensure input is ready
    console.log("Create custom template requested");
  };

  // Input State - Hero-style input interface
  if (flowState === "input") {
    return (
      <div className={`bg-background flex min-h-screen flex-col ${className}`}>
        {/* Flex container for centering content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          {/* Hero content - centered */}
          <div className="w-full max-w-4xl text-center">
            {/* Hero headline */}
            <div className="mb-8">
              <h1 className="mb-6 text-4xl leading-10 font-bold tracking-tight">
                <span className="text-foreground">Ready to create something amazing?</span>
                <br />
                <span className="text-brand">Let&apos;s write your script.</span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Tell me what you want to create, and I&apos;ll help you craft the perfect script.
              </p>
            </div>

            {/* Input field */}
            <div className="mx-auto mb-8 w-full max-w-3xl">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSend}
                placeholder="Write a script about..."
                disabled={false}
                showTimeLimit={false}
                showSettings={false}
                showTrending={true}
                showPersonas={true}
                selectedPersona={selectedPersona?.id}
                onPersonaSelect={handleChatPersonaSelect}
              />
            </div>

            {/* ContentGeneratorCards - Templates and Quick Generators */}
            <div className="mx-auto w-full max-w-5xl">
              <ContentGeneratorCards
                quickGenerators={quickGenerators}
                templates={templates}
                selectedQuickGenerator={selectedQuickGenerator ?? undefined}
                selectedTemplate={selectedTemplate ?? undefined}
                onQuickGeneratorSelect={handleQuickGeneratorSelect}
                onTemplateSelect={handleTemplateSelect}
                onCreateCustomTemplate={handleCreateCustomTemplate}
              />
              <div className="text-muted-foreground mt-6 text-center text-sm">
                💡 Tip: Be specific about your topic and target audience for better results
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generation State - Show Arc Timeline
  if (flowState === "generating") {
    return (
      <ScriptGenerationTimeline
        isActive={true}
        onComplete={handleGenerationComplete}
        userPrompt={inputValue}
        selectedPersona={selectedPersona}
      />
    );
  }

  // Editing State - Show Complete Editor with Sidebars and Toolbar
  if (flowState === "editing") {
    return (
      <div className={`bg-background fixed inset-0 z-50 flex flex-col ${className}`}>
        {/* Enhanced Toolbar - Static Header with Back Button */}
        <div className="border-border-subtle bg-background-elevated flex-shrink-0 border-b shadow-[var(--shadow-soft-minimal)]">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Back Button */}
            <button
              onClick={handleBackToInput}
              className="text-muted-foreground hover:text-foreground hover:bg-background-hover flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Input
            </button>

            {/* Enhanced Toolbar */}
            <div className="flex flex-1 justify-center">
              <EnhancedToolbar
                onSave={handleSaveScript}
                onSimplify={() => console.log("Simplify text using AI")}
                onHumanize={() => handleToolbarAction("humanize")}
                onShorten={() => handleToolbarAction("shorten")}
                onExpand={() => handleToolbarAction("expand")}
                onChangeTone={(tone: string) => handleToolbarAction(`change-tone-${tone}`)}
                onGenerateIdeas={() => handleToolbarAction("generate-ideas")}
                onCheckGrammar={() => handleToolbarAction("check-grammar")}
                onTranslate={() => handleToolbarAction("translate")}
                onBold={() => handleToolbarAction("bold")}
                onUnderline={() => handleToolbarAction("underline")}
                onStrikethrough={() => handleToolbarAction("strikethrough")}
                onUndo={() => console.log("Undo")}
                onRedo={() => console.log("Redo")}
                onShare={() => console.log("Share")}
                canUndo={false}
                canRedo={false}
                isSaving={isSaving}
              />
            </div>

            {/* Right spacer to balance the back button */}
            <div className="w-32"></div>
          </div>
        </div>

        {/* Main Content Area - Takes remaining height */}
        <div className="flex min-h-0 flex-1">
          {/* Left Sidebar - AI Actions Panel - Static */}
          <div className="border-border bg-card w-80 flex-shrink-0 border-r p-4">
            <FloatingAiActionsPanel onPersonaSelect={handlePersonaSelect} onActionTrigger={handleActionTrigger} />
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
                      onClick={() => setLastError(null)}
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
                  {/* Interactive Script Editor */}
                  <InteractiveScript
                    script={generatedScript}
                    onScriptUpdate={handleScriptUpdate}
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

                  {/* Action hint */}
                  <div className="text-muted-foreground mt-6 text-center text-sm">
                    💡 Click any script section above to access AI-powered improvements
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Analysis - Static */}
          <div className="border-border bg-card w-80 flex-shrink-0 border-l p-4">
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

  return null;
}
