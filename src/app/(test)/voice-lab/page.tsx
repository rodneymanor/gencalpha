'use client'

import { useState, useEffect } from 'react'
import { Code } from 'lucide-react'
import VoiceExtraction from './components/voice-extraction'
import VoiceCloning from './components/voice-cloning'
import SavedContent from './components/saved-content'
import PromptViewer from './components/prompt-viewer'

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

export default function VoiceLab() {
  // State management for voice profiles and cloned content
  const [transcriptInput, setTranscriptInput] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [extractedProfile, setExtractedProfile] = useState<VoiceProfile | null>(null)
  const [savedProfiles, setSavedProfiles] = useState<VoiceProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [clonedContent, setClonedContent] = useState<ClonedContent | null>(null)
  const [savedContent, setSavedContent] = useState<ClonedContent[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [activePromptTab, setActivePromptTab] = useState<'extraction' | 'cloning' | 'advanced'>('extraction')
  const [copyNotification, setCopyNotification] = useState('')

  // Load data from localStorage on component mount
  useEffect(() => {
    const profiles = localStorage.getItem('voiceLabProfiles')
    const content = localStorage.getItem('voiceLabContent')
    
    if (profiles) {
      setSavedProfiles(JSON.parse(profiles))
    }
    if (content) {
      setSavedContent(JSON.parse(content))
    }
  }, [])

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('voiceLabProfiles', JSON.stringify(savedProfiles))
  }, [savedProfiles])

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('voiceLabContent', JSON.stringify(savedContent))
  }, [savedContent])

  // Extract voice profile from transcript using the comprehensive prompt
  const extractVoiceProfile = async () => {
    if (!transcriptInput.trim()) return
    
    setIsExtracting(true)
    
    // Simulate API call - replace with actual AI API integration
    setTimeout(() => {
      const newProfile: VoiceProfile = {
        id: Date.now().toString(),
        name: `Profile ${savedProfiles.length + 1}`,
        summary: "Energetic, data-driven communicator with technical expertise and conversational warmth",
        recognitionElements: [
          "Frequent use of specific metrics and percentages",
          "Transitions with 'Now,' and 'So,'",
          "Questions to audience for engagement",
          "Technical terms explained simply",
          "Personal experience integration"
        ],
        replicationFormula: [
          "Start with hook question or surprising stat",
          "Build credibility with specific data points",
          "Use conversational transitions",
          "Include personal experience validation",
          "End with clear action or insight"
        ],
        criticalPatterns: [
          "Statistics integrated naturally",
          "Conversational question rhythm",
          "Technical simplification approach",
          "Personal validation stories",
          "Clear structural progression",
          "Specific number usage preference",
          "Inclusive language patterns",
          "Energy escalation at key points",
          "Analogy preference for complex topics",
          "Direct address to audience"
        ],
        voiceSettings: {
          energyLevel: 7,
          complexity: "Moderate",
          formality: "Professional-Casual",
          pace: "Variable",
          emotion: "Balanced-Expressive"
        },
        exampleTransformation: {
          generic: "This is important information you should know.",
          voiced: "Now, here's something that might surprise you - and I've seen this in 73% of the cases I've analyzed personally..."
        },
        createdAt: new Date().toISOString()
      }
      
      setExtractedProfile(newProfile)
      setIsExtracting(false)
    }, 2000)
  }

  // Clone voice for new topic using extracted profile
  const cloneVoice = async () => {
    if (!selectedProfile || !topicInput.trim()) return
    
    setIsCloning(true)
    
    const profile = savedProfiles.find(p => p.id === selectedProfile)
    if (!profile) return
    
    // Simulate AI voice cloning - replace with actual API integration
    setTimeout(() => {
      const newContent: ClonedContent = {
        id: Date.now().toString(),
        profileId: profile.id,
        topic: topicInput,
        content: `Now, let me share something that might completely change how you think about ${topicInput}. I've been analyzing this space for months, and here's what 89% of people are missing...\n\nSo, here's the thing - and I've seen this pattern in my own experience - most approaches to ${topicInput} are fundamentally flawed. They're focusing on the wrong metrics.\n\nBut what if I told you there's a way to approach ${topicInput} that actually delivers measurable results? I'm talking about strategies that show 3x improvement in just 30 days.\n\nHere's exactly what you need to know...`,
        signatureElements: [
          "Hook question with surprising element",
          "Credibility with specific percentage (89%)",
          "Personal experience reference",
          "Conversational transition 'So, here's the thing'",
          "Specific measurable outcome (3x improvement, 30 days)"
        ],
        confidenceScore: 87,
        createdAt: new Date().toISOString()
      }
      
      setClonedContent(newContent)
      setIsCloning(false)
    }, 1500)
  }

  // Save voice profile to local storage
  const saveProfile = (profile: VoiceProfile) => {
    const updatedProfiles = [...savedProfiles, profile]
    setSavedProfiles(updatedProfiles)
    setExtractedProfile(null)
    setTranscriptInput('')
  }

  // Save cloned content to local storage
  const saveContent = (content: ClonedContent) => {
    const updatedContent = [...savedContent, content]
    setSavedContent(updatedContent)
    setClonedContent(null)
    setTopicInput('')
  }

  // Delete profile and associated content
  const deleteProfile = (profileId: string) => {
    setSavedProfiles(prev => prev.filter(p => p.id !== profileId))
    setSavedContent(prev => prev.filter(c => c.profileId !== profileId))
    if (selectedProfile === profileId) {
      setSelectedProfile(null)
    }
  }

  // Copy content to clipboard with notification
  const copyToClipboard = (text: string, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text)
    setCopyNotification(message)
    setTimeout(() => setCopyNotification(''), 3000)
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      {/* Copy notification */}
      {copyNotification && (
        <div className="fixed top-4 right-4 bg-success-500 text-neutral-50 px-4 py-2 rounded-[var(--radius-button)] shadow-[var(--shadow-soft-drop)] z-50 animate-in fade-in duration-200">
          {copyNotification}
        </div>
      )}
      
      {/* Header section with title and description */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Voice Lab</h1>
              <p className="text-neutral-600 mb-4">
                Extract voice patterns from transcripts and clone them for new content. This lab uses forensic-level analysis 
                to capture cognitive signatures, emotional patterns, and micro-linguistic elements.
              </p>
            </div>
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-[var(--radius-button)] hover:bg-neutral-300 transition-all duration-150 flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showPrompts ? 'Hide' : 'View'} Prompts
            </button>
          </div>
          <div className="flex gap-2 text-sm text-neutral-500">
            <span className="bg-neutral-100 px-3 py-1 rounded-pill">Cognitive Mirroring</span>
            <span className="bg-neutral-100 px-3 py-1 rounded-pill">Pattern Recognition</span>
            <span className="bg-neutral-100 px-3 py-1 rounded-pill">Voice Cloning</span>
          </div>
        </div>

        {/* Prompts section */}
        {showPrompts && (
          <PromptViewer
            activeTab={activePromptTab}
            setActiveTab={setActivePromptTab}
            onCopyToClipboard={copyToClipboard}
          />
        )}

        {/* Main grid layout with three columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Voice Extraction */}
          <div className="lg:col-span-1">
            <VoiceExtraction
              transcriptInput={transcriptInput}
              setTranscriptInput={setTranscriptInput}
              extractedProfile={extractedProfile}
              savedProfiles={savedProfiles}
              isExtracting={isExtracting}
              onExtractProfile={extractVoiceProfile}
              onSaveProfile={saveProfile}
              onDeleteProfile={deleteProfile}
              onSelectProfile={setSelectedProfile}
              onCopyToClipboard={copyToClipboard}
            />
          </div>

          {/* Column 2: Voice Cloning */}
          <div className="lg:col-span-1">
            <VoiceCloning
              topicInput={topicInput}
              setTopicInput={setTopicInput}
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              savedProfiles={savedProfiles}
              clonedContent={clonedContent}
              isCloning={isCloning}
              onCloneVoice={cloneVoice}
              onSaveContent={saveContent}
              onCopyToClipboard={copyToClipboard}
            />
          </div>

          {/* Column 3: Saved Content */}
          <div className="lg:col-span-1">
            <SavedContent
              savedContent={savedContent}
              savedProfiles={savedProfiles}
              onCopyToClipboard={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  )
}