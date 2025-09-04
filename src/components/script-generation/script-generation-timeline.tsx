'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Brain, 
  FileText, 
  Wand2, 
  CheckCircle2,
  Loader2 
} from 'lucide-react'

interface TimelineStep {
  icon: React.ReactNode
  content: string
  status: 'pending' | 'active' | 'completed'
  timestamp?: string
}

interface ScriptGenerationTimelineProps {
  isActive: boolean
  onComplete: (script: string) => void
  userPrompt: string
  selectedPersona?: any
}

// AI Script Generation Steps - Mimics the actual process
const GENERATION_STEPS = [
  {
    time: "Step 1",
    steps: [
      { 
        icon: <Brain className="w-4 h-4" />, 
        content: "Analyzing your idea and intent" 
      }
    ]
  },
  {
    time: "Step 2", 
    steps: [
      { 
        icon: <Sparkles className="w-4 h-4" />, 
        content: "Crafting compelling hook" 
      },
      {
        icon: <Wand2 className="w-4 h-4" />,
        content: "Building narrative bridge"
      }
    ]
  },
  {
    time: "Step 3",
    steps: [
      {
        icon: <FileText className="w-4 h-4" />,
        content: "Developing golden nugget content"
      },
      {
        icon: <CheckCircle2 className="w-4 h-4" />,
        content: "Creating call-to-action"
      }
    ]
  },
  {
    time: "Final",
    steps: [
      {
        icon: <CheckCircle2 className="w-4 h-4" />,
        content: "Polishing and optimizing script"
      }
    ]
  }
]

export function ScriptGenerationTimeline({ 
  isActive, 
  onComplete, 
  userPrompt,
  selectedPersona 
}: ScriptGenerationTimelineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate script when timeline becomes active
  useEffect(() => {
    if (isActive && !isGenerating) {
      generateScript()
    }
  }, [isActive, isGenerating])

  const generateScript = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate realistic AI generation timing
      await simulateGenerationSteps()
      
      // Make actual API call with proper auth headers
      // Get Firebase Auth token
      const { auth } = await import('@/lib/firebase')
      if (!auth?.currentUser) {
        throw new Error('User not authenticated')
      }

      const token = await auth.currentUser.getIdToken()

      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          idea: userPrompt,
          length: '60',
          persona: selectedPersona,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.script) {
          // Convert to our expected format
          const scriptMarkdown = formatScriptForEditor(result.script)
          onComplete(scriptMarkdown)
        } else {
          throw new Error(result.error || 'Script generation failed')
        }
      } else {
        throw new Error('Network error during script generation')
      }
    } catch (error) {
      console.error('Script generation error:', error)
      // Show user-friendly error message and provide fallback
      const errorMessage = error instanceof Error ? error.message : 'Script generation failed'
      
      // Create a helpful fallback script
      const fallbackScript = createFallbackScript(userPrompt, errorMessage)
      onComplete(fallbackScript)
    } finally {
      setIsGenerating(false)
    }
  }

  const simulateGenerationSteps = async () => {
    // Step through each major step
    for (let stepIndex = 0; stepIndex < GENERATION_STEPS.length; stepIndex++) {
      setCurrentStepIndex(stepIndex)
      const step = GENERATION_STEPS[stepIndex]
      
      // Step through substeps within each major step
      for (let subStepIndex = 0; subStepIndex < step.steps.length; subStepIndex++) {
        setCurrentSubStepIndex(subStepIndex)
        
        // Realistic timing based on step complexity
        const delay = getStepDelay(stepIndex, subStepIndex)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  const getStepDelay = (stepIndex: number, subStepIndex: number) => {
    // Realistic delays that match actual AI processing
    const stepDelays = [
      [1000], // Step 1: Analysis (1s)
      [1500, 1200], // Step 2: Hook and Bridge (1.5s, 1.2s)
      [2000, 1800], // Step 3: Content and CTA (2s, 1.8s)  
      [800] // Final: Polish (0.8s)
    ]
    return stepDelays[stepIndex]?.[subStepIndex] || 1000
  }

  const formatScriptForEditor = (script: any) => {
    return `**Hook:**
${script.hook}

**Micro Hook:**
Now here's what's interesting...

**Bridge:**
${script.bridge}

**Golden Nugget:**
${script.goldenNugget}

**Call to Action:**
${script.wta}`
  }

  const createFallbackScript = (prompt: string, errorMessage?: string) => {
    const topicWords = prompt.split(' ').slice(0, 3).join(' ')
    
    return `> **⚠️ Note:** We encountered an issue generating your custom script${errorMessage ? ` (${errorMessage})` : ''}. Here's a template you can customize:

**Hook:**
Here's something you might not know about ${topicWords}.

**Micro Hook:**
But here's the thing most people miss...

**Bridge:**
The key is understanding that this isn't just about the obvious solution - it's about the approach that actually works.

**Golden Nugget:**
The secret is to focus on the fundamentals first. Start with the basic principles, then build complexity. This creates a solid foundation that actually delivers results, rather than trying shortcuts that ultimately fail.

**Call to Action:**
What's your experience with this approach? Let me know in the comments below!

> **💡 Tip:** You can edit any section above by clicking on it. Try using our AI actions to improve each part!`
  }

  const getStepStatus = (stepIndex: number, subStepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex && subStepIndex <= currentSubStepIndex) return 'active'
    return 'pending'
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Crafting Your Script
              </h2>
              <p className="text-muted-foreground">
                AI is analyzing and creating your content...
              </p>
            </div>
          </div>
        </div>

        {/* Arc Timeline */}
        <div className="space-y-8">
          {GENERATION_STEPS.map((step, stepIndex) => (
            <div key={step.time} className="relative">
              {/* Step Time Label */}
              <div className="text-sm font-semibold text-muted-foreground mb-4 text-center">
                {step.time}
              </div>
              
              {/* Step Content */}
              <div className="space-y-4">
                {step.steps.map((subStep, subStepIndex) => {
                  const status = getStepStatus(stepIndex, subStepIndex)
                  
                  return (
                    <div 
                      key={subStepIndex}
                      className={`
                        flex items-center space-x-4 p-4 rounded-[var(--radius-card)] border transition-all duration-500
                        ${status === 'active' ? 'border-primary bg-primary/5 shadow-sm' : ''}
                        ${status === 'completed' ? 'border-green-200 bg-green-50' : ''}
                        ${status === 'pending' ? 'border-border bg-muted/30' : ''}
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors
                        ${status === 'active' ? 'bg-primary text-primary-foreground' : ''}
                        ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                        ${status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                      `}>
                        {status === 'active' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          subStep.icon
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <p className={`
                          text-sm font-medium transition-colors
                          ${status === 'active' ? 'text-foreground' : ''}
                          ${status === 'completed' ? 'text-foreground' : ''}
                          ${status === 'pending' ? 'text-muted-foreground' : ''}
                        `}>
                          {subStep.content}
                        </p>
                      </div>
                      
                      {/* Status Indicator */}
                      {status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Connecting Line */}
              {stepIndex < GENERATION_STEPS.length - 1 && (
                <div className="flex justify-center mt-6">
                  <div className={`
                    w-px h-8 transition-colors duration-500
                    ${stepIndex < currentStepIndex ? 'bg-green-500' : 'bg-border'}
                  `} />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="text-xs text-muted-foreground">
            Step {Math.min(currentStepIndex + 1, GENERATION_STEPS.length)} of {GENERATION_STEPS.length}
          </div>
        </div>
      </div>
    </div>
  )
}
