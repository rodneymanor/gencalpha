"use client";

import React from "react";

import { RefreshCw, Loader2 } from "lucide-react";

import type { ScriptSection, VideoScript } from "./types";

// Component props
interface ScriptCardGridProps {
  scripts: VideoScript[];
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
  progressLabel?: string;
}

// Component for individual script sections (Hook, Bridge, etc.)
const ScriptSection: React.FC<{ section: ScriptSection }> = ({ section }) => {
  // Map section types to their color classes using numbered variants
  const colorClasses = {
    hook: "text-destructive-600",
    bridge: "text-primary-600",
    "golden-nugget": "text-warning-600",
    wta: "text-success-600",
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-3">
      {/* Section header with label and time */}
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-[11px] font-medium tracking-[0.02em] ${colorClasses[section.type]}`}>
          {section.label}
        </span>
        <span className="text-[11px] text-neutral-500">{section.timeRange}</span>
      </div>
      {/* Section content */}
      <div className="space-y-1">
        <div className="text-[13px] text-neutral-900">{section.dialogue}</div>
        <div className="text-xs text-neutral-600 italic">{section.action}</div>
      </div>
    </div>
  );
};

// Component for individual video script card
const ScriptCard: React.FC<{ script: VideoScript }> = ({ script }) => {
  return (
    <div
      className={
        "rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 transition-colors duration-200 hover:border-neutral-300"
      }
    >
      {/* Status badge */}
      {script.status === "loading" && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
        </div>
      )}
      {/* Script sections container */}
      <div className="flex flex-col gap-2">
        {script.sections.map((section, index) => (
          <ScriptSection key={index} section={section} />
        ))}
      </div>

      {/* Footer with duration */}
      <div className="mt-3 flex items-center justify-end border-t border-neutral-200 pt-3 text-xs text-neutral-600">
        <span>Duration: {script.duration}</span>
      </div>
    </div>
  );
};

// Main grid component for displaying multiple video scripts
const ScriptCardGrid: React.FC<ScriptCardGridProps> = ({
  scripts,
  title = "Short Form Video Scripts",
  subtitle = "Complete scripts with Hook, Bridge, Golden Nugget, and WTA structure",
  onRefresh,
  loading = false,
  progressLabel,
}) => {
  return (
    <div className="bg-neutral-50 px-6 py-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-medium text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-600">{subtitle}</p>
            {loading && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-neutral-100 px-2 py-1 text-[12px] text-neutral-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progressLabel ?? "Processing daily picks…"}</span>
              </div>
            )}
          </div>
          {onRefresh && (
            <button
              type="button"
              aria-label="Refresh daily picks"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={onRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>

        {/* Masonry-style grid layout */}
        <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptCardGrid;
