'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Wand2, 
  Fish, 
  Target, 
  RefreshCw, 
  Check, 
  X, 
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AISuggestion {
  id: string
  text: string
  action: string
  confidence?: number
}

interface AISuggestionPopupProps {
  isOpen: boolean
  onClose: () => void
  sectionType: 'hook' | 'bridge' | 'nugget' | 'cta' | 'micro-hook'
  originalText: string
  onApply: (newText: string) => void
  position: { x: number, y: number }
}

const SECTION_ACTIONS = {
  'hook': [
    { id: 'simplify', label: 'Simplify', icon: <Wand2 className="w-4 h-4" />, description: 'Make it easier to understand' },
    { id: 'generate_variations', label: '10 Hook Variations', icon: <Fish className="w-4 h-4" />, description: 'Generate multiple hook options' },
    { id: 'convert_hook_type', label: 'Convert Hook Type', icon: <Target className="w-4 h-4" />, description: 'Change to problem/benefit/curiosity hook' },
    { id: 'change_hook_style', label: 'Change Hook Style', icon: <RefreshCw className="w-4 h-4" />, description: 'Question, story, statistic, etc.' },
  ],
  'micro-hook': [
    { id: 'simplify', label: 'Simplify', icon: <Wand2 className="w-4 h-4" />, description: 'Make it easier to understand' },
    { id: 'generate_variations', label: '10 Variations', icon: <Fish className="w-4 h-4" />, description: 'Generate multiple options' },
  ],
  'bridge': [
    { id: 'simplify', label: 'Simplify', icon: <Wand2 className="w-4 h-4" />, description: 'Make it easier to understand' },
    { id: 'strengthen_connection', label: 'Strengthen Connection', icon: <ArrowRight className="w-4 h-4" />, description: 'Better link hook to content' },
    { id: 'change_bridge_style', label: 'Change Bridge Style', icon: <RefreshCw className="w-4 h-4" />, description: 'Smooth, contrast, problem-solution' },
  ],
  'nugget': [
    { id: 'simplify', label: 'Simplify', icon: <Wand2 className="w-4 h-4" />, description: 'Make it easier to understand' },
    { id: 'enhance_value', label: 'Enhance Value', icon: <Sparkles className="w-4 h-4" />, description: 'Make more impactful' },
    { id: 'add_evidence', label: 'Add Evidence', icon: <Target className="w-4 h-4" />, description: 'Include data and examples' },
  ],
  'cta': [
    { id: 'simplify', label: 'Simplify', icon: <Wand2 className="w-4 h-4" />, description: 'Make it easier to understand' },
    { id: 'change_cta_style', label: 'Change Style', icon: <RefreshCw className="w-4 h-4" />, description: 'Urgent, soft, direct, or benefit-focused' },
  ],
}

const HOOK_TYPE_OPTIONS = [
  { id: 'problem', label: 'Problem Hook', description: 'Identify a pain point' },
  { id: 'benefit', label: 'Benefit Hook', description: 'Promise a reward' },
  { id: 'curiosity', label: 'Curiosity Hook', description: 'Create intrigue' },
  { id: 'question', label: 'Question Hook', description: 'Engage with a question' },
  { id: 'story', label: 'Story Hook', description: 'Start with a narrative' },
]

const HOOK_STYLE_OPTIONS = [
  { id: 'question', label: 'Question', description: 'Engaging question format' },
  { id: 'statistic', label: 'Statistic', description: 'Lead with compelling data' },
  { id: 'story', label: 'Story', description: 'Brief personal narrative' },
  { id: 'provocative', label: 'Provocative', description: 'Bold, attention-grabbing' },
  { id: 'direct', label: 'Direct', description: 'Clear, straight to the point' },
  { id: 'contrarian', label: 'Contrarian', description: 'Challenge common beliefs' },
]

const BRIDGE_STYLE_OPTIONS = [
  { id: 'smooth', label: 'Smooth', description: 'Gentle logical flow' },
  { id: 'contrast', label: 'Contrast', description: 'Highlight differences' },
  { id: 'problem_solution', label: 'Problem-Solution', description: 'Present problem then resolution' },
]

const CTA_STYLE_OPTIONS = [
  { id: 'urgent', label: 'Urgent', description: 'Create urgency and immediate action' },
  { id: 'soft_ask', label: 'Soft Ask', description: 'Gentle invitation that isn\'t pushy' },
  { id: 'direct_command', label: 'Direct Command', description: 'Clear directive' },
  { id: 'benefit_focused', label: 'Benefit Focused', description: 'Emphasize value received' },
]

