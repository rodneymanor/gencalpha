"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Plus, Filter, X, Star, Calendar, Tag, Type, Globe } from "lucide-react";

import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";

import { IdeaDetailDialog } from "@/app/(main)/dashboard/idea-inbox/_components/idea-detail-dialog";
import { mapNotesToIdeas } from "@/app/(main)/dashboard/idea-inbox/_components/note-mapper";
import type { Idea, DatabaseNote } from "@/app/(main)/dashboard/idea-inbox/_components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTransparent } from "@/components/ui/card";
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

export default function IdeasIdeaInboxPage() {
  const router = useRouter();
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    source: "all",
    type: "all",
    starred: "all",
    dateRange: "all",
    tags: [],
  });

  // Redirect if feature flag is disabled
  useEffect(() => {
    if (!isIdeaInboxEnabled) {
      router.replace("/dashboard");
    }
  }, [isIdeaInboxEnabled, router]);

  // Don't render if feature flag is disabled
  if (!isIdeaInboxEnabled) {
    return null;
  }

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadIdeasFromDatabase();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
      filtered = filtered.filter((idea) => filters.tags.every((tag) => idea.tags.includes(tag)));
    }

    setFilteredIdeas(filtered);
  }, [searchQuery, ideas, filters]);

  const handleNewNote = () => {
    setSelectedIdea(null);
    setIsDetailOpen(true);
  };

  const handleNoteClick = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  }, []);

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
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Mobile-optimized sticky header */}
      <div className="bg-background/95 border-border sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-foreground text-lg font-semibold sm:text-xl md:text-2xl">Your idea inbox</h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? "Loading..." : `${filteredIdeas.length} note${filteredIdeas.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`relative flex min-h-[44px] items-center justify-center gap-2 ${hasActiveFilters() ? "border-primary" : ""}`}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {hasActiveFilters() && (
                      <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Filters</h4>
                      {hasActiveFilters() && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2">
                          <X className="mr-1 h-3 w-3" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Source Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="text-muted-foreground h-3 w-3" />
                        <label className="text-xs font-medium">Source</label>
                      </div>
                      <Select
                        value={filters.source}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All sources</SelectItem>
                          {getUniqueSourcesFromIdeas().map((source) => (
                            <SelectItem key={source} value={source}>
                              {source.charAt(0).toUpperCase() + source.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Type className="text-muted-foreground h-3 w-3" />
                        <label className="text-xs font-medium">Type</label>
                      </div>
                      <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          {getUniqueTypesFromIdeas().map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Starred Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="text-muted-foreground h-3 w-3" />
                        <label className="text-xs font-medium">Starred</label>
                      </div>
                      <Select
                        value={filters.starred}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, starred: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All notes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All notes</SelectItem>
                          <SelectItem value="starred">Starred only</SelectItem>
                          <SelectItem value="unstarred">Unstarred only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-3 w-3" />
                        <label className="text-xs font-medium">Date Range</label>
                      </div>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Past week</SelectItem>
                          <SelectItem value="month">Past month</SelectItem>
                          <SelectItem value="year">Past year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags Filter */}
                    {getUniqueTagsFromIdeas().length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Tag className="text-muted-foreground h-3 w-3" />
                          <label className="text-xs font-medium">Tags</label>
                        </div>
                        <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
                          {getUniqueTagsFromIdeas().map((tag) => (
                            <Badge
                              key={tag}
                              variant={filters.tags.includes(tag) ? "default" : "outline"}
                              className="h-6 cursor-pointer text-xs"
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

              <Button
                onClick={handleNewNote}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 sm:flex-initial"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:inline">New note</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with improved mobile spacing */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {/* Enhanced search bar with SearchField component */}
        <div className="mb-6">
          <SearchField
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="h-12 w-full sm:h-11"
            inputClassName="h-12 text-base sm:h-11 sm:text-sm"
          />

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.source !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Source: {filters.source}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, source: "all" }))}
                  />
                </Badge>
              )}
              {filters.type !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.type}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, type: "all" }))}
                  />
                </Badge>
              )}
              {filters.starred !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.starred === "starred" ? "Starred" : "Unstarred"}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, starred: "all" }))}
                  />
                </Badge>
              )}
              {filters.dateRange !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {filters.dateRange === "today"
                    ? "Today"
                    : filters.dateRange === "week"
                      ? "Past week"
                      : filters.dateRange === "month"
                        ? "Past month"
                        : "Past year"}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, dateRange: "all" }))}
                  />
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
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

        {/* Mobile-optimized notes list */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="space-y-2 text-center">
                <div className="text-muted-foreground text-base">Loading your notes...</div>
                <div className="border-primary mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="space-y-4 py-16 text-center">
              <div className="space-y-2">
                <div className="text-muted-foreground text-base">
                  {searchQuery ? "No notes found matching your search." : "No notes yet."}
                </div>
                {!searchQuery && (
                  <div className="text-muted-foreground text-sm">Create your first note to get started!</div>
                )}
              </div>
              {!searchQuery && (
                <Button onClick={handleNewNote} variant="secondary" className="min-h-[44px] gap-2 px-6">
                  <Plus className="h-4 w-4" />
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <CardTransparent
                key={idea.id}
                onClick={() => handleNoteClick(idea)}
                className="min-h-[80px] touch-manipulation flex-col items-start p-4 sm:p-5"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNoteClick(idea);
                  }
                }}
              >
                <div className="flex w-full flex-col space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-foreground line-clamp-2 text-base leading-tight font-semibold sm:text-lg">
                      {idea.title || "Untitled"}
                    </h3>
                    {idea.content && (
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed sm:line-clamp-2">
                        {idea.content.length > 180 ? `${idea.content.substring(0, 180)}...` : idea.content}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground flex-1 text-xs">
                      Last edited {formatTimeAgo(idea.updatedAt || idea.createdAt)}
                    </p>
                    <div className="text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardTransparent>
            ))
          )}
        </div>

        {/* Add some bottom padding for mobile scroll comfort */}
        <div className="h-6 sm:h-4" />
      </div>

      {/* Dialog */}
      <IdeaDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        idea={selectedIdea}
        onGenerateHooks={() => {
          // TODO: Implement hooks generation
          console.log("Generate hooks for:", selectedIdea?.title);
        }}
        onConvertToScript={() => {
          // TODO: Implement script conversion
          console.log("Convert to script:", selectedIdea?.title);
        }}
      />
    </div>
  );
}
