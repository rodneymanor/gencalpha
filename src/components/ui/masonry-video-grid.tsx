"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { Play, Star, StarOff, MoreHorizontal, Eye, Trash2, Copy, Move } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "youtube":
        return "bg-red-600 text-white";
      case "twitter":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
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
              <div
                key={video.id}
                className="group bg-muted relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative aspect-[9/16]">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <div className="text-muted-foreground text-center">
                        <Play className="mx-auto mb-2 h-6 w-6" />
                        <p className="text-xs">No Preview</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/50">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <Play className="h-6 w-6 fill-white text-white" />
                      </Button>
                    </div>

                    {showActions && (
                      <div className="absolute top-2 right-2 left-2 flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                          <Badge className={cn("text-xs", getPlatformBadgeColor(video.platform))}>
                            {video.platform}
                          </Badge>
                          {video.favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVideoClick(video);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Insights
                            </DropdownMenuItem>
                            {canWrite && onToggleFavorite && (
                              <DropdownMenuItem
                                onClick={(e) => handleToggleFavorite(video, e)}
                              >
                                {video.favorite ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Remove from favorites
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Add to favorites
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            {canWrite && onMoveVideo && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveVideo(video);
                                  }}
                                >
                                  <Move className="mr-2 h-4 w-4" />
                                  Move to Collection
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle copy
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy to Collection
                                </DropdownMenuItem>
                              </>
                            )}
                            {canDelete && onDeleteVideo && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteVideo(video);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h3 className="mb-1 line-clamp-2 text-sm font-medium text-white">{video.title}</h3>
                      {video.metrics && (
                        <div className="flex items-center gap-3 text-xs text-white/80">
                          {video.metrics.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(video.metrics.views)}
                            </span>
                          )}
                          {video.metrics.likes > 0 && <span>❤️ {formatNumber(video.metrics.likes)}</span>}
                          {video.metrics.comments > 0 && <span>💬 {formatNumber(video.metrics.comments)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional content below thumbnail for masonry effect */}
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.description || "Viral content inspiration for your next creation"}
                  </p>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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