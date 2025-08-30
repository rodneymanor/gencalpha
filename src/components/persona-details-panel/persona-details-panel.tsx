"use client";

import React, { useState } from "react";

import { Copy, Download, X, User, FileText, Brain, Wand2, Settings, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface PersonaDetails {
  id: string;
  name: string;
  description?: string;
  platform?: string;
  username?: string;
  analysis: any;
  tags?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  lastUsedAt?: string;
  voiceStyle?: string;
  distinctiveness?: string;
  complexity?: string;
  hasHookSystem?: boolean;
  hasScriptRules?: boolean;
  signatureMoveCount?: number;
}

interface PersonaDetailsPanelProps {
  persona: PersonaDetails | null;
  isLoading?: boolean;
  onClose?: () => void;
  onCopy?: (content: string, type?: string) => void;
  onDownload?: () => void;
  className?: string;
}

type TabType = "overview" | "voice" | "hooks" | "patterns" | "rules" | "usage";

// Tab configuration
const getTabConfiguration = (persona: PersonaDetails | null) => {
  if (!persona) return [];
  
  return [
    { key: "overview" as TabType, label: "Overview", enabled: true },
    { key: "voice" as TabType, label: "Voice Profile", enabled: !!persona.analysis?.voiceProfile },
    { key: "hooks" as TabType, label: "Hooks", enabled: !!persona.analysis?.hookReplicationSystem },
    { key: "patterns" as TabType, label: "Patterns", enabled: !!persona.analysis?.linguisticFingerprint },
    { key: "rules" as TabType, label: "Script Rules", enabled: !!persona.analysis?.scriptGenerationRules },
    { key: "usage" as TabType, label: "Usage", enabled: true },
  ];
};

export function PersonaDetailsPanel({
  persona,
  isLoading = false,
  onClose,
  onCopy,
  onDownload,
  className,
}: PersonaDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [copying, setCopying] = useState(false);

  if (!persona) return null;

  const tabs = getTabConfiguration(persona);
  const enabledTabs = tabs.filter(t => t.enabled);

  const handleCopy = async (content: string, type?: string) => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.(content, type);
    } catch (error) {
      console.error("Failed to copy:", error);
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(persona, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `persona-${persona.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    onDownload?.();
  };

  return (
    <div className={cn("flex h-full flex-col bg-neutral-50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{persona.name}</h2>
            {persona.username && (
              <p className="text-sm text-neutral-600">@{persona.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(JSON.stringify(persona.analysis, null, 2), "analysis")}
            disabled={copying}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <Copy className="h-4 w-4" />
            {copying ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-6 border-b border-neutral-200 bg-transparent p-0">
          {enabledTabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-neutral-600 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Description</h3>
                <p className="text-neutral-900 whitespace-pre-wrap">
                  {persona.description || "No description available"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Platform</h3>
                  <p className="text-neutral-900">{persona.platform || "TikTok"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Voice Style</h3>
                  <p className="text-neutral-900">{persona.voiceStyle || "Not analyzed"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Distinctiveness</h3>
                  <p className="text-neutral-900">{persona.distinctiveness || "Not analyzed"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Complexity</h3>
                  <p className="text-neutral-900">{persona.complexity || "Not analyzed"}</p>
                </div>
              </div>

              {persona.tags && persona.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Voice Profile Tab */}
          <TabsContent value="voice" className="mt-0 space-y-6">
            {persona.analysis?.voiceProfile && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Voice Characteristics</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-neutral-600">Primary Style: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.voiceProfile.primaryStyle}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Distinctiveness: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.voiceProfile.distinctiveness}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Complexity: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.voiceProfile.complexity}
                      </span>
                    </div>
                  </div>
                </div>

                {persona.analysis.voiceProfile.keyCharacteristics && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <h3 className="font-medium text-neutral-900 mb-3">Key Characteristics</h3>
                    <ul className="space-y-2">
                      {persona.analysis.voiceProfile.keyCharacteristics.map((char: string, index: number) => (
                        <li key={index} className="text-sm text-neutral-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Hooks Tab */}
          <TabsContent value="hooks" className="mt-0 space-y-6">
            {persona.analysis?.hookReplicationSystem && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Hook System</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Primary Hook Type: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.hookReplicationSystem.primaryHookType}
                      </span>
                    </div>
                    
                    {persona.analysis.hookReplicationSystem.hookTemplates && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-sm font-medium text-neutral-700">Hook Templates</h4>
                        {persona.analysis.hookReplicationSystem.hookTemplates.map((template: any, index: number) => (
                          <div key={index} className="rounded-lg bg-neutral-50 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-neutral-900">{template.type}</span>
                              <span className="text-xs text-neutral-600">
                                Frequency: {template.frequency}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-700">{template.template}</p>
                            {template.realExamples && template.realExamples.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-neutral-600 mb-1">Examples:</p>
                                <ul className="space-y-1">
                                  {template.realExamples.slice(0, 2).map((example: string, idx: number) => (
                                    <li key={idx} className="text-xs text-neutral-700 italic">
                                      "{example}"
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="mt-0 space-y-6">
            {persona.analysis?.linguisticFingerprint && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Linguistic Patterns</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Avg Sentence Length: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.linguisticFingerprint.avgSentenceLength} words
                      </span>
                    </div>
                    
                    {persona.analysis.linguisticFingerprint.vocabularyTier && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Vocabulary Distribution</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Simple:</span>
                            <span className="font-medium">{persona.analysis.linguisticFingerprint.vocabularyTier.simple}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Moderate:</span>
                            <span className="font-medium">{persona.analysis.linguisticFingerprint.vocabularyTier.moderate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Advanced:</span>
                            <span className="font-medium">{persona.analysis.linguisticFingerprint.vocabularyTier.advanced}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {persona.analysis.linguisticFingerprint.topUniqueWords && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Signature Words</h4>
                        <div className="flex flex-wrap gap-2">
                          {persona.analysis.linguisticFingerprint.topUniqueWords.map((word: string, index: number) => (
                            <span
                              key={index}
                              className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {persona.analysis.transitionPhrases && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <h3 className="font-medium text-neutral-900 mb-3">Transition Phrases</h3>
                    <div className="space-y-3">
                      {persona.analysis.transitionPhrases.conceptBridges && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-700 mb-2">Concept Bridges</h4>
                          <div className="flex flex-wrap gap-2">
                            {persona.analysis.transitionPhrases.conceptBridges.slice(0, 5).map((phrase: string, index: number) => (
                              <span
                                key={index}
                                className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
                              >
                                {phrase}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Script Rules Tab */}
          <TabsContent value="rules" className="mt-0 space-y-6">
            {persona.analysis?.scriptGenerationRules && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Generation Rules</h3>
                  <div className="space-y-3">
                    {persona.analysis.scriptGenerationRules.structureRules && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Structure Rules</h4>
                        <ul className="space-y-1">
                          {persona.analysis.scriptGenerationRules.structureRules.map((rule: string, index: number) => (
                            <li key={index} className="text-sm text-neutral-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {persona.analysis.scriptGenerationRules.contentRules && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Content Rules</h4>
                        <ul className="space-y-1">
                          {persona.analysis.scriptGenerationRules.contentRules.map((rule: string, index: number) => (
                            <li key={index} className="text-sm text-neutral-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {persona.analysis.scriptGenerationRules.styleRules && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Style Rules</h4>
                        <ul className="space-y-1">
                          {persona.analysis.scriptGenerationRules.styleRules.map((rule: string, index: number) => (
                            <li key={index} className="text-sm text-neutral-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="mt-0 space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <h3 className="font-medium text-neutral-900 mb-3">Usage Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Total Uses:</span>
                    <span className="text-sm font-medium text-neutral-900">{persona.usageCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Created:</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {persona.createdAt ? new Date(persona.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Last Used:</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {persona.lastUsedAt ? new Date(persona.lastUsedAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      persona.status === "active" ? "text-success-600" : "text-neutral-600"
                    )}>
                      {persona.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <h3 className="font-medium text-neutral-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.location.href = `/write?assistant=persona&personaId=${persona.id}`}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Script with Persona
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCopy(JSON.stringify(persona.analysis, null, 2), "full-analysis")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Full Analysis
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}