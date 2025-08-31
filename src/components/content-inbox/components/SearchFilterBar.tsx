"use client";

// Search and Filter Bar Component

import React, { useState, useCallback, useMemo } from "react";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Tag, LayoutGrid, List, SortAsc, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useSearchSuggestions } from "../hooks/use-content-inbox";
import { FilterOptions, SortOptions, Platform, TranscriptionStatus, ContentCategory, ViewMode } from "../types";

interface SearchFilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sort: SortOptions;
  onSortChange: (sort: SortOptions) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalItems?: number;
  selectedCount?: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalItems = 0,
  selectedCount = 0,
}) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search suggestions
  const { data: suggestions = [] } = useSearchSuggestions(searchInput);

  // Update search with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      // Debounced update
      const timer = setTimeout(() => {
        onFiltersChange({ ...filters, searchQuery: value });
      }, 300);
      return () => clearTimeout(timer);
    },
    [filters, onFiltersChange],
  );

  // Platform options
  const platforms: { value: Platform; label: string }[] = [
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  // Category options
  const categories: { value: ContentCategory; label: string }[] = [
    { value: "inspiration", label: "Inspiration" },
    { value: "competitor", label: "Competitor" },
    { value: "trending", label: "Trending" },
    { value: "educational", label: "Educational" },
  ];

  // Transcription status options
  const transcriptionStatuses: { value: TranscriptionStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "complete", label: "Complete" },
    { value: "failed", label: "Failed" },
  ];

  // Sort options
  const sortOptions: { value: SortOptions["field"]; label: string }[] = [
    { value: "savedAt", label: "Date Added" },
    { value: "viewCount", label: "View Count" },
    { value: "likeCount", label: "Like Count" },
    { value: "duration", label: "Duration" },
    { value: "custom", label: "Custom Order" },
  ];

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.platforms && filters.platforms.length > 0) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.transcriptionStatus && filters.transcriptionStatus.length > 0) count++;
    if (filters.dateRange) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({});
    setSearchInput("");
  };

  // Toggle platform filter
  const togglePlatform = (platform: Platform) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p) => p !== platform)
      : [...currentPlatforms, platform];

    onFiltersChange({
      ...filters,
      platforms: newPlatforms.length > 0 ? newPlatforms : undefined,
    });
  };

  // Toggle category filter
  const toggleCategory = (category: ContentCategory) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  // Toggle transcription status filter
  const toggleTranscriptionStatus = (status: TranscriptionStatus) => {
    const currentStatuses = filters.transcriptionStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({
      ...filters,
      transcriptionStatus: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* Main search and filter row */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search by title, creator, or transcript..."
            className="pr-4 pl-9"
          />

          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full z-10 mt-1 w-full rounded-[var(--radius-card)] border border-neutral-200 bg-white shadow-[var(--shadow-soft-drop)]"
            >
              {suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchInput(suggestion);
                    onFiltersChange({ ...filters, searchQuery: suggestion });
                  }}
                  className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Platform filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Platform
              {filters.platforms && filters.platforms.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {filters.platforms.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform.value}
                checked={filters.platforms?.includes(platform.value) || false}
                onCheckedChange={() => togglePlatform(platform.value)}
              >
                {platform.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Tag className="h-4 w-4" />
              Category
              {filters.categories && filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.value}
                checked={filters.categories?.includes(category.value) || false}
                onCheckedChange={() => toggleCategory(category.value)}
              >
                {category.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Transcription status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Status
              {filters.transcriptionStatus && filters.transcriptionStatus.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {filters.transcriptionStatus.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Transcription Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {transcriptionStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status.value}
                checked={filters.transcriptionStatus?.includes(status.value) || false}
                onCheckedChange={() => toggleTranscriptionStatus(status.value)}
              >
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date
              {filters.dateRange && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{
                from: filters.dateRange?.from,
                to: filters.dateRange?.to,
              }}
              onSelect={(range: any) => {
                onFiltersChange({
                  ...filters,
                  dateRange: range?.from
                    ? {
                        from: range.from,
                        to: range.to || range.from,
                      }
                    : undefined,
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange({ field: option.value, direction: sort.direction })}
                className={cn(sort.field === option.value && "bg-neutral-100")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange({ ...sort, direction: sort.direction === "asc" ? "desc" : "asc" })}
            >
              {sort.direction === "asc" ? "↑ Ascending" : "↓ Descending"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View mode toggle */}
        <div className="flex items-center rounded-[var(--radius-button)] bg-neutral-100 p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded-[var(--radius-button)] p-1.5 transition-all",
              viewMode === "grid" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded-[var(--radius-button)] p-1.5 transition-all",
              viewMode === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Item count - moved to main row */}
        <div className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
          {selectedCount > 0 && <span className="text-primary-600 font-medium">{selectedCount} selected</span>}
          <span className="text-neutral-900 font-medium">{totalItems} items</span>
        </div>
      </div>

      {/* Active filters only - stats moved to main row */}
      {(activeFilterCount > 0 || filters.searchQuery || filters.dateRange) && (
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <>
              <span className="text-sm text-neutral-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            </>
          )}

          {/* Active filter badges */}
          <div className="flex gap-2">
            {filters.searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: {filters.searchQuery}
                <button
                  onClick={() => {
                    setSearchInput("");
                    onFiltersChange({ ...filters, searchQuery: undefined });
                  }}
                  className="ml-1 hover:text-neutral-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="text-xs">
                {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d")}
                <button
                  onClick={() => onFiltersChange({ ...filters, dateRange: undefined })}
                  className="ml-1 hover:text-neutral-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
