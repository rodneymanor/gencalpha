'use client'

import React, { useState, useEffect } from 'react'
import { 
  User, 
  FileText, 
  Zap, 
  Fish, 
  Lightbulb, 
  ArrowRight, 
  Target, 
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// Types from existing components
interface PersonaOption {
  id: string
  name: string
  description: string
  voiceStyle?: string
  distinctiveness?: string
  usageCount?: number
}

type ActionType = 
  | "generate-hooks"
  | "content-ideas" 
  | "value-bombs"
  | "if-then-script"
  | "problem-solution"
  | "tutorial-script"

interface ContentAction {
  key: ActionType
  label: string
  icon: React.ReactNode
  description: string
  prompt: string
  category: "generators" | "templates"
}

interface FloatingAiActionsPanelProps {
  onPersonaSelect?: (persona: PersonaOption | null) => void
  onActionTrigger?: (action: ActionType, prompt: string) => void
  className?: string
}

// Content actions from existing components
const CONTENT_ACTIONS: ContentAction[] = [
  // Quick Generators
  {
    key: "generate-hooks",
    label: "Generate 10 Hooks",
    icon: <Fish className="h-4 w-4" />,
    description: "Get 10 attention-grabbing hooks for your content idea",
    prompt: "Generate 10 compelling hooks for this content idea. Make them scroll-stopping, curiosity-driven, and platform-optimized. Format them as a numbered list with brief explanations of why each hook works.",
    category: "generators",
  },
  {
    key: "content-ideas",
    label: "10 Content Ideas",
    icon: <Lightbulb className="h-4 w-4" />,
    description: "Get 10 related content ideas to expand your topic",
    prompt: "Generate 10 content ideas related to this topic. Make them specific, actionable, and varied in format (tutorials, tips, stories, etc). Include a brief description for each idea.",
    category: "generators",
  },
  {
    key: "value-bombs",
    label: "10 Value Tips",
    icon: <Zap className="h-4 w-4" />,
    description: "Get 10 high-value, actionable tips for your audience",
    prompt: "Generate 10 high-value, actionable tips related to this topic. Make them specific, immediately useful, and something your audience can implement right away. Format as clear, concise points.",
    category: "generators",
  },
  // Script Templates
  {
    key: "if-then-script",
    label: '"If You... Then Do This"',
    icon: <ArrowRight className="h-4 w-4" />,
    description: "Problem-solution script template",
    prompt: 'Create an "If you [problem], then do this [solution]" script format. Structure it as: Hook → Problem identification → Clear solution → Call to action. Make it conversational and direct.',
    category: "templates",
  },
  {
    key: "problem-solution",
    label: "Problem → Solution",
    icon: <Target className="h-4 w-4" />,
    description: "Classic problem-solution script structure",
    prompt: "Create a problem-solution script with clear structure: Identify the problem → Agitate the pain → Present the solution → Call to action. Make it compelling and actionable.",
    category: "templates",
  },
  {
    key: "tutorial-script",
    label: "Step-by-Step Tutorial",
    icon: <Layers className="h-4 w-4" />,
    description: "Step-by-step tutorial format",
    prompt: "Create a tutorial-style script with clear steps: Introduction → Step-by-step instructions → Tips for success → Call to action. Make it easy to follow and actionable.",
    category: "templates",
  },
]

export function FloatingAiActionsPanel({ 
  onPersonaSelect, 
  onActionTrigger, 
  className = "" 
}: FloatingAiActionsPanelProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(null)
  const [userPersonas, setUserPersonas] = useState<PersonaOption[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    personas: true,
    templates: true,
    generators: true,
  })

  // Load user personas
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const response = await fetch("/api/personas/list", {
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUserPersonas(data.personas ?? [])
          }
        }
      } catch (error) {
        console.error("Failed to load personas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPersonas()
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePersonaSelect = (persona: PersonaOption | null) => {
    setSelectedPersona(persona)
    onPersonaSelect?.(persona)
  }

  const handleActionTrigger = (action: ActionType, prompt: string) => {
    onActionTrigger?.(action, prompt)
  }

  const generators = CONTENT_ACTIONS.filter(action => action.category === "generators")
  const templates = CONTENT_ACTIONS.filter(action => action.category === "templates")

  return (
    <div className={`bg-card border border-border rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] h-full overflow-hidden ${className}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Actions</h2>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Persona Selection */}
            <div>
              <button
                onClick={() => toggleSection('personas')}
                className="flex items-center justify-between w-full py-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Persona Selection</span>
                </div>
                {expandedSections.personas ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.personas && (
                <div className="mt-3 space-y-2">
                  {loading ? (
                    <div className="text-xs text-muted-foreground">Loading personas...</div>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePersonaSelect(null)}
                        className={`w-full text-left p-3 rounded-[var(--radius-button)] border transition-colors ${
                          selectedPersona === null 
                            ? 'border-primary bg-accent text-accent-foreground' 
                            : 'border-border hover:border-border-hover hover:bg-background-hover'
                        }`}
                      >
                        <div className="text-sm font-medium">Default AI</div>
                        <div className="text-xs text-muted-foreground">Standard content generation</div>
                      </button>
                      
                      {userPersonas.slice(0, 3).map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() => handlePersonaSelect(persona)}
                          className={`w-full text-left p-3 rounded-[var(--radius-button)] border transition-colors ${
                            selectedPersona?.id === persona.id 
                              ? 'border-primary bg-accent text-accent-foreground' 
                              : 'border-border hover:border-border-hover hover:bg-background-hover'
                          }`}
                        >
                          <div className="text-sm font-medium">{persona.name}</div>
                          <div className="text-xs text-muted-foreground">{persona.description}</div>
                        </button>
                      ))}
                      
                      {userPersonas.length > 3 && (
                        <button className="w-full text-xs text-primary hover:text-primary/80 p-2 text-center transition-colors">
                          View all personas ({userPersonas.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Script Templates */}
            <div>
              <button
                onClick={() => toggleSection('templates')}
                className="flex items-center justify-between w-full py-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Script Templates</span>
                </div>
                {expandedSections.templates ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.templates && (
                <div className="mt-3 space-y-2">
                  {templates.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => handleActionTrigger(action.key, action.prompt)}
                      className="w-full text-left p-3 rounded-[var(--radius-button)] border border-border hover:border-border-hover hover:bg-background-hover transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {action.icon}
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Generators */}
            <div>
              <button
                onClick={() => toggleSection('generators')}
                className="flex items-center justify-between w-full py-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Quick Generators</span>
                </div>
                {expandedSections.generators ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.generators && (
                <div className="mt-3 space-y-2">
                  {generators.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => handleActionTrigger(action.key, action.prompt)}
                      className="w-full text-left p-3 rounded-[var(--radius-button)] border border-border hover:border-border-hover hover:bg-background-hover transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {action.icon}
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Selection Status */}
            {selectedPersona && (
              <div className="bg-accent/10 rounded-[var(--radius-button)] p-4 border border-accent/20">
                <h4 className="text-sm font-medium text-primary mb-1">🎯 Active Persona</h4>
                <div className="text-xs text-muted-foreground">
                  <strong>{selectedPersona.name}</strong> • {selectedPersona.description}
                </div>
              </div>
            )}

            {/* Usage Tips */}
            <div className="bg-muted/50 rounded-[var(--radius-button)] p-4 border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">💡 Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Select a persona to match your writing style</li>
                <li>• Use templates for structured content</li>
                <li>• Generators create specific content types</li>
                <li>• All outputs will show with readability analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
