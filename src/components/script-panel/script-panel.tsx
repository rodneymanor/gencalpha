"use client";

import React, { useState } from "react";

import { X, Download, FileText, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScriptCopy } from "@/hooks/use-script-copy";
import { useScriptDownload } from "@/hooks/use-script-download";
import { cn } from "@/lib/utils";
import {
  ScriptPanelProps,
  ScriptTabConfig,
  SCRIPT_COMPONENT_ICONS,
  SCRIPT_COMPONENT_LABELS,
} from "@/types/script-panel";

/**
 * ScriptPanel - A comprehensive script display component with tabs,
 * copy functionality, and metrics display following Clarity Design System
 */
// Helper function to get tab configuration
function getTabConfiguration(componentsLength: number): ScriptTabConfig[] {
  return [
    { key: "full", label: "Full Script", enabled: true },
    { key: "components", label: "Components", enabled: componentsLength > 0 },
  ];
}

export function ScriptPanel({
  scriptData,
  isLoading = false,
  onCopy,
  onDownload,
  onClose,
  className,
  showDownload = true,
  showMetrics = true,
  customActions,
}: ScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<"full" | "components">("full");
  const { copyText, copyStatus } = useScriptCopy();
  const { downloadScript, isDownloading } = useScriptDownload();

  const tabs = getTabConfiguration(scriptData.components.length);

  const handleCopy = async (content: string, componentType?: string) => {
    const success = await copyText(content);
    if (success && onCopy) {
      onCopy(content, componentType);
    }
  };

  const handleDownload = () => {
    downloadScript(scriptData);
    if (onDownload) {
      onDownload(scriptData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Loading script...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <ScriptPanelHeader
        scriptData={scriptData}
        copyStatus={copyStatus}
        isDownloading={isDownloading}
        showDownload={showDownload}
        customActions={customActions}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <ScriptPanelTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <ScriptPanelContent
        activeTab={activeTab}
        scriptData={scriptData}
        showMetrics={showMetrics}
        onCopy={handleCopy}
        copyStatus={copyStatus}
      />
    </div>
  );
}

/**
 * Script Panel Header Component
 */
interface ScriptPanelHeaderProps {
  scriptData: ScriptData;
  copyStatus: string;
  isDownloading: boolean;
  showDownload: boolean;
  customActions?: React.ReactNode;
  onCopy: (content: string) => void;
  onDownload: () => void;
  onClose?: () => void;
}

function ScriptPanelHeader({
  scriptData,
  copyStatus,
  isDownloading,
  showDownload,
  customActions,
  onCopy,
  onDownload,
  onClose,
}: ScriptPanelHeaderProps) {
  return (
    <div className="border-border flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-accent/10 text-foreground px-3 py-1.5 text-sm font-medium">
          Script
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Dual Action Button - Copy & Download */}
        <div className="border-border bg-background flex overflow-hidden rounded-[var(--radius-button)] border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(scriptData.fullScript)}
            disabled={copyStatus === "copying"}
            className={cn(
              "border-border h-8 rounded-none border-r px-3 text-xs font-medium transition-colors duration-200",
              copyStatus === "success" && "bg-green-50 text-green-600 dark:bg-green-950/20",
            )}
          >
            {copyStatus === "copying" ? "Copying..." : copyStatus === "success" ? "Copied" : "Copy"}
          </Button>

          {showDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              disabled={isDownloading}
              className="h-8 rounded-none px-2"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Custom Actions */}
        {customActions}

        {/* Close Button */}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-accent/10 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Script Panel Tabs Component
 */
interface ScriptPanelTabsProps {
  tabs: ScriptTabConfig[];
  activeTab: string;
  onTabChange: (tab: "full" | "components") => void;
}

function ScriptPanelTabs({ tabs, activeTab, onTabChange }: ScriptPanelTabsProps) {
  return (
    <div className="border-border bg-muted/30 flex border-b">
      {tabs
        .filter((tab) => tab.enabled)
        .map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as "full" | "components")}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === tab.key
                ? "text-foreground border-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </button>
        ))}
    </div>
  );
}

