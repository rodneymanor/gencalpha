'use client'

import React from 'react'
import { Settings, Zap, MessageSquare, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WorkflowOption {
  id: 'chat' | 'streamlined'
  title: string
  description: string
  pros: string[]
  cons: string[]
  badge?: string
  recommended?: boolean
}

const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    id: 'chat',
    title: 'Chat-Based Workflow',
    description: 'Current implementation with chat interface and slideout editor',
    pros: [
      'Familiar chat interface',
      'Supports conversations',
      'Video analysis integration',
      'Existing user base comfortable'
    ],
    cons: [
      'Multiple UI contexts',
      'Complex state management', 
      'Disconnected editing experience',
      'Unclear AI progress'
    ],
    badge: 'Current'
  },
  {
    id: 'streamlined',
    title: 'Streamlined Workflow',
    description: 'Direct input-to-editor with Arc Timeline progress visualization',
    pros: [
      'Single-context experience',
      'Clear AI progress visualization',
      'Immediate editing access',
      'AI actions integrated',
      'Smooth transitions'
    ],
    cons: [
      'New user learning curve',
      'Less conversational',
      'Requires user education'
    ],
    badge: 'Recommended',
    recommended: true
  }
]

interface MigrationConfigProps {
  currentWorkflow: 'chat' | 'streamlined'
  onWorkflowChange: (workflow: 'chat' | 'streamlined') => void
  showComparison?: boolean
}

export function MigrationConfig({
  currentWorkflow,
  onWorkflowChange,
  showComparison = true
}: MigrationConfigProps) {

  if (!showComparison) {
    // Simple toggle for production use
    return (
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-[var(--radius-card)] border">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">Script Generation Mode</div>
          <div className="text-xs text-muted-foreground">
            Choose your preferred script writing experience
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={currentWorkflow === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onWorkflowChange('chat')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={currentWorkflow === 'streamlined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onWorkflowChange('streamlined')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Streamlined
          </Button>
        </div>
      </div>
    )
  }

  // Full comparison view for testing/admin
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Script Writing Experience</h2>
        <p className="text-muted-foreground">
          We're testing a new streamlined workflow. Try both and let us know your preference!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {WORKFLOW_OPTIONS.map((option) => (
          <Card 
            key={option.id}
            className={`
              relative cursor-pointer transition-all hover:shadow-md
              ${currentWorkflow === option.id ? 'ring-2 ring-primary border-primary' : ''}
              ${option.recommended ? 'border-primary/50' : ''}
            `}
            onClick={() => onWorkflowChange(option.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    {option.id === 'chat' && <MessageSquare className="w-5 h-5" />}
                    {option.id === 'streamlined' && <Zap className="w-5 h-5" />}
                    <span>{option.title}</span>
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
                <div className="space-y-1">
                  {option.badge && (
                    <Badge variant={option.recommended ? 'default' : 'secondary'}>
                      {option.badge}
                    </Badge>
                  )}
                  {currentWorkflow === option.id && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pros */}
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2">✅ Advantages</h4>
                <ul className="space-y-1">
                  {option.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-2">⚠️ Considerations</h4>
                <ul className="space-y-1">
                  {option.cons.map((con, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button 
                  className="w-full" 
                  variant={currentWorkflow === option.id ? 'default' : 'outline'}
                  onClick={() => onWorkflowChange(option.id)}
                >
                  {currentWorkflow === option.id ? 'Currently Active' : 'Try This Workflow'}
                  {currentWorkflow !== option.id && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Migration Timeline */}
      <div className="bg-muted/30 rounded-[var(--radius-card)] p-6">
        <h3 className="font-semibold mb-4">Migration Timeline</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span><strong>Phase 1 (Current):</strong> A/B testing with both workflows available</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span><strong>Phase 2 (Next Week):</strong> User feedback collection and optimization</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span><strong>Phase 3 (Coming Soon):</strong> Full migration to preferred workflow</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for workflow management
export function useWorkflowMigration() {
  const [workflow, setWorkflow] = React.useState<'chat' | 'streamlined'>('streamlined')
  
  React.useEffect(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem('script-workflow-preference')
    if (saved === 'chat' || saved === 'streamlined') {
      setWorkflow(saved)
    }
  }, [])

  const changeWorkflow = (newWorkflow: 'chat' | 'streamlined') => {
    setWorkflow(newWorkflow)
    localStorage.setItem('script-workflow-preference', newWorkflow)
  }

  return {
    currentWorkflow: workflow,
    setWorkflow: changeWorkflow
  }
}
