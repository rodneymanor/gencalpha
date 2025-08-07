"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Play, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { CreatorService, type CreatorVideo } from "@/lib/creator-service";

// --- TYPE DEFINITIONS ---
interface VideoData {
  id: string;
  href: string;
  thumbnail: string;
  thumbnailAvif?: string;
  videoSrc?: string;
  altText: string;
  views: string;
  isPinned?: boolean;
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

interface CreatorVideosGridProps {
  videos?: VideoData[];
  onVideoClick?: (video: VideoData) => void;
  columns?: number;
  showFollowButton?: boolean;
}

// --- HELPER FUNCTIONS ---
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function transformCreatorVideoToVideoData(video: CreatorVideo): VideoData {
  return {
    id: video.id!,
    href: video.originalUrl,
    thumbnail: video.thumbnailUrl,
    videoSrc: video.iframeUrl || video.directUrl,
    altText: video.title,
    views: formatViews(video.metrics.views),
    platform: video.platform,
    author: video.author,
    metrics: video.metrics,
  };
}

// --- FOLLOW CREATOR COMPONENT ---
interface FollowCreatorProps {
  onCreatorFollowed?: (videos: VideoData[]) => void;
}

const FollowCreatorSection: React.FC<FollowCreatorProps> = ({ onCreatorFollowed }) => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFollowCreator = async () => {
    if (!username.trim() || !user?.uid) return;

    setIsFollowing(true);
    setError(null);

    try {
      console.log(`🎭 Following creator: ${username}`);
      
      const response = await fetch("/api/creators/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to follow creator");
      }

      console.log(`✅ Successfully followed @${data.creator?.username}`);
      
      // Transform videos for display
      const transformedVideos = data.videos?.map((video: any) => ({
        id: video.id,
        href: video.videoUrl,
        thumbnail: video.thumbnailUrl,
        videoSrc: video.videoUrl,
        altText: video.title,
        views: formatViews(video.metrics.views),
        platform: data.creator?.platform,
        author: {
          username: data.creator?.username,
          displayName: data.creator?.displayName,
        },
        metrics: video.metrics,
      })) || [];

      if (onCreatorFollowed) {
        onCreatorFollowed(transformedVideos);
      }

      setUsername("");
    } catch (error) {
      console.error("❌ Failed to follow creator:", error);
      setError(error instanceof Error ? error.message : "Failed to follow creator");
    } finally {
      setIsFollowing(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-[var(--radius-card)] border-border border">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Follow Creator</h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter username (e.g., @creator)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFollowCreator();
            }
          }}
          className="flex-1"
        />
        <Button 
          onClick={handleFollowCreator}
          disabled={!username.trim() || isFollowing}
          className="px-6"
        >
          {isFollowing ? "Following..." : "Follow"}
        </Button>
      </div>
      
      {error && (
        <div className="text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

// --- REUSABLE COMPONENTS ---

const PinnedBadge: React.FC = () => (
  <div className="absolute top-2 left-2 z-10">
    <div className="bg-destructive text-destructive-foreground flex items-center gap-2 rounded-[var(--radius-button)] px-2 py-1 text-xs font-medium">
      Pinned
    </div>
  </div>
);

interface VideoThumbnailProps {
  thumbnail: string;
  thumbnailAvif: string;
  altText: string;
  videoSrc?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ thumbnail, thumbnailAvif, altText, videoSrc }) => (
  <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)]">
    <div className="bg-muted relative h-full w-full overflow-hidden bg-cover bg-center">
      <div className="relative h-full w-full">
        <picture>
          <source type="image/avif" srcSet={`${thumbnailAvif} 1x, ${thumbnailAvif} 2x`} />
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

interface VideoViewsProps {
  views: string;
}

const VideoViews: React.FC<VideoViewsProps> = ({ views }) => (
  <div className="absolute bottom-0 flex h-24 w-full items-end bg-gradient-to-t from-black/50 to-transparent p-4">
    <div className="flex items-center gap-1 text-white">
      <Play className="h-4 w-4" />
      <strong className="text-base font-semibold">{views}</strong>
    </div>
  </div>
);

interface VideoCardProps {
  video: VideoData;
  onVideoClick?: (video: VideoData) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
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
            const syntheticEvent = {
              preventDefault: () => {},
            } as React.MouseEvent<HTMLDivElement>;
            handleClick(syntheticEvent);
          }
        }}
      >
        {/* Aspect ratio container using Tailwind aspect ratio */}
        <div className="aspect-[3/4]">
          <div className="absolute inset-0">
            {video.isPinned && <PinnedBadge />}
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

const CreatorVideosGrid: React.FC<CreatorVideosGridProps> = ({ 
  videos: propVideos, 
  onVideoClick, 
  columns = 5, 
  showFollowButton = true 
}) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>(propVideos || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load followed creators' videos on mount
  useEffect(() => {
    if (!propVideos && user?.uid) {
      loadFollowedCreatorsVideos();
    }
  }, [user?.uid, propVideos]);

  const loadFollowedCreatorsVideos = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      console.log("📹 Loading followed creators' videos");
      const creatorVideos = await CreatorService.getFollowedCreatorsVideos(user.uid, 50);
      const transformedVideos = creatorVideos.map(transformCreatorVideoToVideoData);
      setVideos(transformedVideos);
    } catch (error) {
      console.error("❌ Failed to load followed creators' videos:", error);
      setError("Failed to load videos from followed creators");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorFollowed = useCallback((newVideos: VideoData[]) => {
    setVideos(prevVideos => {
      // Add new videos to the beginning, avoiding duplicates
      const existingIds = new Set(prevVideos.map(v => v.id));
      const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v.id));
      return [...uniqueNewVideos, ...prevVideos];
    });
  }, []);

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
        return "grid-cols-5";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showFollowButton && (
          <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />
        )}
        <div className="px-6">
          <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading videos from followed creators...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {showFollowButton && (
          <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />
        )}
        <div className="px-6">
          <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        {showFollowButton && (
          <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />
        )}
        <div className="px-6">
          <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-foreground">No creators followed yet</div>
            <div className="text-muted-foreground">
              Follow creators to see their latest videos here
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFollowButton && (
        <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />
      )}
      <div className="px-6">
        <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Latest videos from {videos.length} creators you follow
        </p>
      </div>
      <div className={`grid w-full ${getGridCols()} gap-4 px-6`}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onVideoClick={onVideoClick} />
        ))}
      </div>
    </div>
  );
};

// Export the main component and types
export { CreatorVideosGrid, FollowCreatorSection };
export type { VideoData, CreatorVideosGridProps };
export default CreatorVideosGrid;
