"use client";

import Image from "next/image";

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

interface VideoCardProps {
  video: Video;
  canWrite?: boolean;
  canDelete?: boolean;
  onVideoClick: (video: Video) => void;
  onToggleFavorite: (video: Video) => void;
  onMoveVideo: (video: Video) => void;
  onDeleteVideo: (video: Video) => void;
}

const formatViewCount = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const getPlatformStyle = (platform: string) => {
  const styles = {
    tiktok: "bg-neutral-900 text-neutral-50",
    instagram: "bg-primary-100 text-primary-700",
    youtube: "bg-destructive-100 text-destructive-700",
    default: "bg-neutral-100 text-neutral-700",
  };
  return styles[platform.toLowerCase() as keyof typeof styles] || styles.default;
};

export function VideoCard({
  video,
  canWrite,
  canDelete,
  onVideoClick,
  onToggleFavorite,
  onMoveVideo,
  onDeleteVideo,
}: VideoCardProps) {
  return (
    <div
      className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[var(--radius-card)] bg-neutral-100 shadow-[var(--shadow-soft-drop)] transition-colors duration-150 hover:bg-neutral-200"
      onClick={() => onVideoClick(video)}
    >
      {video.thumbnailUrl && (
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-neutral-900/0 transition-colors group-hover:bg-neutral-900/50">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            className="rounded-pill bg-neutral-50/90 backdrop-blur-sm transition-all duration-150 hover:bg-neutral-50"
          >
            <Play className="h-6 w-6 fill-neutral-900 text-neutral-900" />
          </Button>
        </div>

        <div className="absolute top-2 right-2 left-2 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Badge className={cn("text-xs", getPlatformStyle(video.platform))}>{video.platform}</Badge>
            {video.favorite && <Star className="fill-warning-500 text-warning-500 h-4 w-4" />}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-neutral-50/20 opacity-0 backdrop-blur-sm transition-all duration-150 group-hover:opacity-100 hover:bg-neutral-50/30"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-neutral-50" />
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
              {canWrite && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(video);
                  }}
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
              {canWrite && (
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
              {canDelete && (
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

        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-neutral-900/80 to-transparent p-3">
          {video.metrics && video.metrics.views > 0 && (
            <div className="flex items-center gap-3 text-xs text-neutral-100">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViewCount(video.metrics.views)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
