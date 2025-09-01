// Persona details panel component

"use client";

import React from "react";

import { type TabData, type CustomTabLabels } from "@/components/panels/notion/NotionPanel";
import NotionPanelWrapper from "@/components/panels/notion/NotionPanelWrapper";
import { PersonaDetailsContent, type PersonaDetails } from "@/components/persona-details-panel/persona-details-content";

interface PersonaDetailsPanelProps {
  persona: PersonaDetails | null;
  onClose: () => void;
}

// Helper function to prepare tab data for NotionPanel
const getTabData = (persona: PersonaDetails | null): TabData => {
  if (!persona) return {};

  const tabs: TabData = {};

  // Overview tab - always available
  tabs.video = <PersonaDetailsContent persona={persona} activeTab="overview" />;

  // Voice Profile tab
  if (persona.analysis?.voiceProfile) {
    tabs.transcript = <PersonaDetailsContent persona={persona} activeTab="voice" />;
  }

  // Hooks tab
  if (persona.analysis?.hookReplicationSystem || persona.analysis?.allHooksExtracted) {
    tabs.components = <PersonaDetailsContent persona={persona} activeTab="hooks" />;
  }

  // Patterns tab
  if (persona.analysis?.linguisticFingerprint) {
    tabs.metadata = <PersonaDetailsContent persona={persona} activeTab="patterns" />;
  }

  // Script Rules tab
  if (persona.analysis?.scriptGenerationRules) {
    tabs.suggestions = <PersonaDetailsContent persona={persona} activeTab="rules" />;
  }

  // Usage tab - always available
  tabs.analysis = <PersonaDetailsContent persona={persona} activeTab="usage" />;

  return tabs;
};

export function PersonaDetailsPanel({ persona, onClose }: PersonaDetailsPanelProps) {
  if (!persona) return null;

  return (
    <NotionPanelWrapper
      isOpen={!!persona}
      onClose={onClose}
      title={persona.name}
      showPageControls={false}
      showHeaderControls={true}
      width={600}
      isNewIdea={false}
      onCopy={() => {
        const dataStr = JSON.stringify(persona.analysis, null, 2);
        navigator.clipboard.writeText(dataStr);
        console.log("Copied persona analysis");
      }}
      onDownload={() => {
        const dataStr = JSON.stringify(persona, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `persona-${persona.name.toLowerCase().replace(/\s+/g, "-")}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
        console.log("Downloaded persona data");
      }}
      tabData={getTabData(persona)}
      defaultTab={"video"}
      customTabLabels={
        {
          video: "Overview",
          transcript: "Voice",
          components: "Hooks",
          metadata: "Patterns",
          suggestions: "Rules",
          analysis: "Usage",
        } as CustomTabLabels
      }
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Inspired by</span>
            <span className="text-sm font-medium text-neutral-900">@{persona.username ?? "Unknown Creator"}</span>
          </div>
          <div className="text-xs text-neutral-500">
            {persona.platform ?? "TikTok"} • {persona.usageCount ?? 0} uses
          </div>
        </div>
      }
    >
      {/* Content is handled by tabData */}
    </NotionPanelWrapper>
  );
}
