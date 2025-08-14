"use client";

import React from "react";

import { Play, Video as VideoIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoData {
  id: string;
  href: string;
  thumbnail: string;
  thumbnailAvif?: string;
  videoSrc?: string;
  altText: string;
  views: string;
  platform: "instagram" | "tiktok";
  author: {
    username: string;
    displayName?: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface CollectionsVideoGridProps {
  videos: VideoData[];
  onVideoClick?: (video: VideoData) => void;
  columns?: number;
  loading?: boolean;
  className?: string;
}

const VideoThumbnail: React.FC<{
  thumbnail: string;
  thumbnailAvif?: string;
  altText: string;
  videoSrc?: string;
}> = ({ thumbnail, thumbnailAvif, altText, videoSrc }) => (
  <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)]">
    <div className="bg-muted relative h-full w-full overflow-hidden bg-cover bg-center">
      <div className="relative h-full w-full">
        <picture>
          {thumbnailAvif && <source type="image/avif" srcSet={`${thumbnailAvif} 1x, ${thumbnailAvif} 2x`} />}
          <img
            alt={altText}
            fetchPriority="auto"
            decoding="async"
            src={thumbnail}
            srcSet={`${thumbnail} 1x, ${thumbnail} 2x`}
            className="absolute inset-0 h-full w-full max-w-full min-w-full object-cover"
          />
        </picture>
        {videoSrc && (
          <video
            autoPlay
            playsInline
            muted
            loop
            poster={thumbnail}
            src={videoSrc}
            className="absolute inset-0 block h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  </div>
);

const VideoViews: React.FC<{ views: string }> = ({ views }) => (
  <div className="absolute bottom-0 flex h-24 w-full items-end bg-gradient-to-t from-black/50 to-transparent p-4">
    <div className="flex items-center gap-1 text-white">
      <Play className="h-4 w-4" />
      <strong className="text-base font-semibold">{views}</strong>
    </div>
  </div>
);

const VideoCard: React.FC<{
  video: VideoData;
  onVideoClick?: (video: VideoData) => void;
}> = ({ video, onVideoClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onVideoClick) {
      onVideoClick(video);
    }
  };

  return (
    <div className="rounded-[var(--radius-card)]">
      <div
        tabIndex={0}
        role="button"
        aria-label={`Watch ${video.altText}`}
        className="focus:ring-ring relative w-full cursor-pointer overflow-hidden rounded-[var(--radius-card)] transition-transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        <div className="aspect-[3/4]">
          <div className="absolute inset-0">
            <VideoThumbnail
              thumbnail={video.thumbnail}
              thumbnailAvif={video.thumbnailAvif}
              altText={video.altText}
              videoSrc={video.videoSrc}
            />
            <VideoViews views={video.views} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingGrid: React.FC<{ columns: number }> = ({ columns }) => {
  const getGridCols = () => {
    switch (columns) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-4";
    }
  };

  return (
    <div className={`grid w-full ${getGridCols()} gap-4 px-6`}>
      {Array.from({ length: columns * 2 }).map((_, index) => (
        <div key={index} className="aspect-[3/4] animate-pulse rounded-[var(--radius-card)] bg-muted" />
      ))}
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-12">
    <VideoIcon className="text-muted-foreground h-12 w-12" />
    <div className="space-y-2 text-center">
      <div className="text-foreground text-lg font-medium">No videos in this collection</div>
      <div className="text-muted-foreground">Add videos to see them here</div>
    </div>
  </div>
);

export const CollectionsVideoGrid: React.FC<CollectionsVideoGridProps> = ({
  videos,
  onVideoClick,
  columns = 4,
  loading = false,
  className,
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-4";
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingGrid columns={columns} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className={`grid w-full ${getGridCols()} gap-4 px-6`}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onVideoClick={onVideoClick} />
        ))}
      </div>
    </div>
  );
};

export type { VideoData, CollectionsVideoGridProps };
export default CollectionsVideoGrid;