'use client'

import React from 'react'
import {
  FileText,
  Eye,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings
} from 'lucide-react'

interface ComponentAnalysis {
  component: string
  text: string
  complexity: string
  gradeLevel: string
  suggestions: string[]
}

interface ScriptAnalysisData {
  hasComponentAnalysis: boolean
  readabilityScore?: number
  overallGradeLevel?: string
  passesThirdGradeTest?: boolean
  wordCount?: number
  estimatedDuration?: number
  componentAnalysis?: {
    components: ComponentAnalysis[]
    mostComplex?: ComponentAnalysis
    recommendations: string[]
  } | null
}

interface AnalysisSidebarProps {
  sidebarTab: 'analysis' | 'metrics' | 'suggestions'
  setSidebarTab: (tab: 'analysis' | 'metrics' | 'suggestions') => void
  scriptAnalysis: ScriptAnalysisData
  wordCount: number
}

export function AnalysisSidebar({ 
  sidebarTab, 
  setSidebarTab, 
  scriptAnalysis, 
  wordCount 
}: AnalysisSidebarProps) {
  return (
    <div className="w-80">
      <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-soft-minimal)]">
        {/* Tab Navigation */}
        <div className="border-b border-border-subtle mb-6">
          <nav className="flex space-x-8">
            {(['analysis', 'metrics', 'suggestions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  sidebarTab === tab 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border-hover'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Analysis Tab */}
        {sidebarTab === 'analysis' && (
          <div className="space-y-4">
            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Content Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      scriptAnalysis.readabilityScore && scriptAnalysis.readabilityScore > 70 
                        ? 'bg-green-500' 
                        : scriptAnalysis.readabilityScore && scriptAnalysis.readabilityScore > 50 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-foreground">
                      {scriptAnalysis.readabilityScore ?? 87}/100
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Grade Level</span>
                  <span className="text-sm font-medium text-foreground">
                    {scriptAnalysis.overallGradeLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">3rd Grade Test</span>
                  <div className="flex items-center space-x-1">
                    {scriptAnalysis.passesThirdGradeTest ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {scriptAnalysis.passesThirdGradeTest ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Word Count</span>
                  <span className="text-sm font-medium text-foreground">
                    {scriptAnalysis.wordCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Est. Runtime</span>
                  <span className="text-sm font-medium text-foreground">
                    {scriptAnalysis.estimatedDuration} sec
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border-subtle">
                * Section headings excluded from analysis
              </div>
            </div>

            {/* Structure Analysis */}
            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Structure</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hook</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Micro Hook</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bridge</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Golden Nugget</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Call to Action</span>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Component Readability Analysis */}
            {scriptAnalysis.hasComponentAnalysis && (
              <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">Component Analysis</h3>
                </div>
                <div className="space-y-3">
                  {scriptAnalysis.componentAnalysis?.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-b-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {component.component.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {component.gradeLevel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {component.complexity === 'elementary' ? (
                          <span className="text-sm">👍</span>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${
                            component.complexity === 'middle-school' ? 'bg-blue-500' :
                            component.complexity === 'high-school' ? 'bg-yellow-500' :
                            component.complexity === 'college' ? 'bg-orange-500' : 'bg-red-500'
                          }`} />
                        )}
                        <span className="text-xs font-medium text-foreground capitalize">
                          {component.complexity.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {scriptAnalysis.componentAnalysis?.mostComplex && (
                  <div className="mt-4 pt-3 border-t border-border-subtle">
                    <span className="text-xs text-muted-foreground">
                      Most Complex: <strong>{scriptAnalysis.componentAnalysis.mostComplex.component.replace('-', ' ')}</strong> ({scriptAnalysis.componentAnalysis.mostComplex.gradeLevel})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Metrics Tab */}
        {sidebarTab === 'metrics' && (
          <div className="space-y-4">
            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Performance</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Engagement Score</span>
                    <span className="text-sm font-medium text-foreground">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Clarity</span>
                    <span className="text-sm font-medium text-foreground">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Impact</span>
                    <span className="text-sm font-medium text-foreground">65%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Script Timing</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(wordCount / 3.5)} sec
                </div>
                <div className="text-sm text-muted-foreground">Estimated video length</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {sidebarTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Improvements</h3>
              </div>
              <div className="space-y-3">
                {/* General Recommendations */}
                {scriptAnalysis.componentAnalysis?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-[var(--radius-button)] bg-accent/10 border border-accent/20">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Script Recommendation</div>
                      <div className="text-sm text-muted-foreground">{recommendation}</div>
                    </div>
                  </div>
                ))}

                {/* Component-Specific Suggestions */}
                {scriptAnalysis.componentAnalysis?.components
                  .filter(c => c.suggestions.length > 0)
                  .map((component, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium text-foreground capitalize mt-4 mb-2">
                        {component.component.replace('-', ' ')} Suggestions
                      </div>
                      {component.suggestions.slice(0, 2).map((suggestion, suggestionIndex) => (
                        <div key={suggestionIndex} className="flex items-start space-x-3 p-3 rounded-[var(--radius-button)]" 
                             style={{ 
                               backgroundColor: component.complexity === 'elementary' ? 'hsl(var(--muted)/0.5)' :
                                              component.complexity === 'middle-school' ? 'hsl(var(--accent)/0.1)' :
                                              component.complexity === 'high-school' ? 'rgba(245, 158, 11, 0.1)' : 
                                              component.complexity === 'college' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                             }}>
                          {component.complexity === 'elementary' ? (
                            <span className="text-sm">👍</span>
                          ) : (
                            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              component.complexity === 'middle-school' ? 'text-blue-600' :
                              component.complexity === 'high-school' ? 'text-yellow-600' : 
                              component.complexity === 'college' ? 'text-orange-600' : 'text-red-600'
                            }`} />
                          )}
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {component.component.replace('-', ' ')} - {component.gradeLevel}
                            </div>
                            <div className="text-sm text-muted-foreground">{suggestion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                {!scriptAnalysis.hasComponentAnalysis && (
                  <>
                    <div className="flex items-start space-x-3 p-3 rounded-[var(--radius-button)] bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Strengthen CTA</div>
                        <div className="text-sm text-muted-foreground">Make the call-to-action more specific and compelling</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-[var(--radius-button)] bg-accent/10 border border-accent/20">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Add Statistics</div>
                        <div className="text-sm text-muted-foreground">Include specific data about research timeline improvements</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-[var(--radius-button)] bg-purple-50 border border-purple-200">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Visual Elements</div>
                        <div className="text-sm text-muted-foreground">Consider adding graphics to illustrate the AI research process</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-elevated rounded-[var(--radius-button)] border border-border p-4">
              <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-background-hover hover:text-foreground rounded-[var(--radius-button)] transition-colors">
                  Generate hook variations
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-background-hover hover:text-foreground rounded-[var(--radius-button)] transition-colors">
                  Optimize script length
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-background-hover hover:text-foreground rounded-[var(--radius-button)] transition-colors">
                  Check pronunciation
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-background-hover hover:text-foreground rounded-[var(--radius-button)] transition-colors">
                  Export for video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
