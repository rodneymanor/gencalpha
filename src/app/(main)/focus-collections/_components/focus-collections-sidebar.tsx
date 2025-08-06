"use client";

import { useState } from "react";

import { ArrowLeft, Plus, FolderOpen, Video, Star, Heart, TrendingUp, Calendar, Bookmark, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

interface FocusCollectionsSidebarProps {
  collections: Collection[];
  selectedCollectionId: string;
  onSelectCollection: (id: string) => void;
  onBackToDashboard: () => void;
  onCreateCollection: () => void;
  className?: string;
}

// Icon mapping for title-based assignment
const iconMap = new Map([
  ["favorite", Heart],
  ["fav", Heart],
  ["trending", TrendingUp],
  ["viral", TrendingUp],
  ["bookmark", Bookmark],
  ["saved", Bookmark],
  ["archive", Archive],
  ["old", Archive],
  ["star", Star],
  ["featured", Star],
  ["calendar", Calendar],
  ["scheduled", Calendar],
]);

// Helper function to get icon for collection based on title or use default rotation
const getCollectionIcon = (collectionId: string, title: string) => {
  const titleLower = title.toLowerCase();

  // Find matching icon based on keywords
  for (const [keyword, IconComponent] of iconMap) {
    if (titleLower.includes(keyword)) {
      return IconComponent;
    }
  }

  // Default rotation based on collection ID (safe hash)
  const icons = [Video, FolderOpen, Star, Heart, TrendingUp, Calendar, Bookmark, Archive];
  const safeIndex = Math.abs(collectionId.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % icons.length;
  return icons[safeIndex];
};

export function FocusCollectionsSidebar({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onBackToDashboard,
  onCreateCollection,
  className,
}: FocusCollectionsSidebarProps) {
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);

  return (
    <div className={cn("bg-sidebar text-sidebar-foreground flex h-full w-full flex-col", className)}>
      {/* Header Section */}
      <div className="border-sidebar-border flex-shrink-0 border-b p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToDashboard}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground mb-4 gap-2 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Button
          onClick={onCreateCollection}
          variant="secondary"
          className="text-sidebar-foreground w-full gap-2 rounded-md border-0"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0.5px 3px 0px",
          }}
          size="default"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* All Videos Option */}
          <button
            onClick={() => onSelectCollection("all-videos")}
            onMouseEnter={() => setHoveredCollection("all-videos")}
            onMouseLeave={() => setHoveredCollection(null)}
            className={cn(
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors",
              selectedCollectionId === "all-videos"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground",
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                selectedCollectionId === "all-videos"
                  ? "bg-slate-800 text-slate-200" // Dark background with light slate text
                  : "bg-sidebar-accent/20 text-sidebar-foreground",
              )}
            >
              <Video
                className={cn(
                  "h-4 w-4",
                  selectedCollectionId === "all-videos"
                    ? "stroke-slate-200 stroke-1" // Light slate stroke for selected
                    : "stroke-2",
                )}
              />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span>All Videos</span>
              <span className="text-sidebar-foreground/70 text-xs">
                {collections.reduce((total, col) => total + col.videoCount, 0)}
              </span>
            </div>
          </button>

          {/* Individual Collections */}
          {collections.map((collection) => {
            const IconComponent = getCollectionIcon(collection.id, collection.title);
            return (
              <button
                key={collection.id}
                onClick={() => onSelectCollection(collection.id)}
                onMouseEnter={() => setHoveredCollection(collection.id)}
                onMouseLeave={() => setHoveredCollection(null)}
                className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors",
                  selectedCollectionId === collection.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                    selectedCollectionId === collection.id
                      ? "bg-slate-800 text-slate-200" // Dark background with light slate text
                      : "bg-sidebar-accent/20 text-sidebar-foreground",
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-4 w-4",
                      selectedCollectionId === collection.id
                        ? "stroke-slate-200 stroke-1" // Light slate stroke for selected
                        : "stroke-2",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{collection.title}</div>
                  <div className="text-sidebar-foreground/70 mt-1 truncate text-xs">
                    {collection.description ?? "Collection of curated videos"}
                  </div>
                </div>
                <span className="text-sidebar-foreground/70 ml-2 text-xs">{collection.videoCount}</span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="text-sidebar-foreground/70 py-8 text-center">
            <p className="text-sm">No collections yet</p>
            <p className="text-xs">Create your first collection to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
