"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoGridStatesProps {
  loading: boolean;
  hasVideos: boolean;
  collectionId: string;
  className?: string;
}

export function VideoGridLoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={`loading-skeleton-${index}`} className="aspect-[9/16]">
            <Skeleton className="h-full w-full rounded-[var(--radius-card)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoGridErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="text-destructive mb-4 text-lg font-semibold">Error</div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function VideoGridEmptyState({ collectionId, className }: { collectionId: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      <div className="text-center">
        <Play className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
        <h3 className="mb-2 font-sans text-lg font-semibold">No videos found</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {collectionId === "all-videos"
            ? "Start by adding your first video to build your collection."
            : "This collection is empty. Add some videos to get started."}
        </p>
        <Button variant="outline">Add Video</Button>
      </div>
    </div>
  );
}
