"use client";

import React, { useState } from "react";
import { Copy, Wand2, ChevronDown, ChevronRight, Hash, FileText, Tag, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PersonaDetailsContentProps {
  persona: PersonaDetails | null;
  activeTab: string;
}

// Notion-style collapsible section component
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon?: React.ComponentType<any>; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 -ml-2 rounded-[var(--radius-button)] hover:bg-neutral-100 transition-colors group"
      >
        <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        {Icon && <Icon className="w-4 h-4 text-neutral-500" />}
        <span className="text-sm font-semibold text-neutral-900">{title}</span>
      </button>
      {isOpen && (
        <div className="ml-6 mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

// Notion-style property row component
function PropertyRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start py-2 group">
      <span className="text-sm text-neutral-500 min-w-[140px]">{label}</span>
      <span className="text-sm text-neutral-900 font-medium">{value}</span>
    </div>
  );
}

// Notion-style bullet list component
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start group">
          <span className="text-neutral-400 mr-2 mt-1 text-xs">•</span>
          <span className="text-sm text-neutral-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PersonaDetailsContent({ persona, activeTab }: PersonaDetailsContentProps) {
  if (!persona) return null;

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Overview Tab
  if (activeTab === "overview") {
    return (
      <div className="px-2">
        {/* Description Section */}
        {persona.description && (
          <CollapsibleSection title="Description" icon={FileText} defaultOpen={true}>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {persona.description}
            </p>
          </CollapsibleSection>
        )}

        {/* Properties Section */}
        <CollapsibleSection title="Properties" icon={Hash} defaultOpen={true}>
          <div className="space-y-1">
            <PropertyRow label="Platform" value={persona.platform || "TikTok"} />
            <PropertyRow label="Voice Style" value={persona.voiceStyle || "Not analyzed"} />
            <PropertyRow label="Distinctiveness" value={persona.distinctiveness || "Not analyzed"} />
            <PropertyRow label="Complexity" value={persona.complexity || "Not analyzed"} />
          </div>
        </CollapsibleSection>

        {/* Tags Section */}
        {persona.tags && persona.tags.length > 0 && (
          <CollapsibleSection title="Tags" icon={Tag} defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {persona.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-button)] bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Stats Section */}
        <CollapsibleSection title="Statistics" icon={Activity} defaultOpen={false}>
          <div className="space-y-1">
            <PropertyRow 
              label="Total Uses" 
              value={persona.usageCount ? `${persona.usageCount} times` : "Never used"} 
            />
            <PropertyRow 
              label="Created" 
              value={persona.createdAt ? new Date(persona.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : "Unknown"} 
            />
            <PropertyRow 
              label="Last Used" 
              value={persona.lastUsedAt ? new Date(persona.lastUsedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : "Never"} 
            />
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  // Voice Profile Tab
  if (activeTab === "voice") {
    if (!persona.analysis?.voiceProfile) {
      return (
        <div className="px-2 py-8 text-center">
          <p className="text-sm text-neutral-500">No voice profile data available</p>
        </div>
      );
    }

    return (
      <div className="px-2">
        <CollapsibleSection title="Voice Characteristics" icon={Activity} defaultOpen={true}>
          <div className="space-y-1">
            <PropertyRow 
              label="Primary Style" 
              value={persona.analysis.voiceProfile.primaryStyle} 
            />
            <PropertyRow 
              label="Distinctiveness" 
              value={persona.analysis.voiceProfile.distinctiveness} 
            />
            <PropertyRow 
              label="Complexity" 
              value={persona.analysis.voiceProfile.complexity} 
            />
          </div>
        </CollapsibleSection>

        {persona.analysis.voiceProfile.keyCharacteristics && (
          <CollapsibleSection title="Key Characteristics" icon={FileText} defaultOpen={true}>
            <BulletList items={persona.analysis.voiceProfile.keyCharacteristics} />
          </CollapsibleSection>
        )}
      </div>
    );
  }

  // Hooks Tab
  if (activeTab === "hooks") {
    if (!persona.analysis?.hookReplicationSystem && !persona.analysis?.allHooksExtracted) {
      return <div className="text-neutral-500">No hooks data available</div>;
    }

    return (
      <div className="space-y-4">
        {/* All Extracted Hooks */}
        {persona.analysis.allHooksExtracted && persona.analysis.allHooksExtracted.length > 0 && (
          <div className="rounded-[var(--radius-card)] border-2 border-brand-200 bg-brand-50 p-4">
            <h3 className="mb-3 font-medium text-neutral-900">
              📌 All Extracted Hooks ({persona.analysis.allHooksExtracted.length} Total)
            </h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {persona.analysis.allHooksExtracted.map((hook: any, i: number) => (
                <div key={i} className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-brand-700 text-xs font-bold">Script #{hook.scriptNumber}</span>
                    <span className="bg-primary-100 text-primary-700 rounded-[var(--radius-button)] px-2 py-1 text-xs">
                      {hook.type} • {hook.trigger}
                    </span>
                  </div>
                  <div className="mb-2 text-sm font-medium text-neutral-900">"{hook.originalHook}"</div>
                  <div className="text-primary-700 rounded-[var(--radius-button)] bg-neutral-100 p-2 font-mono text-xs">
                    Template: {hook.universalTemplate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hook Replication System */}
        {persona.analysis.hookReplicationSystem && (
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
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
                  <h4 className="text-sm font-medium text-neutral-700">Hook Templates</h4>
                  {persona.analysis.hookReplicationSystem.hookTemplates.map((template: any, index: number) => (
                    <div key={index} className="space-y-2 rounded-[var(--radius-card)] bg-neutral-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-900 uppercase">{template.type}</span>
                        <span className="text-xs text-neutral-600">
                          {template.effectiveness} • {template.frequency}%
                        </span>
                      </div>
                      <p className="font-mono text-sm text-neutral-700">{template.template}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Patterns Tab
  if (activeTab === "patterns") {
    if (!persona.analysis?.linguisticFingerprint) {
      return (
        <div className="px-2 py-8 text-center">
          <p className="text-sm text-neutral-500">No patterns data available</p>
        </div>
      );
    }

    return (
      <div className="px-2">
        <CollapsibleSection title="Linguistic Patterns" icon={FileText} defaultOpen={true}>
          <div className="space-y-1">
            <PropertyRow 
              label="Avg Sentence Length" 
              value={`${persona.analysis.linguisticFingerprint.avgSentenceLength} words`} 
            />
          </div>
        </CollapsibleSection>

        {persona.analysis.linguisticFingerprint.vocabularyTier && (
          <CollapsibleSection title="Vocabulary Distribution" icon={Activity} defaultOpen={true}>
            <div className="space-y-1">
              <PropertyRow 
                label="Simple Words" 
                value={`${persona.analysis.linguisticFingerprint.vocabularyTier.simple}%`} 
              />
              <PropertyRow 
                label="Moderate Words" 
                value={`${persona.analysis.linguisticFingerprint.vocabularyTier.moderate}%`} 
              />
              <PropertyRow 
                label="Advanced Words" 
                value={`${persona.analysis.linguisticFingerprint.vocabularyTier.advanced}%`} 
              />
            </div>
          </CollapsibleSection>
        )}

        {persona.analysis.linguisticFingerprint.topUniqueWords && (
          <CollapsibleSection title="Signature Words" icon={Tag} defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {persona.analysis.linguisticFingerprint.topUniqueWords.map((word: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-button)] bg-primary-100 hover:bg-primary-200 text-xs font-medium text-primary-700 transition-colors cursor-default"
                >
                  {word}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {persona.analysis.transitionPhrases?.conceptBridges && (
          <CollapsibleSection title="Transition Phrases" icon={FileText} defaultOpen={false}>
            <BulletList items={persona.analysis.transitionPhrases.conceptBridges.slice(0, 5)} />
          </CollapsibleSection>
        )}
      </div>
    );
  }

  // Rules Tab
  if (activeTab === "rules") {
    if (!persona.analysis?.scriptGenerationRules) {
      return (
        <div className="px-2 py-8 text-center">
          <p className="text-sm text-neutral-500">No script rules available</p>
        </div>
      );
    }

    return (
      <div className="px-2">
        <CollapsibleSection title="📝 Script Generation Formula" defaultOpen={true}>
          <div className="space-y-4">
            {/* Must Include / Never Include */}
            <div className="grid grid-cols-2 gap-6">
              {persona.analysis.scriptGenerationRules.mustInclude && (
                <div>
                  <h4 className="text-success-700 mb-3 text-sm font-semibold flex items-center gap-2">
                    <span className="text-success-600">✓</span> Must Include
                  </h4>
                  <BulletList items={persona.analysis.scriptGenerationRules.mustInclude} />
                </div>
              )}

              {persona.analysis.scriptGenerationRules.neverInclude && (
                <div>
                  <h4 className="text-destructive-700 mb-3 text-sm font-semibold flex items-center gap-2">
                    <span className="text-destructive-600">×</span> Never Include
                  </h4>
                  <BulletList items={persona.analysis.scriptGenerationRules.neverInclude} />
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Formula */}
        {(persona.analysis.scriptGenerationRules.universalFormula ||
          persona.analysis.scriptGenerationRules.formulaForNewScript) && (
          <CollapsibleSection title="Step-by-Step Formula" icon={FileText} defaultOpen={false}>
            <div className="rounded-[var(--radius-card)] bg-neutral-50 border border-neutral-200 p-4 font-mono text-xs whitespace-pre-wrap text-neutral-700 leading-relaxed">
              {persona.analysis.scriptGenerationRules.universalFormula ||
                persona.analysis.scriptGenerationRules.formulaForNewScript}
            </div>
          </CollapsibleSection>
        )}
      </div>
    );
  }

  // Usage Tab
  if (activeTab === "usage") {
    return (
      <div className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
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

        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
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
              onClick={() => handleCopy(JSON.stringify(persona.analysis, null, 2))}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Full Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-neutral-500">Select a tab to view content</div>;
}