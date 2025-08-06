"use client";

import { useState } from "react";

import { ArrowLeft, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <div className={cn("bg-muted flex h-full w-full flex-col", className)}>
      {/* Header Section */}
      <div className="border-border flex-shrink-0 border-b p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToDashboard}
          className="text-muted-foreground hover:text-foreground mb-4 gap-2 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Button onClick={onCreateCollection} className="w-full gap-2 rounded-[var(--radius-button)]" size="default">
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
              "flex w-full items-center justify-between rounded-[var(--radius-button)] p-3 text-left transition-colors",
              selectedCollectionId === "all-videos"
                ? "bg-background text-foreground border-secondary border-l-4 font-medium shadow-[var(--shadow-input)]"
                : hoveredCollection === "all-videos"
                  ? "bg-background/50 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="font-sans text-sm">All Videos</span>
            <Badge variant="secondary" className="text-xs">
              {collections.reduce((total, col) => total + col.videoCount, 0)}
            </Badge>
          </button>

          {/* Individual Collections */}
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onSelectCollection(collection.id)}
              onMouseEnter={() => setHoveredCollection(collection.id)}
              onMouseLeave={() => setHoveredCollection(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-[var(--radius-button)] p-3 text-left transition-colors",
                selectedCollectionId === collection.id
                  ? "bg-background text-foreground border-secondary border-l-4 font-medium shadow-[var(--shadow-input)]"
                  : hoveredCollection === collection.id
                    ? "bg-background/50 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-sm font-medium">{collection.title}</div>
                {collection.description && (
                  <div className="text-muted-foreground mt-1 truncate text-xs">{collection.description}</div>
                )}
              </div>
              <Badge variant="secondary" className="ml-2 text-xs">
                {collection.videoCount}
              </Badge>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            <p className="text-sm">No collections yet</p>
            <p className="text-xs">Create your first collection to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
