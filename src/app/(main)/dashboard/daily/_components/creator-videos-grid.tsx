/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";

import { Play, UserPlus, Users, Instagram, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { creatorClientService, type CreatorVideo } from "@/lib/creator-client-service";

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
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "auto">("auto");
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFollowCreator = async () => {
    if (!username.trim() || !user?.uid) return;

    setIsFollowing(true);
    setError(null);

    try {
      console.log(`🎭 Following creator: ${username}`);

      // Get Firebase Auth token for API authentication
      const token = await user.getIdToken();

      const response = await fetch("/api/creators/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          userId: user.uid,
          platform: platform === "auto" ? undefined : platform,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to follow creator");
      }

      console.log(`✅ Successfully followed @${data.creator?.username}`);

      // Transform videos for display
      const transformedVideos =
        data.videos?.map((video: any) => ({
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
    <div className="bg-card border-border space-y-4 rounded-[var(--radius-card)] border p-6">
      <div className="flex items-center gap-2">
        <UserPlus className="text-primary h-5 w-5" />
        <h3 className="text-foreground text-lg font-semibold">Follow Creator</h3>
      </div>

      <div className="space-y-3">
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
          <Select value={platform} onValueChange={(value: "instagram" | "tiktok" | "auto") => setPlatform(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <div className="bg-secondary text-secondary-foreground flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-medium">
                    AI
                  </div>
                  <span>Auto-detect</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </div>
              </SelectItem>
              <SelectItem value="tiktok">
                <div className="flex items-center gap-2">
                  <div className="bg-foreground text-background flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-bold">
                    T
                  </div>
                  <span>TikTok</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleFollowCreator} disabled={!username.trim() || isFollowing} className="w-full">
          {isFollowing ? "Following..." : "Follow"}
        </Button>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}
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
              thumbnailAvif={video.thumbnailAvif || video.thumbnail}
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
  showFollowButton = true,
}) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>(propVideos || []);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>(propVideos || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
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
      const creatorVideos = await creatorClientService.getFollowedCreatorsVideos(user.uid, 50);
      const transformedVideos = creatorVideos.map(transformCreatorVideoToVideoData);
      setVideos(transformedVideos);
      setFilteredVideos(transformedVideos);
    } catch (error) {
      console.error("❌ Failed to load followed creators' videos:", error);
      setError("Failed to load videos from followed creators");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorFollowed = useCallback((newVideos: VideoData[]) => {
    setVideos((prevVideos) => {
      // Add new videos to the beginning, avoiding duplicates
      const existingIds = new Set(prevVideos.map((v) => v.id));
      const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id));
      const updatedVideos = [...uniqueNewVideos, ...prevVideos];
      setFilteredVideos(updatedVideos);
      return updatedVideos;
    });
  }, []);

  // Filter videos based on search query and selected creator
  useEffect(() => {
    let filtered = videos;

    // Filter by selected creator first
    if (selectedCreator !== "all") {
      filtered = filtered.filter((video) => video.author.username === selectedCreator);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (video) =>
          video.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (video.author.displayName && video.author.displayName.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    setFilteredVideos(filtered);
  }, [searchQuery, selectedCreator, videos]);

  // Get unique creators from videos
  const getUniqueCreators = useCallback(() => {
    const creators = videos.reduce((acc, video) => {
      const key = video.author.username;
      if (!acc.has(key)) {
        acc.set(key, {
          username: video.author.username,
          displayName: video.author.displayName || video.author.username,
          platform: video.platform,
        });
      }
      return acc;
    }, new Map());

    return Array.from(creators.values()).sort((a, b) =>
      a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
    );
  }, [videos]);

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
        {showFollowButton && <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />}
        <div className="px-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search creators, videos, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>
            <Select value={selectedCreator} onValueChange={setSelectedCreator} disabled>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        {showFollowButton && <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />}
        <div className="px-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search creators, videos, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>
            <Select value={selectedCreator} onValueChange={setSelectedCreator} disabled>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        {showFollowButton && <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />}
        <div className="px-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search creators, videos, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>
            <Select value={selectedCreator} onValueChange={setSelectedCreator} disabled>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Users className="text-muted-foreground h-12 w-12" />
          <div className="space-y-2 text-center">
            <div className="text-foreground text-lg font-medium">No creators followed yet</div>
            <div className="text-muted-foreground">Follow creators to see their latest videos here</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFollowButton && <FollowCreatorSection onCreatorFollowed={handleCreatorFollowed} />}
      <div className="px-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search creators, videos, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCreator} onValueChange={setSelectedCreator}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              {getUniqueCreators().map((creator) => (
                <SelectItem key={creator.username} value={creator.username}>
                  <div className="flex items-center gap-2">
                    {creator.platform === "instagram" && <Instagram className="h-4 w-4" />}
                    {creator.platform === "tiktok" && (
                      <div className="bg-foreground text-background flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-bold">
                        T
                      </div>
                    )}
                    <span>{creator.displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={`grid w-full ${getGridCols()} gap-4 px-6`}>
        {filteredVideos.map((video) => (
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