export function AISuggestionPopup({
  isOpen,
  onClose,
  sectionType,
  originalText,
  onApply,
  position
}: AISuggestionPopupProps) {
  const [currentStep, setCurrentStep] = useState<'actions' | 'options' | 'suggestions'>('actions')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [_selectedOption, setSelectedOption] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const actions = SECTION_ACTIONS[sectionType] || []

  const handleActionSelect = async (actionId: string) => {
    setSelectedAction(actionId)
    setError(null)

    // For actions that need additional options
    if (actionId === 'convert_hook_type' || actionId === 'change_hook_style' || 
        actionId === 'change_bridge_style' || actionId === 'change_cta_style') {
      setCurrentStep('options')
      return
    }

    // For direct actions, generate suggestions immediately
    await generateSuggestions(actionId)
  }

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOption(optionId)
    if (selectedAction) {
      await generateSuggestions(selectedAction, optionId)
    }
  }

  const generateSuggestions = async (actionId: string, option?: string) => {
    setLoading(true)
    setCurrentStep('suggestions')
    setSuggestions([])

    try {
      const response = await fetch('/api/ai-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: actionId,
          text: originalText,
          option,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()

      if (data.success) {
        // Handle multiple variations for generate_variations
        if (actionId === 'generate_variations' && data.modifiedText?.includes('\n')) {
          const variations = data.modifiedText
            .split('\n')
            .filter((line: string) => line.trim())
            .map((variation: string, index: number) => ({
              id: `variation-${index}`,
              text: variation.replace(/^\d+\.\s*/, '').trim(), // Remove numbering
              action: actionId,
              confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence
            }))
          setSuggestions(variations.slice(0, 10)) // Limit to 10
        } else {
          // Single suggestion
          setSuggestions([{
            id: 'suggestion-1',
            text: data.modifiedText,
            action: actionId,
            confidence: Math.floor(Math.random() * 20) + 80,
          }])
        }
      } else {
        throw new Error(data.error || 'Failed to generate suggestions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (suggestion: AISuggestion) => {
    onApply(suggestion.text)
    onClose()
  }

  const handleBack = () => {
    if (currentStep === 'suggestions') {
      if (selectedAction === 'convert_hook_type' || selectedAction === 'change_hook_style' ||
          selectedAction === 'change_bridge_style' || selectedAction === 'change_cta_style') {
        setCurrentStep('options')
      } else {
        setCurrentStep('actions')
      }
    } else if (currentStep === 'options') {
      setCurrentStep('actions')
    }
    setError(null)
  }

  const getOptionsForAction = () => {
    if (selectedAction === 'convert_hook_type') return HOOK_TYPE_OPTIONS
    if (selectedAction === 'change_hook_style') return HOOK_STYLE_OPTIONS
    if (selectedAction === 'change_bridge_style') return BRIDGE_STYLE_OPTIONS
    if (selectedAction === 'change_cta_style') return CTA_STYLE_OPTIONS
    return []
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-card border border-border rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] min-w-80 max-w-md"
      style={{
        left: `${Math.min(position.x, window.innerWidth - 350)}px`,
        top: `${Math.min(position.y + 10, window.innerHeight - 400)}px`,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground capitalize">
              {sectionType.replace('-', ' ')} Actions
            </h3>
            <p className="text-xs text-muted-foreground">
              {currentStep === 'actions' && 'Choose an action'}
              {currentStep === 'options' && 'Select an option'}
              {currentStep === 'suggestions' && 'Pick a suggestion'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions Step */}
        {currentStep === 'actions' && (
          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionSelect(action.id)}
                className="w-full text-left p-3 rounded-[var(--radius-button)] border border-border hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary">{action.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Options Step */}
        {currentStep === 'options' && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2"
            >
              ← Back
            </Button>
            {getOptionsForAction().map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className="w-full text-left p-3 rounded-[var(--radius-button)] border border-border hover:bg-background-hover transition-colors"
              >
                <div className="text-sm font-medium text-foreground">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Suggestions Step */}
        {currentStep === 'suggestions' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                ← Back
              </Button>
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-[var(--radius-button)] p-3 mb-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border border-border rounded-[var(--radius-button)] p-3 hover:bg-background-hover transition-colors"
                  >
                    <p className="text-sm text-foreground leading-relaxed mb-3">
                      {suggestion.text}
                    </p>
                    <div className="flex items-center justify-between">
                      {suggestion.confidence && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.confidence}% confidence
                        </span>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleApply(suggestion)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && !error && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No suggestions generated</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