/**
 * Script Panel Content Component
 */
interface ScriptPanelContentProps {
  activeTab: string;
  scriptData: ScriptData;
  showMetrics: boolean;
  onCopy: (content: string, type?: string) => void;
  copyStatus: string;
}

function ScriptPanelContent({ activeTab, scriptData, showMetrics, onCopy, copyStatus }: ScriptPanelContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === "full" && (
        <FullScriptView
          script={scriptData.fullScript}
          metrics={scriptData.metrics}
          showMetrics={showMetrics}
          onCopy={onCopy}
          copyStatus={copyStatus}
        />
      )}

      {activeTab === "components" && (
        <ComponentsView components={scriptData.components} onCopy={onCopy} copyStatus={copyStatus} />
      )}
    </div>
  );
}

/**
 * Full Script View Component
 */
interface FullScriptViewProps {
  script: string;
  metrics: ScriptMetrics;
  showMetrics: boolean;
  onCopy: (content: string) => void;
  copyStatus: string;
}

function FullScriptView({ script, metrics, showMetrics, onCopy, copyStatus }: FullScriptViewProps) {
  return (
    <div className="p-6">
      <div className="relative">
        <div className="bg-muted/50 border-border group relative rounded-[var(--radius-card)] border p-5">
          {/* Script Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-background border-border flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border">
              <span className="text-muted-foreground text-sm font-semibold">T</span>
            </div>
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Transcript</span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(script)}
            className={cn(
              "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              copyStatus === "success" && "bg-green-50 text-green-600 opacity-100 dark:bg-green-950/20",
            )}
          >
            {copyStatus === "success" ? "Copied" : "Copy"}
          </Button>

          {/* Script Content */}
          <div className="text-foreground mt-8 text-sm leading-relaxed whitespace-pre-wrap">{script}</div>
        </div>

        {/* Metrics */}
        {showMetrics && (
          <div className="border-border mt-4 flex items-center gap-4 border-t pt-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs">{metrics.totalWords} words</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs">~{Math.ceil(metrics.totalDuration)}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Components View
 */
interface ComponentsViewProps {
  components: ScriptComponent[];
  onCopy: (content: string, type?: string) => void;
  copyStatus: string;
}

function ComponentsView({ components, onCopy, _copyStatus }: ComponentsViewProps) {
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null);

  const handleComponentCopy = async (content: string, componentId: string, componentType: string) => {
    setCopiedComponent(componentId);
    await onCopy(content, componentType);
    setTimeout(() => setCopiedComponent(null), 2000);
  };

  return (
    <div className="space-y-4 p-6">
      {components.map((component) => (
        <div
          key={component.id}
          className="bg-muted/50 border-border group hover:bg-muted/60 relative rounded-[var(--radius-card)] border p-5 transition-colors duration-200"
        >
          {/* Component Header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-background border-border flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border">
              <span className="text-muted-foreground text-sm font-semibold">
                {component.icon ?? SCRIPT_COMPONENT_ICONS[component.type] ?? "?"}
              </span>
            </div>
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {component.label ?? SCRIPT_COMPONENT_LABELS[component.type] ?? component.type}
            </span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleComponentCopy(component.content, component.id, component.type)}
            className={cn(
              "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              copiedComponent === component.id && "bg-green-50 text-green-600 opacity-100 dark:bg-green-950/20",
            )}
          >
            {copiedComponent === component.id ? "Copied" : "Copy"}
          </Button>

          {/* Component Content */}
          <div className="text-foreground mt-1 text-sm leading-relaxed">{component.content}</div>

          {/* Meta Info */}
          <div className="border-border mt-3 flex items-center gap-4 border-t pt-3">
            <div className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">{component.wordCount ?? 0} words</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">~{component.estimatedDuration ?? 0}s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScriptPanel;
