"use client";

import React from "react";

import { FileText, Eye, Target, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, Settings } from "lucide-react";

interface ComponentAnalysis {
  component: string;
  text: string;
  complexity: string;
  gradeLevel: string;
  suggestions: string[];
}

interface ScriptAnalysisData {
  hasComponentAnalysis: boolean;
  readabilityScore?: number;
  overallGradeLevel?: string;
  passesThirdGradeTest?: boolean;
  wordCount?: number;
  estimatedDuration?: number;
  componentAnalysis?: {
    components: ComponentAnalysis[];
    mostComplex?: ComponentAnalysis;
    recommendations: string[];
  } | null;
}

interface AnalysisSidebarProps {
  sidebarTab: "analysis" | "metrics" | "suggestions";
  setSidebarTab: (tab: "analysis" | "metrics" | "suggestions") => void;
  scriptAnalysis: ScriptAnalysisData;
  wordCount: number;
}

export function AnalysisSidebar({ sidebarTab, setSidebarTab, scriptAnalysis, wordCount }: AnalysisSidebarProps) {
  return (
    <div className="w-80">
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-soft-minimal)]">
        {/* Tab Navigation */}
        <div className="border-border-subtle mb-6 border-b">
          <nav className="flex space-x-8">
            {(["analysis", "metrics", "suggestions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`border-b-2 px-1 py-2 text-sm font-medium capitalize transition-colors ${
                  sidebarTab === tab
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:border-border-hover border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Analysis Tab */}
        {sidebarTab === "analysis" && (
          <div className="space-y-4">
            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <div className="mb-3 flex items-center space-x-3">
                <Target className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-medium">Content Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Overall Score</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        scriptAnalysis.readabilityScore && scriptAnalysis.readabilityScore > 70
                          ? "bg-green-500"
                          : scriptAnalysis.readabilityScore && scriptAnalysis.readabilityScore > 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-foreground text-sm font-medium">
                      {scriptAnalysis.readabilityScore ?? 87}/100
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Grade Level</span>
                  <span className="text-foreground text-sm font-medium">{scriptAnalysis.overallGradeLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">3rd Grade Test</span>
                  <div className="flex items-center space-x-1">
                    {scriptAnalysis.passesThirdGradeTest ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {scriptAnalysis.passesThirdGradeTest ? "Pass" : "Fail"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Word Count</span>
                  <span className="text-foreground text-sm font-medium">{scriptAnalysis.wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Est. Runtime</span>
                  <span className="text-foreground text-sm font-medium">{scriptAnalysis.estimatedDuration} sec</span>
                </div>
              </div>
              <div className="text-muted-foreground border-border-subtle mt-3 border-t pt-3 text-xs">
                * Section headings excluded from analysis
              </div>
            </div>

            {/* Structure Analysis */}
            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <div className="mb-3 flex items-center space-x-3">
                <Eye className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-medium">Structure</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Hook</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Micro Hook</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Bridge</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Golden Nugget</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Call to Action</span>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Component Readability Analysis */}
            {scriptAnalysis.hasComponentAnalysis && (
              <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
                <div className="mb-3 flex items-center space-x-3">
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <h3 className="text-foreground font-medium">Component Analysis</h3>
                </div>
                <div className="space-y-3">
                  {scriptAnalysis.componentAnalysis?.components.map((component, index) => (
                    <div
                      key={index}
                      className="border-border-subtle flex items-center justify-between border-b py-2 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm font-medium capitalize">
                          {component.component.replace("-", " ")}
                        </span>
                        <span className="text-muted-foreground text-xs">{component.gradeLevel}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {component.complexity === "elementary" ? (
                          <span className="text-sm">👍</span>
                        ) : (
                          <div
                            className={`h-2 w-2 rounded-full ${
                              component.complexity === "middle-school"
                                ? "bg-blue-500"
                                : component.complexity === "high-school"
                                  ? "bg-yellow-500"
                                  : component.complexity === "college"
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                            }`}
                          />
                        )}
                        <span className="text-foreground text-xs font-medium capitalize">
                          {component.complexity.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {scriptAnalysis.componentAnalysis?.mostComplex && (
                  <div className="border-border-subtle mt-4 border-t pt-3">
                    <span className="text-muted-foreground text-xs">
                      Most Complex:{" "}
                      <strong>{scriptAnalysis.componentAnalysis.mostComplex.component.replace("-", " ")}</strong> (
                      {scriptAnalysis.componentAnalysis.mostComplex.gradeLevel})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Metrics Tab */}
        {sidebarTab === "metrics" && (
          <div className="space-y-4">
            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <div className="mb-3 flex items-center space-x-3">
                <TrendingUp className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-medium">Performance</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Engagement Score</span>
                    <span className="text-foreground text-sm font-medium">78%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: "78%" }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Clarity</span>
                    <span className="text-foreground text-sm font-medium">92%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Impact</span>
                    <span className="text-foreground text-sm font-medium">65%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="h-2 rounded-full bg-yellow-500" style={{ width: "65%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <div className="mb-3 flex items-center space-x-3">
                <Clock className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-medium">Script Timing</h3>
              </div>
              <div className="text-center">
                <div className="text-foreground text-2xl font-bold">{Math.round(wordCount / 3.5)} sec</div>
                <div className="text-muted-foreground text-sm">Estimated video length</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {sidebarTab === "suggestions" && (
          <div className="space-y-4">
            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <div className="mb-3 flex items-center space-x-3">
                <Settings className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-medium">Improvements</h3>
              </div>
              <div className="space-y-3">
                {/* General Recommendations */}
                {scriptAnalysis.componentAnalysis?.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="bg-accent/10 border-accent/20 flex items-start space-x-3 rounded-[var(--radius-button)] border p-3"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <div>
                      <div className="text-foreground text-sm font-medium">Script Recommendation</div>
                      <div className="text-muted-foreground text-sm">{recommendation}</div>
                    </div>
                  </div>
                ))}

                {/* Component-Specific Suggestions */}
                {scriptAnalysis.componentAnalysis?.components
                  .filter((c) => c.suggestions.length > 0)
                  .map((component, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-foreground mt-4 mb-2 text-sm font-medium capitalize">
                        {component.component.replace("-", " ")} Suggestions
                      </div>
                      {component.suggestions.slice(0, 2).map((suggestion, suggestionIndex) => (
                        <div
                          key={suggestionIndex}
                          className="flex items-start space-x-3 rounded-[var(--radius-button)] p-3"
                          style={{
                            backgroundColor:
                              component.complexity === "elementary"
                                ? "hsl(var(--muted)/0.5)"
                                : component.complexity === "middle-school"
                                  ? "hsl(var(--accent)/0.1)"
                                  : component.complexity === "high-school"
                                    ? "rgba(245, 158, 11, 0.1)"
                                    : component.complexity === "college"
                                      ? "rgba(249, 115, 22, 0.1)"
                                      : "rgba(239, 68, 68, 0.1)",
                          }}
                        >
                          {component.complexity === "elementary" ? (
                            <span className="text-sm">👍</span>
                          ) : (
                            <AlertCircle
                              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                                component.complexity === "middle-school"
                                  ? "text-blue-600"
                                  : component.complexity === "high-school"
                                    ? "text-yellow-600"
                                    : component.complexity === "college"
                                      ? "text-orange-600"
                                      : "text-red-600"
                              }`}
                            />
                          )}
                          <div>
                            <div className="text-foreground text-sm font-medium">
                              {component.component.replace("-", " ")} - {component.gradeLevel}
                            </div>
                            <div className="text-muted-foreground text-sm">{suggestion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                {!scriptAnalysis.hasComponentAnalysis && (
                  <>
                    <div className="bg-destructive/10 border-destructive/20 flex items-start space-x-3 rounded-[var(--radius-button)] border p-3">
                      <AlertCircle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-foreground text-sm font-medium">Strengthen CTA</div>
                        <div className="text-muted-foreground text-sm">
                          Make the call-to-action more specific and compelling
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/10 border-accent/20 flex items-start space-x-3 rounded-[var(--radius-button)] border p-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <div>
                        <div className="text-foreground text-sm font-medium">Add Statistics</div>
                        <div className="text-muted-foreground text-sm">
                          Include specific data about research timeline improvements
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-[var(--radius-button)] border border-purple-200 bg-purple-50 p-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                      <div>
                        <div className="text-foreground text-sm font-medium">Visual Elements</div>
                        <div className="text-muted-foreground text-sm">
                          Consider adding graphics to illustrate the AI research process
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-elevated border-border rounded-[var(--radius-button)] border p-4">
              <h3 className="text-foreground mb-3 font-medium">Quick Actions</h3>
              <div className="space-y-2">
                <button className="text-muted-foreground hover:bg-background-hover hover:text-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors">
                  Generate hook variations
                </button>
                <button className="text-muted-foreground hover:bg-background-hover hover:text-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors">
                  Optimize script length
                </button>
                <button className="text-muted-foreground hover:bg-background-hover hover:text-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors">
                  Check pronunciation
                </button>
                <button className="text-muted-foreground hover:bg-background-hover hover:text-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors">
                  Export for video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
