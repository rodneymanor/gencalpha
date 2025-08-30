"use client";

import { useEffect, useState, useCallback } from "react";

import { Filter, X, Star, Lightbulb, Edit3, MoreHorizontal } from "lucide-react";

import { IdeaDetailDialog } from "@/app/(main)/dashboard/idea-inbox/_components/idea-detail-dialog";
import { mapNotesToIdeas } from "@/app/(main)/dashboard/idea-inbox/_components/note-mapper";
import type { Idea, DatabaseNote } from "@/app/(main)/dashboard/idea-inbox/_components/types";
import { EditNoteDialog } from "@/components/standalone/edit-note-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTransparent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardSkeleton } from "@/components/ui/loading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchField } from "@/components/ui/search-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { clientNotesService } from "@/lib/services/client-notes-service";

interface FilterState {
  source: string;
  type: string;
  starred: string;
  dateRange: string;
  tags: string[];
}

interface IdeasViewProps {
  refreshTrigger?: number;
}

export function IdeasView({ refreshTrigger }: IdeasViewProps = {}) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    source: "all",
    type: "all",
    starred: "all",
    dateRange: "all",
    tags: [],
  });

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadIdeasFromDatabase();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && auth?.currentUser) {
      loadIdeasFromDatabase();
    }
  }, [refreshTrigger]);

  const loadIdeasFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await clientNotesService.getNotes({ limit: 100 });
      const mapped = mapNotesToIdeas(response.notes as DatabaseNote[]);
      setIdeas(mapped);
      setFilteredIdeas(mapped);
    } catch (error) {
      console.error("⚠️ Failed to load ideas", error);
      setIdeas([]);
      setFilteredIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = ideas;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          (idea.content || "").toLowerCase().includes(query) ||
          (idea.tags || []).some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply source filter
    if (filters.source !== "all") {
      filtered = filtered.filter((idea) => idea.source === filters.source);
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((idea) => idea.type === filters.type);
    }

    // Apply starred filter
    if (filters.starred !== "all") {
      const isStarred = filters.starred === "starred";
      filtered = filtered.filter((idea) => Boolean(idea.starred) === isStarred);
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (filters.dateRange !== "all") {
        filtered = filtered.filter((idea) => {
          const ideaDate = new Date(idea.updatedAt || idea.createdAt);
          return ideaDate >= filterDate;
        });
      }
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((idea) => filters.tags.every((tag) => (idea.tags || []).includes(tag)));
    }

    setFilteredIdeas(filtered);
  }, [searchQuery, ideas, filters]);

  const handleNoteClick = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  }, []);

  const handleEditClick = useCallback((idea: Idea, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIdea(idea);
    setIsEditDialogOpen(true);
  }, []);

  const handleNoteUpdated = () => {
    loadIdeasFromDatabase();
  };

  // Get unique values for filter options
  const getUniqueSourcesFromIdeas = useCallback(() => {
    const sources = new Set(ideas.map((idea) => idea.source).filter(Boolean));
    return Array.from(sources);
  }, [ideas]);

  const getUniqueTypesFromIdeas = useCallback(() => {
    const types = new Set(ideas.map((idea) => idea.type).filter(Boolean));
    return Array.from(types);
  }, [ideas]);

  const getUniqueTagsFromIdeas = useCallback(() => {
    const allTags = ideas.flatMap((idea) => idea.tags || []);
    const uniqueTags = new Set(allTags.filter(Boolean));
    return Array.from(uniqueTags).sort();
  }, [ideas]);

  // Filter management functions
  const clearAllFilters = () => {
    setFilters({
      source: "all",
      type: "all",
      starred: "all",
      dateRange: "all",
      tags: [],
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.source !== "all" ||
      filters.type !== "all" ||
      filters.starred !== "all" ||
      filters.dateRange !== "all" ||
      filters.tags.length > 0
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.source !== "all") count++;
    if (filters.type !== "all") count++;
    if (filters.starred !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return "1d ago";
    } else if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Mobile-first header */}
      <div className="bg-background/95 border-border sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            {/* Title Section - Always stacked on mobile */}
            <div className="space-y-1">
              <h1 className="text-foreground text-lg font-semibold sm:text-xl md:text-2xl">Ideas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isLoading
                  ? "Loading ideas..."
                  : `${filteredIdeas.length} note${filteredIdeas.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {/* Controls Section - Stacked vertically on mobile, horizontal on larger screens */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Field - Full width on mobile */}
              <div className="flex-1">
                <SearchField
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="h-10 w-full"
                  inputClassName="h-10 text-sm"
                />
              </div>

              {/* Action Buttons - Stacked on mobile, side-by-side on tablet+ */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                {/* Filter Button */}
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`relative flex h-10 w-full items-center justify-center gap-2 sm:w-auto ${hasActiveFilters() ? "border-primary" : ""}`}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                      {hasActiveFilters() && (
                        <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="space-y-3 p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold">Filters</h4>
                        {hasActiveFilters() && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Clear
                          </Button>
                        )}
                      </div>

                      {/* Compact filter options */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-muted-foreground mb-1 block text-xs">Source</label>
                          <Select
                            value={filters.source}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              {getUniqueSourcesFromIdeas().map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source.charAt(0).toUpperCase() + source.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-1 block text-xs">Type</label>
                          <Select
                            value={filters.type}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              {getUniqueTypesFromIdeas().map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-muted-foreground mb-1 block text-xs">Starred</label>
                          <Select
                            value={filters.starred}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, starred: value }))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="starred">Starred</SelectItem>
                              <SelectItem value="unstarred">Unstarred</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-1 block text-xs">Date</label>
                          <Select
                            value={filters.dateRange}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tags */}
                      {getUniqueTagsFromIdeas().length > 0 && (
                        <div>
                          <label className="text-muted-foreground mb-1 block text-xs">Tags</label>
                          <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto">
                            {getUniqueTagsFromIdeas()
                              .slice(0, 8)
                              .map((tag) => (
                                <Badge
                                  key={tag}
                                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                                  className="h-5 cursor-pointer px-2 text-xs"
                                  onClick={() => {
                                    setFilters((prev) => ({
                                      ...prev,
                                      tags: prev.tags.includes(tag)
                                        ? prev.tags.filter((t) => t !== tag)
                                        : [...prev.tags, tag],
                                    }));
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* New Idea Button */}
                <Button className="flex h-10 w-full items-center justify-center gap-2 transition-all duration-200 sm:w-auto">
                  <Lightbulb className="h-4 w-4" />
                  <span>New Idea</span>
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <div className="mt-2 flex flex-wrap gap-1">
                {filters.source !== "all" && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {filters.source}
                    <X
                      className="ml-1 h-2 w-2 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, source: "all" }))}
                    />
                  </Badge>
                )}
                {filters.starred !== "all" && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {filters.starred === "starred" ? "★" : "☆"}
                    <X
                      className="ml-1 h-2 w-2 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, starred: "all" }))}
                    />
                  </Badge>
                )}
                {filters.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="h-5 px-2 text-xs">
                    #{tag}
                    <X
                      className="ml-1 h-2 w-2 cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((t) => t !== tag),
                        }))
                      }
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-3">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="space-y-2 py-8 text-center">
              <div className="text-muted-foreground text-sm">
                {searchQuery || hasActiveFilters() ? "No matching ideas" : "No ideas yet"}
              </div>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <CardTransparent
                key={idea.id}
                onClick={() => handleNoteClick(idea)}
                className="cursor-pointer flex-col items-start p-3 hover:shadow-sm"
                role="button"
                tabIndex={0}
              >
                <div className="flex w-full flex-col space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-foreground line-clamp-2 flex-1 text-sm leading-tight font-medium">
                      {idea.title || "Untitled"}
                    </h4>
                    <div className="flex shrink-0 items-center gap-1">
                      {idea.starred && <Star className="h-3 w-3 fill-current text-yellow-500" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-muted h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={(e) => handleEditClick(idea, e)}>
                            <Edit3 className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {idea.content && (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                      {idea.content.length > 100 ? `${idea.content.substring(0, 100)}...` : idea.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatTimeAgo(idea.updatedAt || idea.createdAt)}</span>
                    {idea.source && (
                      <Badge variant="outline" className="h-4 px-1 text-xs">
                        {idea.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardTransparent>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <IdeaDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        idea={selectedIdea}
        onGenerateHooks={() => {
          console.log("Generate hooks for:", selectedIdea?.title);
        }}
        onConvertToScript={() => {
          console.log("Convert to script:", selectedIdea?.title);
        }}
      />

      {/* Edit Dialog */}
      <EditNoteDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onNoteUpdated={handleNoteUpdated}
        note={
          editingIdea
            ? {
                id: editingIdea.id,
                title: editingIdea.title,
                content: editingIdea.content,
                tags: editingIdea.tags,
                starred: editingIdea.starred,
              }
            : null
        }
      />
    </div>
  );
}
