"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MasonryVideoCard } from "@/components/ui/masonry-video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface MasonryVideoGridProps {
  videos: Video[];
  loading?: boolean;
  onVideoClick?: (video: Video) => void;
  onToggleFavorite?: (video: Video) => void;
  onDeleteVideo?: (video: Video) => void;
  onMoveVideo?: (video: Video) => void;
  showActions?: boolean;
  className?: string;
}

export function MasonryVideoGrid({
  videos,
  loading = false,
  onVideoClick,
  onToggleFavorite,
  onDeleteVideo,
  onMoveVideo,
  showActions = true,
  className,
}: MasonryVideoGridProps) {
  const { user } = useAuth();
  const { canWrite, canDelete } = useRBAC();
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive columns based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      if (width < 480) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4); // 4 columns for desktop screens
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute videos across columns for masonry layout
  const distributeVideos = useCallback(() => {
    const columnArrays: Video[][] = Array.from({ length: columns }, () => []);
    const columnHeights = Array.from({ length: columns }, () => 0);

    videos.forEach((video) => {
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnArrays[shortestColumnIndex].push(video);

      // Estimate height based on aspect ratio and content
      const baseHeight = 280; // Base height for 9:16 aspect ratio
      const titleHeight = Math.ceil((video.title?.length || 0) / 30) * 20; // Rough title height
      const metricHeight = video.metrics ? 24 : 0; // Height for metrics
      const estimatedHeight = baseHeight + titleHeight + metricHeight;

      columnHeights[shortestColumnIndex] += estimatedHeight + 16; // Add gap
    });

    return columnArrays;
  }, [videos, columns]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-[var(--pill-bg)] text-muted-foreground";
      case "youtube":
        return "bg-red-600 text-white";
      case "twitter":
        return "bg-blue-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleVideoClick = (video: Video) => {
    onVideoClick?.(video);
  };

  const handleToggleFavorite = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid || !video.id || !onToggleFavorite) return;

    try {
      const newFavoriteStatus = !video.favorite;
      await CollectionsService.setVideoFavorite(user.uid, video.id, newFavoriteStatus);
      onToggleFavorite({ ...video, favorite: newFavoriteStatus });
    } catch (error) {
      console.error("Failed to toggle video favorite:", error);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {Array.from({ length: Math.ceil(12 / columns) }).map((_, index) => (
                <div key={`loading-${colIndex}-${index}`} className="relative">
                  <Skeleton className={cn(
                    "w-full rounded-lg",
                    index % 2 === 0 ? "aspect-[9/16]" : "aspect-[9/14]"
                  )} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const videoColumns = distributeVideos();

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {videoColumns.map((columnVideos, colIndex) => (
          <div key={colIndex} className="space-y-4">
            {columnVideos.map((video) => (
              <MasonryVideoCard
                key={video.id}
                video={video}
                onVideoClick={handleVideoClick}
                onToggleFavorite={handleToggleFavorite}
                onDeleteVideo={onDeleteVideo}
                onMoveVideo={onMoveVideo}
                showActions={showActions}
                canWrite={canWrite}
                canDelete={canDelete}
                formatNumber={formatNumber}
                getPlatformBadgeColor={getPlatformBadgeColor}
              />
            ))}
          </div>
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <div className="py-12 text-center">
          <Play className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
          <h3 className="mb-2 text-lg font-semibold">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            Start building your viral video collection by adding inspiring content.
          </p>
          <Button>Add Video</Button>
        </div>
      )}
    </div>
  );
}