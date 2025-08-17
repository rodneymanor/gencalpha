"use client";

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
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface MasonryVideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
  onToggleFavorite?: (video: Video, e: React.MouseEvent) => void;
  onDeleteVideo?: (video: Video) => void;
  onMoveVideo?: (video: Video) => void;
  showActions: boolean;
  canWrite: boolean;
  canDelete: boolean;
  formatNumber: (num: number) => string;
  getPlatformBadgeColor: (platform: string) => string;
}

// eslint-disable-next-line complexity
export function MasonryVideoCard({
  video,
  onVideoClick,
  onToggleFavorite,
  onDeleteVideo,
  onMoveVideo,
  showActions,
  canWrite,
  canDelete,
  formatNumber,
  getPlatformBadgeColor,
}: MasonryVideoCardProps) {
  return (
    <div
      className="group bg-muted relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
      onClick={() => onVideoClick(video)}
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
                      onVideoClick(video);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Insights
                  </DropdownMenuItem>
                  {canWrite && onToggleFavorite && (
                    <DropdownMenuItem
                      onClick={(e) => onToggleFavorite(video, e)}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional content below thumbnail for masonry effect */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {video.description ?? "Viral content inspiration for your next creation"}
        </p>
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge key={`${video.id}-${tag}`} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}