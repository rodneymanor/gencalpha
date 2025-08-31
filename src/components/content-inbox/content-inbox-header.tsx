"use client";

import { Calendar, Filter, Plus, Search, Tag, ArrowUpNarrowWide } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContentInboxHeaderProps {
  itemCount?: number;
  onAddContent?: () => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string, value: any) => void;
  searchQuery?: string;
}

export function ContentInboxHeader({
  itemCount = 0,
  onAddContent,
  onSearch,
  onFilterChange,
  searchQuery = "",
}: ContentInboxHeaderProps) {
  return (
    <div className="border-b border-neutral-200 p-6">
      {/* Header Title & Add Button */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Content Inbox</h1>
        <Button
          onClick={onAddContent}
          className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="focus-visible:border-primary-400 border-neutral-200 bg-neutral-50 pl-9"
              placeholder="Search by title, creator, or transcript..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <Button
            variant="outline"
            size="xs"
            className="h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
            onClick={() => onFilterChange?.("platform", null)}
          >
            <Filter className="h-4 w-4" />
            Platform
          </Button>

          <Button
            variant="outline"
            size="xs"
            className="h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
            onClick={() => onFilterChange?.("category", null)}
          >
            <Tag className="h-4 w-4" />
            Category
          </Button>

          <Button
            variant="outline"
            size="xs"
            className="h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
            onClick={() => onFilterChange?.("status", null)}
          >
            Status
          </Button>

          <Button
            variant="outline"
            size="xs"
            className="h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
            onClick={() => onFilterChange?.("date", null)}
          >
            <Calendar className="h-4 w-4" />
            Date
          </Button>

          <Button
            variant="outline"
            size="xs"
            className="h-8 border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-3 text-xs hover:-translate-y-px hover:border-neutral-400 hover:from-neutral-100 hover:to-neutral-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
            onClick={() => onFilterChange?.("sort", null)}
          >
            <ArrowUpNarrowWide className="h-4 w-4" />
            Sort
          </Button>

          {/* Item Count */}
          <div className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">{itemCount} items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
