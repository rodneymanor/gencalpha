"use client";

// Data Table Header Component
// Provides title, search, filters, and view mode controls

import React, { useState } from "react";

import { Search, Plus, Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

{config.customHeaderActions || (config.addAction && (
          <Button
            onClick={onAddClick}
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
            size="sm"
          >
            {config.addAction.icon || <Plus className="h-4 w-4" />}
            {config.addAction.label}
          </Button>
        ))}
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

            {/* Filter Dropdowns */}
            {config.filters?.map((filter) => {
              const selectedValues = filters[filter.key] || [];
              const hasSelection = selectedValues.length > 0;
              const allSelected = selectedValues.length === filter.options?.length;
              
              return (
                <DropdownMenu key={filter.key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="xs"
                      className={cn(
                        "h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs",
                        "hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200",
                        "hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]",
                        hasSelection && "border-primary-300 bg-primary-50 text-primary-700",
                      )}
                    >
                      {filter.icon}
                      {filter.label}
                      {hasSelection && !allSelected && (
                        <span className="ml-1 rounded-full bg-primary-200 px-1.5 py-0.5 text-xs">
                          {selectedValues.length}
                        </span>
                      )}
                      {allSelected && (
                        <span className="ml-1 text-xs text-primary-600">All</span>
                      )}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {filter.type === "multiselect" && filter.options && (
                      <>
                        {/* Select All option */}
                        <DropdownMenuCheckboxItem
                          checked={allSelected || !hasSelection}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Clear filter to show all
                              onFilterChange(filter.key, []);
                            } else {
                              // If unchecking "All", don't do anything
                              return;
                            }
                          }}
                          className="font-medium"
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        
                        {/* Individual options */}
                        {filter.options.map((option) => {
                          const isSelected = selectedValues.includes(option.value);
                          return (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const newValues = checked
                                  ? [...selectedValues, option.value]
                                  : selectedValues.filter((v: string) => v !== option.value);
                                onFilterChange(filter.key, newValues.length > 0 ? newValues : []);
                              }}
                            >
                              {option.label}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
            
            {/* Reset Filters Button */}
            {config.filters && config.filters.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  // Clear all filters
                  config.filters?.forEach(filter => {
                    onFilterChange(filter.key, []);
                  });
                }}
                className={cn(
                  "h-8 px-3 text-xs text-neutral-600 hover:text-neutral-900",
                  "hover:bg-neutral-100",
                  Object.keys(filters).some(key => filters[key]?.length > 0) ? "visible" : "invisible"
                )}
              >
                Reset filters
              </Button>
            )}

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
