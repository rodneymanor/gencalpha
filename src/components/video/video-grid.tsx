"use client";

import Image from "next/image";

import { Play } from "lucide-react";

export interface VideoData {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  platform?: "instagram" | "tiktok" | "youtube";
  views?: number;
  likes?: number;
  duration?: string;
}

export interface CollectionData {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  thumbnail: string;
  creator: string;
}

export interface CreatorData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  videoCount: number;
  followers?: number;
}

export type GridItemData = VideoData | CollectionData | CreatorData;

export interface VideoCardProps {
  video: VideoData;
  onClick?: (video: VideoData) => void;
}

export interface CollectionCardProps {
  collection: CollectionData;
  onClick?: (collection: CollectionData) => void;
}

export interface CreatorCardProps {
  creator: CreatorData;
  onClick?: (creator: CreatorData) => void;
}

export interface VideoGridProps {
  videos: VideoData[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  onVideoClick?: (video: VideoData) => void;
  className?: string;
}

export interface CollectionGridProps {
  collections: CollectionData[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  onCollectionClick?: (collection: CollectionData) => void;
  className?: string;
}

export interface CreatorGridProps {
  creators: CreatorData[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  onCreatorClick?: (creator: CreatorData) => void;
  className?: string;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const formatNumber = (num?: number): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformBadge = () => {
    if (!video.platform) return null;

    const badgeStyles = {
      instagram: "bg-muted text-foreground",
      tiktok: "bg-black text-white",
      youtube: "bg-red-600 text-white",
    };

    return (
      <div className={`absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-medium ${badgeStyles[video.platform]}`}>
        {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
      </div>
    );
  };

  return (
    <div
      className="bg-card group cursor-pointer overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] transition-all duration-200"
      onClick={() => onClick?.(video)}
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-all duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Hover overlay with darkening effect */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/10" />

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-80">
          <Play className="h-12 w-12 fill-white text-white" />
        </div>

        {/* Platform badge */}
        {getPlatformBadge()}

        {/* Views badge */}
        {video.views && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white">
            <Play className="h-3 w-3 fill-white" />
            {formatNumber(video.views)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4">
        <div className="bg-muted rounded-pill flex h-8 w-8 flex-shrink-0 items-center justify-center">
          <span className="text-foreground text-xs font-medium">{video.creator.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{video.creator}</p>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground truncate text-xs">@{video.creator.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  return (
    <div
      className="bg-card cursor-pointer overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
      onClick={() => onClick?.(collection)}
    >
      <div className="bg-muted relative aspect-[16/9] overflow-hidden">
        <Image
          src={collection.thumbnail}
          alt={collection.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="bg-background/90 absolute right-2 bottom-2 rounded-[var(--radius-button)] px-2 py-1">
          <span className="text-foreground text-xs font-medium">{collection.videoCount} videos</span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-foreground truncate text-sm font-medium">{collection.name}</h3>
          {collection.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{collection.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-pill flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <span className="text-foreground text-xs font-medium">{collection.creator.slice(0, 1).toUpperCase()}</span>
          </div>
          <p className="text-muted-foreground truncate text-xs">{collection.creator}</p>
        </div>
      </div>
    </div>
  );
}

export function CreatorCard({ creator, onClick }: CreatorCardProps) {
  return (
    <div
      className="bg-card cursor-pointer overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
      onClick={() => onClick?.(creator)}
    >
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-pill relative h-16 w-16 overflow-hidden">
            <Image src={creator.avatar} alt={creator.name} fill className="object-cover" sizes="64px" />
          </div>
        </div>
        <div className="mb-3">
          <h3 className="text-foreground text-sm font-medium">{creator.name}</h3>
          <p className="text-muted-foreground text-xs">@{creator.handle}</p>
        </div>
        <div className="flex justify-center gap-4 text-center">
          <div>
            <p className="text-foreground text-sm font-medium">{creator.videoCount}</p>
            <p className="text-muted-foreground text-xs">Videos</p>
          </div>
          {creator.followers && (
            <div>
              <p className="text-foreground text-sm font-medium">{creator.followers.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs">Followers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getGridClass = (columns: 1 | 2 | 3 | 4 | 5 | 6) => {
  switch (columns) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case 5:
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    case 6:
      return "grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }
};

export function VideoGrid({ videos, columns = 3, onVideoClick, className }: VideoGridProps) {
  return (
    <div className={`grid gap-6 ${getGridClass(columns)} ${className ?? ""}`}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onClick={onVideoClick} />
      ))}
    </div>
  );
}

export function CollectionGrid({ collections, columns = 3, onCollectionClick, className }: CollectionGridProps) {
  return (
    <div className={`grid gap-6 ${getGridClass(columns)} ${className ?? ""}`}>
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} onClick={onCollectionClick} />
      ))}
    </div>
  );
}

export function CreatorGrid({ creators, columns = 3, onCreatorClick, className }: CreatorGridProps) {
  return (
    <div className={`grid gap-6 ${getGridClass(columns)} ${className ?? ""}`}>
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} onClick={onCreatorClick} />
      ))}
    </div>
  );
}
