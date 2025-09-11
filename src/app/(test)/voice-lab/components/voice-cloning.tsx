'use client'

import { Copy, Save, Mic, RefreshCw } from 'lucide-react'
import { formatCloningPrompt } from '../prompts'

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

interface ClonedContent {
  id: string
  profileId: string
  topic: string
  content: string
  signatureElements: string[]
  confidenceScore: number
  createdAt: string
}

interface VoiceCloningProps {
  topicInput: string
  setTopicInput: (value: string) => void
  selectedProfile: string | null
  setSelectedProfile: (value: string | null) => void
  savedProfiles: VoiceProfile[]
  clonedContent: ClonedContent | null
  isCloning: boolean
  onCloneVoice: () => void
  onSaveContent: (content: ClonedContent) => void
  onCopyToClipboard: (text: string, message?: string) => void
}

export default function VoiceCloning({
  topicInput,
  setTopicInput,
  selectedProfile,
  setSelectedProfile,
  savedProfiles,
  clonedContent,
  isCloning,
  onCloneVoice,
  onSaveContent,
  onCopyToClipboard
}: VoiceCloningProps) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-medium text-neutral-900">Voice Cloning</h2>
      </div>

      {/* Profile selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Voice Profile
        </label>
        <select
          value={selectedProfile ?? ''}
          onChange={(e) => setSelectedProfile(e.target.value || null)}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] focus:border-primary-400 focus:outline-none text-sm"
        >
          <option value="">Choose a profile...</option>
          {savedProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>

      {/* Topic input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          New Topic
        </label>
        <textarea
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Enter the topic you want the voice to discuss..."
          className="w-full h-20 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] resize-none focus:border-primary-400 focus:outline-none text-sm"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onCloneVoice}
          disabled={!selectedProfile || !topicInput.trim() || isCloning}
          className="flex-1 px-4 py-2 bg-brand-500 text-neutral-900 rounded-[var(--radius-button)] hover:bg-brand-400 disabled:bg-neutral-300 disabled:text-neutral-500 transition-all duration-150 flex items-center justify-center gap-2"
        >
          {isCloning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Cloning...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Clone
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (selectedProfile && topicInput.trim()) {
              const profile = savedProfiles.find(p => p.id === selectedProfile);
              if (profile) {
                const profileText = `VOICE PROFILE SUMMARY: ${profile.summary}

INSTANT RECOGNITION ELEMENTS:
${profile.recognitionElements.map(el => `• ${el}`).join('\n')}

REPLICATION FORMULA:
${profile.replicationFormula.map((step, i) => `${i + 1}. ${step}`).join('\n')}

CRITICAL PATTERNS:
${profile.criticalPatterns.map(pattern => `• ${pattern}`).join('\n')}

VOICE SETTINGS:
- Energy Level: ${profile.voiceSettings.energyLevel}/10
- Complexity: ${profile.voiceSettings.complexity}
- Formality: ${profile.voiceSettings.formality}
- Pace: ${profile.voiceSettings.pace}
- Emotion: ${profile.voiceSettings.emotion}

EXAMPLE TRANSFORMATION:
Generic: "${profile.exampleTransformation.generic}"
Their Voice: "${profile.exampleTransformation.voiced}"`;

                const formattedPrompt = formatCloningPrompt(
                  profileText,
                  topicInput,
                  profile.voiceSettings.energyLevel.toString(),
                  'moderate length',
                  profile.criticalPatterns[0] ?? 'standard transitions',
                  profile.recognitionElements[0] ?? 'signature elements',
                  'generic phrases'
                );
                onCopyToClipboard(formattedPrompt, 'Cloning prompt copied! Paste into AI tool.');
              }
            }
          }}
          disabled={!selectedProfile || !topicInput.trim()}
          className="px-4 py-2 bg-primary-500 text-neutral-50 rounded-[var(--radius-button)] hover:bg-primary-600 disabled:bg-neutral-300 disabled:text-neutral-500 transition-all duration-150 flex items-center justify-center gap-2"
          title="Copy formatted cloning prompt with your profile and topic"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Workflow instructions */}
      <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-[var(--radius-button)]">
        <h4 className="text-xs font-medium text-brand-900 mb-1">How to use:</h4>
        <p className="text-xs text-brand-700">
          Click <strong>Copy</strong> to get the complete cloning prompt with your voice profile and topic, then paste into your AI tool.
        </p>
      </div>

      {/* Cloned content display */}
      {clonedContent && (
        <div className="mt-6 p-4 bg-neutral-100 border border-neutral-200 rounded-[var(--radius-card)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-neutral-900">Cloned Content</h3>
            <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-pill">
              {clonedContent.confidenceScore}% match
            </span>
          </div>
          
          <div className="mb-3 p-3 bg-neutral-50 rounded-[var(--radius-button)] text-sm text-neutral-700 max-h-32 overflow-y-auto">
            {clonedContent.content}
          </div>

          {/* Signature elements */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-neutral-700 mb-1">Signature Elements Used:</h4>
            <div className="space-y-1">
              {clonedContent.signatureElements.map((element) => (
                <div key={element} className="text-xs text-neutral-600 flex items-start gap-1">
                  <span className="w-1 h-1 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                  {element}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onSaveContent(clonedContent)}
              className="flex-1 px-3 py-2 bg-primary-500 text-neutral-50 rounded-[var(--radius-button)] hover:bg-primary-600 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => onCopyToClipboard(clonedContent.content)}
              className="px-3 py-2 bg-neutral-200 text-neutral-700 rounded-[var(--radius-button)] hover:bg-neutral-300 transition-all duration-150 flex items-center justify-center"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}