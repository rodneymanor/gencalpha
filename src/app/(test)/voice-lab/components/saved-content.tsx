'use client'

import { Copy, Save } from 'lucide-react'

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

interface SavedContentProps {
  savedContent: ClonedContent[]
  savedProfiles: VoiceProfile[]
  onCopyToClipboard: (text: string, message?: string) => void
}

export default function SavedContent({
  savedContent,
  savedProfiles,
  onCopyToClipboard
}: SavedContentProps) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Save className="w-5 h-5 text-success-600" />
        <h2 className="text-lg font-medium text-neutral-900">Saved Content</h2>
      </div>

      {savedContent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500 text-sm">No saved content yet</p>
          <p className="text-neutral-400 text-xs mt-1">Clone some voice content to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {savedContent.map((content) => {
            const profile = savedProfiles.find(p => p.id === content.profileId)
            return (
              <div key={content.id} className="p-3 bg-neutral-100 border border-neutral-200 rounded-[var(--radius-button)] group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-neutral-900">{content.topic}</h4>
                    <p className="text-xs text-neutral-600">
                      {profile?.name} • {content.confidenceScore}% match
                    </p>
                  </div>
                  <button
                    onClick={() => onCopyToClipboard(content.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-600 hover:text-primary-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-neutral-600 line-clamp-3 mb-2">
                  {content.content}
                </div>
                <div className="text-xs text-neutral-400">
                  {new Date(content.createdAt).toLocaleDateString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}