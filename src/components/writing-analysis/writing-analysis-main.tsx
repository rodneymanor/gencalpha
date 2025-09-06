"use client";

import React, { Suspense } from "react";

import dynamic from "next/dynamic";

import { Eye, Loader2 } from "lucide-react";

import { InteractiveScript } from "./interactive-script";

// Dynamic import of BlockNote editor to avoid SSR issues
const BlockNoteWritingEditor = dynamic(() => import("@/components/editor/blocknote-writing-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  ),
});

interface ScriptAnalysisData {
  hasComponentAnalysis: boolean;
  componentAnalysis?: {
    components: Array<{
      component: string;
      text: string;
      complexity: string;
      gradeLevel: string;
      suggestions: string[];
    }>;
  } | null;
  overallGradeLevel?: string;
  passesThirdGradeTest?: boolean;
  wordCount?: number;
  estimatedDuration?: number;
  readabilityScore?: number;
}

interface WritingAnalysisMainProps {
  title: string;
  setTitle: (title: string) => void;
  showComplexityView: boolean;
  setShowComplexityView: (show: boolean) => void;
  scriptAnalysis: ScriptAnalysisData;
  sampleScript: string;
  renderHighlightedScript: (text: string) => string;
  handleContentChange: (content: any) => void;
  onScriptUpdate: (updatedScript: string) => void;
}

export function WritingAnalysisMain({
  title,
  setTitle,
  showComplexityView,
  setShowComplexityView,
  scriptAnalysis,
  sampleScript,
  renderHighlightedScript: _renderHighlightedScript,
  handleContentChange,
  onScriptUpdate,
}: WritingAnalysisMainProps) {
  return (
    <div className="ml-84 flex-1">
      {" "}
      {/* ml-84 = 336px (320px width + 16px gap) for floating panel */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-8 shadow-[var(--shadow-soft-minimal)]">
        {/* Title and Header */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Script Title"
            className="text-foreground placeholder-muted-foreground w-full border-none bg-transparent text-2xl font-bold outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <span>Last edited: 2 minutes ago</span>
              <span>•</span>
              <span>Draft</span>
            </div>

            {/* Toggle Button for Complexity View */}
            {scriptAnalysis.hasComponentAnalysis && (
              <button
                onClick={() => setShowComplexityView(!showComplexityView)}
                className="text-muted-foreground hover:text-foreground hover:bg-background-hover flex items-center space-x-2 rounded-[var(--radius-button)] px-3 py-1 text-sm transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>{showComplexityView ? "Edit Mode" : "Analysis View"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area - Either interactive analysis view or editor */}
        {scriptAnalysis.hasComponentAnalysis && showComplexityView ? (
          <div>
            <InteractiveScript
              script={sampleScript}
              onScriptUpdate={onScriptUpdate}
              scriptAnalysis={scriptAnalysis}
              className="min-h-[300px]"
            />

            {/* Complexity Legend */}
            <div className="border-border-subtle mt-6 border-t pt-4">
              <h4 className="text-foreground mb-3 text-sm font-medium">Complexity Highlighting</h4>
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
                  5th grade and below are not highlighted (good readability)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            }
          >
            <BlockNoteWritingEditor onContentChange={handleContentChange} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
