"use client";

import React, { useState } from "react";

import { FileText, Clock, Download, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ScriptTabConfig,
  SCRIPT_COMPONENT_ICONS,
  SCRIPT_COMPONENT_LABELS,
  ScriptData,
  ScriptMetrics,
  ScriptComponent,
} from "@/types/script-panel";

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

export function ScriptPanelHeader({
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
    <div className="flex items-center justify-between border-b border-neutral-200 p-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
          Script
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Dual Action Button - Copy & Download */}
        <div className="flex overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(scriptData.fullScript)}
            disabled={copyStatus === "copying"}
            className={cn(
              "h-8 rounded-none border-r border-neutral-200 px-3 text-xs font-medium transition-colors duration-200",
              copyStatus === "success" && "bg-success-50 text-success-600 dark:bg-success-950/20",
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
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-neutral-100">
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

export function ScriptPanelTabs({ tabs, activeTab, onTabChange }: ScriptPanelTabsProps) {
  return (
    <div className="flex border-b border-neutral-200 bg-neutral-200/30">
      {tabs
        .filter((tab) => tab.enabled)
        .map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as "full" | "components")}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === tab.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900",
            )}
          >
            {tab.label}
          </button>
        ))}
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

export function FullScriptView({ script, metrics, showMetrics, onCopy, copyStatus }: FullScriptViewProps) {
  return (
    <div className="p-6">
      <div className="relative">
        <div className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
          {/* Script Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <span className="text-sm font-semibold text-neutral-600">T</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Transcript</span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(script)}
            className={cn(
              "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              copyStatus === "success" && "bg-success-50 text-success-600 dark:bg-success-950/20 opacity-100",
            )}
          >
            {copyStatus === "success" ? "Copied" : "Copy"}
          </Button>

          {/* Script Content */}
          <div className="mt-8 text-sm leading-relaxed whitespace-pre-wrap text-neutral-900">{script}</div>
        </div>

        {/* Metrics */}
        {showMetrics && (
          <div className="mt-4 flex items-center gap-4 border-t border-neutral-200 pt-4">
            <div className="flex items-center gap-2 text-neutral-600">
              <FileText className="h-4 w-4" />
              <span className="text-xs">{metrics.totalWords} words</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
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
}

export function ComponentsView({ components, onCopy }: ComponentsViewProps) {
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
          className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5 transition-colors duration-200 hover:bg-neutral-100/60"
        >
          {/* Component Header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <span className="text-sm font-semibold text-neutral-600">
                {component.icon ?? SCRIPT_COMPONENT_ICONS[component.type] ?? "?"}
              </span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
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
              copiedComponent === component.id && "bg-success-50 text-success-600 dark:bg-success-950/20 opacity-100",
            )}
          >
            {copiedComponent === component.id ? "Copied" : "Copy"}
          </Button>

          {/* Component Content */}
          <div className="mt-1 text-sm leading-relaxed text-neutral-900">{component.content}</div>

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 border-t border-neutral-200 pt-3">
            <div className="flex items-center gap-1.5 text-neutral-600">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">{component.wordCount ?? 0} words</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">~{component.estimatedDuration ?? 0}s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
