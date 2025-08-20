"use client";

import React, { useState } from "react";
import { X, Download, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ScriptPanelProps, 
  ScriptTabConfig, 
  SCRIPT_COMPONENT_ICONS,
  SCRIPT_COMPONENT_LABELS
} from "@/types/script-panel";
import { useScriptCopy } from "@/hooks/use-script-copy";
import { useScriptDownload } from "@/hooks/use-script-download";

/**
 * ScriptPanel - A comprehensive script display component with tabs,
 * copy functionality, and metrics display following Clarity Design System
 */
export function ScriptPanel({
  scriptData,
  isLoading = false,
  onCopy,
  onDownload,
  onClose,
  className,
  showDownload = true,
  showMetrics = true,
  customActions
}: ScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<"full" | "components">("full");
  const { copyText, copyStatus } = useScriptCopy();
  const { downloadScript, isDownloading } = useScriptDownload();

  // Tab configuration
  const tabs: ScriptTabConfig[] = [
    { key: "full", label: "Full Script", enabled: true },
    { key: "components", label: "Components", enabled: scriptData.components.length > 0 }
  ];

  const handleCopy = async (content: string, componentType?: any) => {
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
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span className="text-sm">Loading script...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Panel Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className="bg-accent/10 text-foreground font-medium px-3 py-1.5 text-sm"
          >
            Script
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dual Action Button - Copy & Download */}
          <div className="flex border border-border rounded-[var(--radius-button)] overflow-hidden bg-background">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => handleCopy(scriptData.fullScript)}
              disabled={copyStatus === "copying"}
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-none border-r border-border transition-colors duration-200",
                copyStatus === "success" && "text-green-600 bg-green-50 dark:bg-green-950/20"
              )}
            >
              {copyStatus === "copying" ? "Copying..." : copyStatus === "success" ? "Copied" : "Copy"}
            </Button>
            
            {showDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-8 px-2 rounded-none"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          
          {/* Custom Actions */}
          {customActions}
          
          {/* Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-accent/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border flex border-b bg-muted/30">
        {tabs.filter(tab => tab.enabled).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
              activeTab === tab.key
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "full" && (
          <FullScriptView 
            script={scriptData.fullScript}
            metrics={scriptData.metrics}
            showMetrics={showMetrics}
            onCopy={handleCopy}
            copyStatus={copyStatus}
          />
        )}
        
        {activeTab === "components" && (
          <ComponentsView 
            components={scriptData.components}
            onCopy={handleCopy}
            copyStatus={copyStatus}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Full Script View Component
 */
interface FullScriptViewProps {
  script: string;
  metrics: any;
  showMetrics: boolean;
  onCopy: (content: string) => void;
  copyStatus: string;
}

function FullScriptView({ script, metrics, showMetrics, onCopy, copyStatus }: FullScriptViewProps) {
  return (
    <div className="p-6">
      <div className="relative">
        <div className="bg-muted/50 border border-border rounded-[var(--radius-card)] p-5 relative group">
          {/* Script Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-background border border-border rounded-[var(--radius-button)]">
              <span className="text-sm font-semibold text-muted-foreground">T</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Transcript
            </span>
          </div>
          
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(script)}
            className={cn(
              "absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 px-3 text-xs",
              copyStatus === "success" && "text-green-600 bg-green-50 dark:bg-green-950/20 opacity-100"
            )}
          >
            {copyStatus === "success" ? "Copied" : "Copy"}
          </Button>
          
          {/* Script Content */}
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mt-8">
            {script}
          </div>
        </div>
        
        {/* Metrics */}
        {showMetrics && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-xs">{metrics.totalWords} words</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
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
  components: any[];
  onCopy: (content: string, type?: string) => void;
  copyStatus: string;
}

function ComponentsView({ components, onCopy, copyStatus }: ComponentsViewProps) {
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null);

  const handleComponentCopy = async (content: string, componentId: string, componentType: string) => {
    setCopiedComponent(componentId);
    await onCopy(content, componentType);
    setTimeout(() => setCopiedComponent(null), 2000);
  };

  return (
    <div className="p-6 space-y-4">
      {components.map((component) => (
        <div
          key={component.id}
          className="bg-muted/50 border border-border rounded-[var(--radius-card)] p-5 relative group hover:bg-muted/60 transition-colors duration-200"
        >
          {/* Component Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-background border border-border rounded-[var(--radius-button)]">
              <span className="text-sm font-semibold text-muted-foreground">
                {component.icon || SCRIPT_COMPONENT_ICONS[component.type] || "?"}
              </span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {component.label || SCRIPT_COMPONENT_LABELS[component.type] || component.type}
            </span>
          </div>
          
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleComponentCopy(component.content, component.id, component.type)}
            className={cn(
              "absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 px-3 text-xs",
              copiedComponent === component.id && "text-green-600 bg-green-50 dark:bg-green-950/20 opacity-100"
            )}
          >
            {copiedComponent === component.id ? "Copied" : "Copy"}
          </Button>
          
          {/* Component Content */}
          <div className="text-sm text-foreground leading-relaxed mt-1">
            {component.content}
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs">{component.wordCount || 0} words</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">~{component.estimatedDuration || 0}s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScriptPanel;
