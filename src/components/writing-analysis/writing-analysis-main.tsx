'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Eye, Loader2 } from 'lucide-react'
import { InteractiveScript } from './interactive-script'

// Dynamic import of BlockNote editor to avoid SSR issues
const BlockNoteWritingEditor = dynamic(
  () => import('@/components/editor/blocknote-writing-editor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
)

interface ScriptAnalysisData {
  hasComponentAnalysis: boolean
  componentAnalysis?: {
    components: Array<{
      component: string
      text: string
      complexity: string
      gradeLevel: string
      suggestions: string[]
    }>
  }
}

interface WritingAnalysisMainProps {
  title: string
  setTitle: (title: string) => void
  showComplexityView: boolean
  setShowComplexityView: (show: boolean) => void
  scriptAnalysis: ScriptAnalysisData
  sampleScript: string
  renderHighlightedScript: (text: string) => string
  handleContentChange: (content: any) => void
  onScriptUpdate: (updatedScript: string) => void
}

export function WritingAnalysisMain({
  title,
  setTitle,
  showComplexityView,
  setShowComplexityView,
  scriptAnalysis,
  sampleScript,
  renderHighlightedScript,
  handleContentChange,
  onScriptUpdate
}: WritingAnalysisMainProps) {
  return (
    <div className="flex-1 ml-84"> {/* ml-84 = 336px (320px width + 16px gap) for floating panel */}
      <div className="bg-card border border-border rounded-[var(--radius-card)] p-8 shadow-[var(--shadow-soft-minimal)]">
        {/* Title and Header */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Script Title"
            className="text-2xl font-bold text-foreground border-none outline-none w-full bg-transparent placeholder-muted-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Last edited: 2 minutes ago</span>
              <span>•</span>
              <span>Draft</span>
            </div>
            
            {/* Toggle Button for Complexity View */}
            {scriptAnalysis.hasComponentAnalysis && (
              <button
                onClick={() => setShowComplexityView(!showComplexityView)}
                className="flex items-center space-x-2 px-3 py-1 rounded-[var(--radius-button)] text-sm text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{showComplexityView ? 'Edit Mode' : 'Analysis View'}</span>
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
              className="min-h-[300px]"
            />
            
            {/* Complexity Legend */}
            <div className="mt-6 pt-4 border-t border-border-subtle">
              <h4 className="text-sm font-medium text-foreground mb-3">Complexity Highlighting</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }} />
                  <span className="text-xs text-muted-foreground">Middle School</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }} />
                  <span className="text-xs text-muted-foreground">High School</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }} />
                  <span className="text-xs text-muted-foreground">College</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }} />
                  <span className="text-xs text-muted-foreground">Graduate</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">5th grade and below are not highlighted (good readability)</span>
              </div>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }>
            <BlockNoteWritingEditor 
              onContentChange={handleContentChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
