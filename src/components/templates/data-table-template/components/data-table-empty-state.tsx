"use client";

// Data Table Empty State Component
// Displays when no data is available

import React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateConfig {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface DataTableEmptyStateProps {
  config: EmptyStateConfig;
  className?: string;
}

export function DataTableEmptyState({ config, className }: DataTableEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {config.icon && <div className="mb-4 text-neutral-300">{config.icon}</div>}
      <h3 className="mb-2 text-lg font-medium text-neutral-900">{config.title}</h3>
      <p className="mb-6 max-w-md text-center text-neutral-600">{config.description}</p>
      {config.action && (
        <button
          onClick={config.action.handler}
          className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-all hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
        >
          {config.action.label}
        </button>
      )}
    </div>
  );
}
