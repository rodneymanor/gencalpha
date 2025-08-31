"use client";

import React, { useState } from "react";

import { Copy, Download, User, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { IconSlideoutHeader } from "@/components/ui/slideout-header";

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
    {
      key: "hooks" as TabType,
      label: "Hooks",
      enabled: !!(persona.analysis?.hookReplicationSystem || persona.analysis?.allHooksExtracted),
    },
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
  const enabledTabs = tabs.filter((t) => t.enabled);

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
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `persona-${persona.name.toLowerCase().replace(/\s+/g, "-")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    onDownload?.();
  };

  return (
    <div className={cn("flex h-full flex-col bg-neutral-50", className)}>
      {/* Standardized Header - 52px height */}
      <IconSlideoutHeader
        icon={
          <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
            <User className="text-primary-600 h-4 w-4" />
          </div>
        }
        title={persona.name}
        subtitle={persona.username ? `@${persona.username}` : undefined}
        onClose={onClose || (() => {})}
        rightActions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(JSON.stringify(persona.analysis, null, 2), "analysis")}
              disabled={copying}
              className="h-9 px-2 text-xs text-neutral-600 hover:text-neutral-900"
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              {copying ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-9 px-2 text-xs text-neutral-600 hover:text-neutral-900"
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-6 border-b border-neutral-200 bg-transparent p-0">
          {enabledTabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-neutral-600"
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
                <h3 className="mb-2 text-sm font-medium text-neutral-700">Description</h3>
                <p className="whitespace-pre-wrap text-neutral-900">
                  {persona.description || "No description available"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral-700">Platform</h3>
                  <p className="text-neutral-900">{persona.platform || "TikTok"}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral-700">Voice Style</h3>
                  <p className="text-neutral-900">{persona.voiceStyle || "Not analyzed"}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral-700">Distinctiveness</h3>
                  <p className="text-neutral-900">{persona.distinctiveness || "Not analyzed"}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral-700">Complexity</h3>
                  <p className="text-neutral-900">{persona.complexity || "Not analyzed"}</p>
                </div>
              </div>

              {persona.tags && persona.tags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-neutral-700">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.tags.map((tag, index) => (
                      <span key={index} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
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
                  <h3 className="mb-3 font-medium text-neutral-900">Voice Characteristics</h3>
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
                    <h3 className="mb-3 font-medium text-neutral-900">Key Characteristics</h3>
                    <ul className="space-y-2">
                      {persona.analysis.voiceProfile.keyCharacteristics.map((char: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-neutral-700">
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
            {(persona.analysis?.hookReplicationSystem || persona.analysis?.allHooksExtracted) && (
              <div className="space-y-4">
                {/* All Extracted Hooks */}
                {persona.analysis.allHooksExtracted && persona.analysis.allHooksExtracted.length > 0 && (
                  <div className="border-brand-200 bg-brand-50 rounded-lg border p-4">
                    <h3 className="mb-3 font-medium text-neutral-900">
                      📌 All Extracted Hooks ({persona.analysis.allHooksExtracted.length} Total)
                    </h3>
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {persona.analysis.allHooksExtracted.map((hook: any, i: number) => (
                        <div key={i} className="rounded border border-neutral-200 bg-white p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-brand-700 text-xs font-bold">Script #{hook.scriptNumber}</span>
                            <span className="bg-primary-100 text-primary-700 rounded px-2 py-1 text-xs">
                              {hook.type} • {hook.trigger}
                            </span>
                          </div>
                          <div className="mb-2 text-sm font-medium text-neutral-900">"{hook.originalHook}"</div>
                          <div className="text-primary-700 rounded bg-neutral-100 p-2 font-mono text-xs">
                            Template: {hook.universalTemplate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hook Replication System */}
                {persona.analysis.hookReplicationSystem && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <h3 className="mb-3 font-medium text-neutral-900">🎯 Hook Replication System</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-neutral-600">Primary Hook Type: </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {persona.analysis.hookReplicationSystem.primaryHookType}
                        </span>
                      </div>

                      {persona.analysis.hookReplicationSystem.hookTemplates && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-medium text-neutral-700">Hook Templates (Copy & Reuse)</h4>
                          {persona.analysis.hookReplicationSystem.hookTemplates.map((template: any, index: number) => (
                            <div key={index} className="space-y-2 rounded-lg bg-neutral-50 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-900 uppercase">{template.type}</span>
                                <span className="text-xs text-neutral-600">
                                  {template.effectiveness} effectiveness • {template.frequency}% usage
                                </span>
                              </div>
                              <p className="font-mono text-sm text-neutral-700">{template.template}</p>
                              {template.realExamples && template.realExamples.length > 0 && (
                                <div className="mt-2">
                                  <p className="mb-1 text-xs text-neutral-600">Real Examples:</p>
                                  <ul className="space-y-1">
                                    {template.realExamples.slice(0, 2).map((example: string, idx: number) => (
                                      <li key={idx} className="text-xs text-neutral-700 italic">
                                        "{example}"
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {template.newExamples && template.newExamples.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-success-600 mb-1 text-xs">New Topic Examples:</p>
                                  <ul className="space-y-1">
                                    {template.newExamples.slice(0, 1).map((example: string, idx: number) => (
                                      <li key={idx} className="text-success-700 text-xs italic">
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

                      {persona.analysis.hookReplicationSystem.hookRules && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-neutral-700">Hook Rules</h4>
                          <ul className="space-y-1">
                            {persona.analysis.hookReplicationSystem.hookRules.map((rule: string, i: number) => (
                              <li key={i} className="text-sm text-neutral-700">
                                • {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="mt-0 space-y-6">
            {persona.analysis?.linguisticFingerprint && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="mb-3 font-medium text-neutral-900">Linguistic Patterns</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Avg Sentence Length: </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {persona.analysis.linguisticFingerprint.avgSentenceLength} words
                      </span>
                    </div>

                    {persona.analysis.linguisticFingerprint.vocabularyTier && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">Vocabulary Distribution</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Simple:</span>
                            <span className="font-medium">
                              {persona.analysis.linguisticFingerprint.vocabularyTier.simple}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Moderate:</span>
                            <span className="font-medium">
                              {persona.analysis.linguisticFingerprint.vocabularyTier.moderate}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Advanced:</span>
                            <span className="font-medium">
                              {persona.analysis.linguisticFingerprint.vocabularyTier.advanced}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {persona.analysis.linguisticFingerprint.topUniqueWords && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">Signature Words</h4>
                        <div className="flex flex-wrap gap-2">
                          {persona.analysis.linguisticFingerprint.topUniqueWords.map((word: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs"
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
                    <h3 className="mb-3 font-medium text-neutral-900">Transition Phrases</h3>
                    <div className="space-y-3">
                      {persona.analysis.transitionPhrases.conceptBridges && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-neutral-700">Concept Bridges</h4>
                          <div className="flex flex-wrap gap-2">
                            {persona.analysis.transitionPhrases.conceptBridges
                              .slice(0, 5)
                              .map((phrase: string, index: number) => (
                                <span key={index} className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
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
                  <h3 className="mb-3 font-medium text-neutral-900">📝 Script Generation Formula</h3>
                  <div className="space-y-4">
                    {/* Must Include / Never Include */}
                    <div className="grid grid-cols-2 gap-4">
                      {persona.analysis.scriptGenerationRules.mustInclude && (
                        <div>
                          <h4 className="text-success-700 mb-2 text-sm font-medium">✅ Must Include</h4>
                          <ul className="space-y-1">
                            {persona.analysis.scriptGenerationRules.mustInclude.map((rule: string, index: number) => (
                              <li key={index} className="flex items-start text-sm text-neutral-700">
                                <span className="mr-2">•</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {persona.analysis.scriptGenerationRules.neverInclude && (
                        <div>
                          <h4 className="text-destructive-700 mb-2 text-sm font-medium">❌ Never Include</h4>
                          <ul className="space-y-1">
                            {persona.analysis.scriptGenerationRules.neverInclude.map((rule: string, index: number) => (
                              <li key={index} className="flex items-start text-sm text-neutral-700">
                                <span className="mr-2">•</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Optimal Structure */}
                    {persona.analysis.scriptGenerationRules.optimalStructure && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">Optimal Structure</h4>
                        <div className="space-y-2 rounded bg-neutral-50 p-3">
                          <div className="flex">
                            <span className="text-primary-600 min-w-[80px] text-sm font-medium">Hook:</span>
                            <span className="text-sm text-neutral-700">
                              {persona.analysis.scriptGenerationRules.optimalStructure.hookSection}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-primary-600 min-w-[80px] text-sm font-medium">Body:</span>
                            <span className="text-sm text-neutral-700">
                              {persona.analysis.scriptGenerationRules.optimalStructure.bodySection}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-primary-600 min-w-[80px] text-sm font-medium">Close:</span>
                            <span className="text-sm text-neutral-700">
                              {persona.analysis.scriptGenerationRules.optimalStructure.closeSection}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formula */}
                    {(persona.analysis.scriptGenerationRules.universalFormula ||
                      persona.analysis.scriptGenerationRules.formulaForNewScript) && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">Step-by-Step Formula</h4>
                        <div className="rounded bg-neutral-50 p-3 font-mono text-sm whitespace-pre-wrap text-neutral-700">
                          {persona.analysis.scriptGenerationRules.universalFormula ||
                            persona.analysis.scriptGenerationRules.formulaForNewScript}
                        </div>
                      </div>
                    )}

                    {/* Detailed Script Formula (14 steps) */}
                    {persona.analysis.scriptGenerationRules.detailedScriptFormula && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">
                          🎬 Detailed Script Formula (
                          {Object.keys(persona.analysis.scriptGenerationRules.detailedScriptFormula).length} Steps)
                        </h4>
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded border border-neutral-200 bg-white p-3">
                          {Object.entries(persona.analysis.scriptGenerationRules.detailedScriptFormula).map(
                            ([step, instruction]) => (
                              <div key={step} className="border-primary-400 border-l-4 py-1 pl-3">
                                <div className="text-primary-700 text-xs font-bold uppercase">{step}</div>
                                <div className="text-sm text-neutral-800">{instruction as string}</div>
                              </div>
                            ),
                          )}
                        </div>
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
                <h3 className="mb-3 font-medium text-neutral-900">Usage Statistics</h3>
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
                    <span
                      className={cn(
                        "text-sm font-medium",
                        persona.status === "active" ? "text-success-600" : "text-neutral-600",
                      )}
                    >
                      {persona.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = `/write?assistant=persona&personaId=${persona.id}`)}
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
