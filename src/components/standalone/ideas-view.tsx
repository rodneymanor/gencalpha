"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, X, Star, Calendar, Tag, Type, Globe, Lightbulb } from "lucide-react";

import { IdeaDetailDialog } from "@/app/(main)/dashboard/idea-inbox/_components/idea-detail-dialog";
import { mapNotesToIdeas } from "@/app/(main)/dashboard/idea-inbox/_components/note-mapper";
import type { Idea, DatabaseNote } from "@/app/(main)/dashboard/idea-inbox/_components/types";
import { Button } from "@/components/ui/button";
import { CardTransparent } from "@/components/ui/card";
import { SearchField } from "@/components/ui/search-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/firebase";
import { clientNotesService } from "@/lib/services/client-notes-service";

interface FilterState {
  source: string;
  type: string;
  starred: string;
  dateRange: string;
  tags: string[];
}

export function IdeasView() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    source: "all",
    type: "all", 
    starred: "all",
    dateRange: "all",
    tags: []
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
          (idea.tags || []).some(tag => tag.toLowerCase().includes(query))
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
      filtered = filtered.filter((idea) =>
        filters.tags.every(tag => (idea.tags || []).includes(tag))
      );
    }

    setFilteredIdeas(filtered);
  }, [searchQuery, ideas, filters]);

  const handleNoteClick = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  }, []);

  // Get unique values for filter options
  const getUniqueSourcesFromIdeas = useCallback(() => {
    const sources = new Set(ideas.map(idea => idea.source).filter(Boolean));
    return Array.from(sources);
  }, [ideas]);

  const getUniqueTypesFromIdeas = useCallback(() => {
    const types = new Set(ideas.map(idea => idea.type).filter(Boolean));
    return Array.from(types);
  }, [ideas]);

  const getUniqueTagsFromIdeas = useCallback(() => {
    const allTags = ideas.flatMap(idea => idea.tags || []);
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
      tags: []
    });
  };

  const hasActiveFilters = () => {
    return filters.source !== "all" || 
           filters.type !== "all" || 
           filters.starred !== "all" || 
           filters.dateRange !== "all" || 
           filters.tags.length > 0;
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
    <div className="flex flex-col h-full">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            {/* Title Section - Always stacked on mobile */}
            <div className="space-y-1">
              <h1 className="text-foreground text-lg font-semibold sm:text-xl md:text-2xl">Ideas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isLoading ? "Loading..." : `${filteredIdeas.length} note${filteredIdeas.length !== 1 ? "s" : ""} found`}
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
                  className="w-full h-10"
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
                      className={`h-10 w-full sm:w-auto flex items-center justify-center gap-2 relative ${hasActiveFilters() ? 'border-primary' : ''}`}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                      {hasActiveFilters() && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs">Filters</h4>
                  {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Compact filter options */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Source</label>
                    <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({...prev, source: value}))}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {getUniqueSourcesFromIdeas().map(source => (
                          <SelectItem key={source} value={source}>
                            {source.charAt(0).toUpperCase() + source.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({...prev, type: value}))}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {getUniqueTypesFromIdeas().map(type => (
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
                    <label className="text-xs text-muted-foreground mb-1 block">Starred</label>
                    <Select value={filters.starred} onValueChange={(value) => setFilters(prev => ({...prev, starred: value}))}>
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
                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({...prev, dateRange: value}))}>
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
                    <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {getUniqueTagsFromIdeas().slice(0, 8).map(tag => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer text-xs h-5 px-2"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag) 
                                ? prev.tags.filter(t => t !== tag)
                                : [...prev.tags, tag]
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
                <Button 
                  className="h-10 w-full sm:w-auto flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>New Idea</span>
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <div className="mt-2 flex flex-wrap gap-1">
                {filters.source !== "all" && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {filters.source}
                    <X 
                      className="h-2 w-2 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({...prev, source: "all"}))}
                    />
                  </Badge>
                )}
                {filters.starred !== "all" && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {filters.starred === "starred" ? "★" : "☆"}
                    <X 
                      className="h-2 w-2 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({...prev, starred: "all"}))}
                    />
                  </Badge>
                )}
                {filters.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs h-5 px-2">
                    #{tag}
                    <X 
                      className="h-2 w-2 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        tags: prev.tags.filter(t => t !== tag)
                      }))}
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
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="text-muted-foreground text-sm">Loading ideas...</div>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="text-muted-foreground text-sm">
                {searchQuery || hasActiveFilters() ? "No matching ideas" : "No ideas yet"}
              </div>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <CardTransparent
                key={idea.id}
                onClick={() => handleNoteClick(idea)}
                className="p-3 flex-col items-start cursor-pointer hover:shadow-sm"
                role="button"
                tabIndex={0}
              >
                <div className="flex flex-col space-y-2 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-foreground text-sm font-medium leading-tight line-clamp-2 flex-1">
                      {idea.title || "Untitled"}
                    </h4>
                    {idea.starred && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current shrink-0" />
                    )}
                  </div>
                  {idea.content && (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                      {idea.content.length > 100 ? `${idea.content.substring(0, 100)}...` : idea.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatTimeAgo(idea.updatedAt || idea.createdAt)}
                    </span>
                    {idea.source && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
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
          console.log('Generate hooks for:', selectedIdea?.title);
        }}
        onConvertToScript={() => {
          console.log('Convert to script:', selectedIdea?.title);
        }}
      />
    </div>
  );
}