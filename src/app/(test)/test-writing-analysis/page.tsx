"use client";

import React, { useState } from "react";

import { EnhancedToolbar } from "@/components/editor/enhanced-toolbar";
import { AnalysisSidebar } from "@/components/writing-analysis/analysis-sidebar";
import { FloatingAiActionsPanel } from "@/components/writing-analysis/floating-ai-actions-panel";
import { WritingAnalysisMain } from "@/components/writing-analysis/writing-analysis-main";
import { useEnhancedScriptAnalytics } from "@/hooks/use-script-analytics";

export default function TestWritingAnalysisPage() {
  // Sample script for component analysis
  const sampleScript = `**Hook:**
Is life sciences research progressing too slowly? We can do better.

**Micro Hook:**
What if we could cure cancer in half the time?

**Bridge:**
The key lies in leveraging technology and collaboration to accelerate discovery and development.

**Golden Nugget:**
Imagine AI-powered drug design, high-throughput screening, and global data sharing initiatives dramatically reducing research timelines. This translates to faster cures for diseases like cancer and Alzheimer's. For example, AI algorithms are already analyzing vast genomic datasets to identify potential drug targets far more efficiently than traditional methods. Simultaneously, collaborative platforms allow researchers across the globe to share data and insights in real-time, eliminating redundancies and accelerating breakthroughs.

**Call to Action:**
Learn more about the future of accelerated life sciences research and how you can contribute. Visit our website today!`;

  const [sidebarTab, setSidebarTab] = useState<"analysis" | "metrics" | "suggestions">("analysis");
  const [title, setTitle] = useState("Life Sciences Research Acceleration Script");
  const [_editorContent, setEditorContent] = useState<any>(null);
  const [wordCount, setWordCount] = useState(126);
  const [showComplexityView, setShowComplexityView] = useState(true);

  // AI Action Sidebar state
  const [_selectedPersona, setSelectedPersona] = useState<any>(null);
  const [_recentActions, setRecentActions] = useState<string[]>([]);

  // Script state for AI actions
  const [currentScript, setCurrentScript] = useState(sampleScript);

  // Handle persona selection
  const handlePersonaSelect = (persona: any) => {
    setSelectedPersona(persona);
    console.log("Selected persona:", persona);
  };

  // Handle AI action triggers
  const handleActionTrigger = (action: string, prompt: string) => {
    console.log("Triggered action:", action, "with prompt:", prompt);
    setRecentActions((prev) => [action, ...prev.slice(0, 4)]);
  };

  // Analyze the sample script for component readability
  const scriptAnalysis = useEnhancedScriptAnalytics(sampleScript);

  // Get complexity-based background color (transparent versions)
  const getComplexityBackgroundColor = (complexity: string) => {
    switch (complexity) {
      case "graduate":
        return "rgba(239, 68, 68, 0.1)";
      case "college":
        return "rgba(249, 115, 22, 0.1)";
      case "high-school":
        return "rgba(245, 158, 11, 0.1)";
      case "middle-school":
        return "rgba(59, 130, 246, 0.08)";
      case "elementary":
        return "transparent";
      default:
        return "transparent";
    }
  };

  // Render script with complexity-based highlighting
  const renderHighlightedScript = (text: string) => {
    if (!scriptAnalysis.hasComponentAnalysis) {
      return text
        .replace(
          /\*\*([^:]+):\*\*/g,
          '<h4 class="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">$1:</h4>',
        )
        .replace(/\n\s*\n/g, '</p><p class="mb-4">');
    }

    let result = text;
    const components = scriptAnalysis.componentAnalysis?.components ?? [];

    // First, convert markdown headings to HTML
    result = result.replace(
      /\*\*([^:]+):\*\*/g,
      '<h4 class="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">$1:</h4>',
    );

    // Apply complexity-based highlighting to each component's content
    components.forEach((component) => {
      if (component.text.trim()) {
        const bgColor = getComplexityBackgroundColor(component.complexity);
        const escapedText = component.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedText, "gi");

        result = result.replace(
          regex,
          `<span style="background-color: ${bgColor}; padding: 4px 2px; border-radius: 4px; display: inline-block; margin: 1px 0;">${component.text}</span>`,
        );
      }
    });

    // Convert newlines to paragraphs
    result = result.replace(/\n\s*\n/g, '</p><p class="mb-4">');
    result = `<p class="mb-4">${result}</p>`;

    return result;
  };

  // Handle content changes from the editor
  const handleContentChange = (content: any) => {
    setEditorContent(content);

    // Calculate word count
    let count = 0;
    if (content && Array.isArray(content)) {
      content.forEach((block: any) => {
        if (block.type === "paragraph" && block.content) {
          const text = block.content
            .map((item: any) => (item.type === "text" ? item.text : ""))
            .join(" ");
          count += text.split(/\s+/).filter((word: string) => word.length > 0).length;
        }
      });
    }
    setWordCount(count);
  };

  // Enhanced toolbar handlers
  const handleSave = () => {
    console.log("Save document");
  };

  const handleSimplify = () => {
    console.log("Simplify text using AI");
  };

  const handleAIAction = (action: string) => {
    console.log("AI Action triggered:", action);
  };

  const handleChangeTone = (tone: string) => {
    console.log("Change tone to:", tone);
  };

  const handleFormatting = (format: string) => {
    console.log("Apply formatting:", format);
  };

  // Handle script updates from AI actions
  const handleScriptUpdate = (updatedScript: string) => {
    setCurrentScript(updatedScript);
    console.log("Script updated by AI action");
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Enhanced Toolbar */}
      <div className="border-b border-border-subtle bg-background-elevated shadow-[var(--shadow-soft-minimal)]">
        <EnhancedToolbar
          onSave={handleSave}
          onSimplify={handleSimplify}
          onHumanize={() => handleAIAction("humanize")}
          onShorten={() => handleAIAction("shorten")}
          onExpand={() => handleAIAction("expand")}
          onChangeTone={handleChangeTone}
          onGenerateIdeas={() => handleAIAction("generate-ideas")}
          onCheckGrammar={() => handleAIAction("check-grammar")}
          onTranslate={() => handleAIAction("translate")}
          onBold={() => handleFormatting("bold")}
          onUnderline={() => handleFormatting("underline")}
          onStrikethrough={() => handleFormatting("strikethrough")}
          onUndo={() => console.log("Undo")}
          onRedo={() => console.log("Redo")}
          onShare={() => console.log("Share")}
          canUndo={true}
          canRedo={true}
          isSaving={false}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 p-4 pt-6">
        {/* Floating AI Actions Panel */}
        <div className="fixed bottom-4 left-4 top-20 z-40 w-80">
          <FloatingAiActionsPanel
            onPersonaSelect={handlePersonaSelect}
            onActionTrigger={handleActionTrigger}
          />
        </div>

        {/* Main Editor */}
        <WritingAnalysisMain
          title={title}
          setTitle={setTitle}
          showComplexityView={showComplexityView}
          setShowComplexityView={setShowComplexityView}
          scriptAnalysis={scriptAnalysis}
          sampleScript={currentScript}
          renderHighlightedScript={renderHighlightedScript}
          handleContentChange={handleContentChange}
          onScriptUpdate={handleScriptUpdate}
        />

        {/* Analysis Sidebar */}
        <AnalysisSidebar
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          scriptAnalysis={scriptAnalysis}
          wordCount={wordCount}
        />
      </div>
    </div>
  );
}