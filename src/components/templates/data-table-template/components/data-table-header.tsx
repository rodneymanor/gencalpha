"use client";

// Data Table Header Component
// Provides title, search, filters, and view mode controls

import React from "react";

import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { DataTableTemplateConfig, BaseItem, ViewMode } from "../types";

interface DataTableHeaderProps<T extends BaseItem> {
  config: DataTableTemplateConfig<T>;
  itemCount: number;
  totalCount?: number;
  searchQuery: string;
  filters: Record<string, any>;
  viewMode: ViewMode;
  onAddClick?: () => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DataTableHeader<T extends BaseItem>({
  config,
  itemCount,
  totalCount,
  searchQuery,
  filters,
  viewMode,
  onAddClick,
  onSearchChange,
  onFilterChange,
  onViewModeChange,
}: DataTableHeaderProps<T>) {
  return (
    <div className="border-b border-neutral-200 p-6">
      {/* Header Title & Add Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.icon && <div className="text-neutral-700">{config.icon}</div>}
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{config.title}</h1>
            {config.description && <p className="mt-1 text-sm text-neutral-600">{config.description}</p>}
          </div>
        </div>

        {config.addAction && (
          <Button
            onClick={onAddClick}
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
            size="sm"
          >
            {config.addAction.icon || <Plus className="h-4 w-4" />}
            {config.addAction.label}
          </Button>
        )}
      </div>

      {/* Filters & Search Row */}
      {(config.enableSearch || config.filters) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            {config.enableSearch && (
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  className="focus-visible:border-primary-400 border-neutral-200 bg-neutral-50 pl-9"
                  placeholder={config.searchPlaceholder || "Search..."}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}

            {/* Filter Buttons */}
            {config.filters?.map((filter) => (
              <Button
                key={filter.key}
                variant="outline"
                size="xs"
                className={cn(
                  "h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs",
                  "hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200",
                  "hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]",
                  filters[filter.key] && "border-primary-300 bg-primary-50",
                )}
                onClick={() => onFilterChange(filter.key, null)}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}

            {/* View Mode Switcher */}
            {config.viewModes && config.viewModes.length > 1 && (
              <div className="ml-auto flex items-center gap-1 rounded-[var(--radius-button)] border border-neutral-200 p-1">
                {config.viewModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={cn(
                      "rounded-[var(--radius-button)] px-3 py-1 text-xs font-medium transition-all",
                      viewMode === mode ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
                    )}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Item Count */}
            <div className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">
                {itemCount} {totalCount && totalCount !== itemCount && `of ${totalCount}`} items
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
