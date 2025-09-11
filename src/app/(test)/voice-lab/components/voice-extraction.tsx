'use client'

import { useState } from 'react'
import { Copy, Save, Trash2, FileText, Mic, RefreshCw } from 'lucide-react'
import { formatExtractionPrompt } from '../prompts'

interface VoiceProfile {
  id: string
  name: string
  summary: string
  recognitionElements: string[]
  replicationFormula: string[]
  criticalPatterns: string[]
  voiceSettings: {
    energyLevel: number
    complexity: string
    formality: string
    pace: string
    emotion: string
  }
  exampleTransformation: {
    generic: string
    voiced: string
  }
  createdAt: string
}

interface VoiceExtractionProps {
  transcriptInput: string
  setTranscriptInput: (value: string) => void
  extractedProfile: VoiceProfile | null
  savedProfiles: VoiceProfile[]
  isExtracting: boolean
  onExtractProfile: () => void
  onSaveProfile: (profile: VoiceProfile) => void
  onDeleteProfile: (profileId: string) => void
  onSelectProfile: (profileId: string) => void
  onCopyToClipboard: (text: string, message?: string) => void
}

export default function VoiceExtraction({
  transcriptInput,
  setTranscriptInput,
  extractedProfile,
  savedProfiles,
  isExtracting,
  onExtractProfile,
  onSaveProfile,
  onDeleteProfile,
  onSelectProfile,
  onCopyToClipboard
}: VoiceExtractionProps) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-medium text-neutral-900">Voice Extraction</h2>
      </div>
      
      {/* Transcript input textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Paste Transcript
        </label>
        <textarea
          value={transcriptInput}
          onChange={(e) => setTranscriptInput(e.target.value)}
          placeholder="Paste the transcript you want to analyze for voice patterns..."
          className="w-full h-32 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] resize-none focus:border-primary-400 focus:outline-none text-sm"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onExtractProfile}
          disabled={!transcriptInput.trim() || isExtracting}
          className="flex-1 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-[var(--radius-button)] hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 transition-all duration-150 flex items-center justify-center gap-2"
        >
          {isExtracting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Extract
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (transcriptInput.trim()) {
              const formattedPrompt = formatExtractionPrompt(transcriptInput);
              onCopyToClipboard(formattedPrompt, 'Extraction prompt copied! Paste into AI tool.');
            }
          }}
          disabled={!transcriptInput.trim()}
          className="px-4 py-2 bg-primary-500 text-neutral-50 rounded-[var(--radius-button)] hover:bg-primary-600 disabled:bg-neutral-300 disabled:text-neutral-500 transition-all duration-150 flex items-center justify-center gap-2"
          title="Copy formatted extraction prompt with your transcript"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Workflow instructions */}
      <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-[var(--radius-button)]">
        <h4 className="text-xs font-medium text-brand-900 mb-1">How to use:</h4>
        <p className="text-xs text-brand-700">
          Click <strong>Copy</strong> to get the full extraction prompt with your transcript, then paste into ChatGPT or Claude for analysis.
        </p>
      </div>

      {/* Extracted profile display */}
      {extractedProfile && (
        <div className="mt-6 p-4 bg-neutral-100 border border-neutral-200 rounded-[var(--radius-card)]">
          <h3 className="font-medium text-neutral-900 mb-2">Extracted Profile</h3>
          <p className="text-sm text-neutral-600 mb-3">{extractedProfile.summary}</p>
          
          {/* Voice settings display */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <span className="text-neutral-500">Energy: {extractedProfile.voiceSettings.energyLevel}/10</span>
            <span className="text-neutral-500">Pace: {extractedProfile.voiceSettings.pace}</span>
            <span className="text-neutral-500">Formality: {extractedProfile.voiceSettings.formality}</span>
            <span className="text-neutral-500">Emotion: {extractedProfile.voiceSettings.emotion}</span>
          </div>

          {/* Save profile button */}
          <button
            onClick={() => onSaveProfile(extractedProfile)}
            className="w-full px-3 py-2 bg-primary-500 text-neutral-50 rounded-[var(--radius-button)] hover:bg-primary-600 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      )}

      {/* Saved profiles list */}
      {savedProfiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-neutral-900 mb-3">Saved Profiles ({savedProfiles.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedProfiles.map((profile) => (
              <div key={profile.id} className="p-3 bg-neutral-100 border border-neutral-200 rounded-[var(--radius-button)] group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-neutral-900">{profile.name}</h4>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{profile.summary}</p>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-neutral-200 px-2 py-1 rounded-pill">
                        Energy: {profile.voiceSettings.energyLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelectProfile(profile.id)}
                      className="p-1 text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-1 text-neutral-600 hover:text-destructive-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}