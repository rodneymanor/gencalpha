'use client'

import { Copy, Lightbulb } from 'lucide-react'
import { VOICE_EXTRACTION_PROMPT, VOICE_CLONING_PROMPT, ADVANCED_TECHNIQUES_PROMPT } from '../prompts'

interface PromptViewerProps {
  activeTab: 'extraction' | 'cloning' | 'advanced'
  setActiveTab: (tab: 'extraction' | 'cloning' | 'advanced') => void
  onCopyToClipboard: (text: string, message?: string) => void
}

export default function PromptViewer({
  activeTab,
  setActiveTab,
  onCopyToClipboard
}: PromptViewerProps) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-medium text-neutral-900">Complete Prompt System</h2>
      </div>
      
      {/* Prompt tabs */}
      <div className="flex gap-1 mb-4 bg-neutral-100 p-1 rounded-[var(--radius-button)] w-fit">
        <button
          onClick={() => setActiveTab('extraction')}
          className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all duration-150 ${
            activeTab === 'extraction'
              ? 'bg-neutral-50 text-neutral-900 shadow-[var(--shadow-input)]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Part 1: Extraction
        </button>
        <button
          onClick={() => setActiveTab('cloning')}
          className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all duration-150 ${
            activeTab === 'cloning'
              ? 'bg-neutral-50 text-neutral-900 shadow-[var(--shadow-input)]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Part 2: Cloning
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all duration-150 ${
            activeTab === 'advanced'
              ? 'bg-neutral-50 text-neutral-900 shadow-[var(--shadow-input)]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Part 3: Advanced
        </button>
      </div>

      {/* Prompt content */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-neutral-900">
            {activeTab === 'extraction' && 'Deep Voice Extraction Prompt'}
            {activeTab === 'cloning' && 'Voice Cloning Application Prompt'}
            {activeTab === 'advanced' && 'Advanced Techniques'}
          </h3>
          <button
            onClick={() => {
              const promptText = activeTab === 'extraction' 
                ? VOICE_EXTRACTION_PROMPT
                : activeTab === 'cloning'
                ? VOICE_CLONING_PROMPT
                : ADVANCED_TECHNIQUES_PROMPT;
              onCopyToClipboard(promptText);
            }}
            className="px-3 py-1 bg-primary-500 text-neutral-50 rounded-[var(--radius-button)] hover:bg-primary-600 transition-all duration-150 flex items-center gap-2 text-sm"
          >
            <Copy className="w-3 h-3" />
            Copy Prompt
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto bg-neutral-100 p-4 rounded-[var(--radius-button)] text-sm text-neutral-700 font-mono leading-relaxed whitespace-pre-wrap">
          {activeTab === 'extraction' && VOICE_EXTRACTION_PROMPT}
          {activeTab === 'cloning' && VOICE_CLONING_PROMPT}
          {activeTab === 'advanced' && ADVANCED_TECHNIQUES_PROMPT}
        </div>

        {/* Usage instructions */}
        <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-[var(--radius-button)]">
          <h4 className="text-sm font-medium text-brand-900 mb-2">Usage Instructions:</h4>
          <div className="text-xs text-brand-700 space-y-1">
            {activeTab === 'extraction' && (
              <>
                <p>• Replace {`{TRANSCRIPT}`} with the actual transcript text</p>
                <p>• Use with ChatGPT, Claude, or any AI model for voice analysis</p>
                <p>• Save the extracted profile for use in Part 2</p>
              </>
            )}
            {activeTab === 'cloning' && (
              <>
                <p>• Replace {`{VOICE_PROFILE}`} with the profile from Part 1</p>
                <p>• Replace {`{NEW_TOPIC}`} with your desired topic</p>
                <p>• Fill in optional variables like {`{ENERGY_LEVEL}`} for better results</p>
              </>
            )}
            {activeTab === 'advanced' && (
              <>
                <p>• Use these techniques to refine voice cloning results</p>
                <p>• Apply scenario-based adaptations for different contexts</p>
                <p>• Implement micro-cloning for perfect authenticity</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}