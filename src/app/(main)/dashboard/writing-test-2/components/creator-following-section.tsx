"use client";

import { useState, useEffect, useCallback } from "react";

import { Users, X, Instagram, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { creatorClientService, type CreatorVideo } from "@/lib/creator-client-service";

import { CreatorFollowForm } from "./creator-follow-form";
import { CreatorVideoCard } from "./creator-video-card";

interface CreatorFollowingSectionProps {
  onClose?: () => void;
}

interface VideoData {
  id: string;
  href: string;
  thumbnail: string;
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
    altText: video.title,
    views: formatViews(video.metrics.views),
    platform: video.platform,
    author: video.author,
    metrics: video.metrics,
  };
}

export function CreatorFollowingSection({ onClose }: CreatorFollowingSectionProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow Creator Form State
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "auto">("auto");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  const loadFollowedCreatorsVideos = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      console.log("📹 Loading followed creators' videos");
      const creatorVideos = await creatorClientService.getFollowedCreatorsVideos(user.uid, 20);
      const transformedVideos = creatorVideos.map(transformCreatorVideoToVideoData);
      setVideos(transformedVideos);
      setFilteredVideos(transformedVideos);
    } catch (error) {
      console.error("❌ Failed to load followed creators' videos:", error);
      setError("Failed to load videos from followed creators");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadFollowedCreatorsVideos();
    }
  }, [user?.uid, loadFollowedCreatorsVideos]);

  const followCreatorAPI = async (creatorUsername: string) => {
    const token = await user!.getIdToken();

    const response = await fetch("/api/creators/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: creatorUsername,
        userId: user!.uid,
        platform: platform === "auto" ? undefined : platform,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Failed to follow creator");
    }

    return data;
  };

  const handleFollowCreator = async () => {
    if (!username.trim() || !user?.uid) return;

    setIsFollowing(true);
    setFollowError(null);

    try {
      console.log(`🎭 Following creator: ${username}`);
      const data = await followCreatorAPI(username.trim());
      console.log(`✅ Successfully followed @${data.creator?.username}`);

      await loadFollowedCreatorsVideos();
      setUsername("");
    } catch (error) {
      console.error("❌ Failed to follow creator:", error);
      setFollowError(error instanceof Error ? error.message : "Failed to follow creator");
    } finally {
      setIsFollowing(false);
    }
  };

  // Filter videos based on search query and selected creator
  useEffect(() => {
    let filtered = videos;

    if (selectedCreator !== "all") {
      filtered = filtered.filter((video) => video.author.username === selectedCreator);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (video) =>
          video.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (video.author.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
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
          displayName: video.author.displayName ?? video.author.username,
          platform: video.platform,
        });
      }
      return acc;
    }, new Map());

    return Array.from(creators.values()).sort((a, b) =>
      a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
    );
  }, [videos]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Creator Following</h2>
          <p className="text-muted-foreground text-sm">Follow creators and discover their latest content</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Follow Creator Form */}
      <div className="border-border border-b p-4">
        <CreatorFollowForm
          username={username}
          platform={platform}
          isFollowing={isFollowing}
          followError={followError}
          onUsernameChange={setUsername}
          onPlatformChange={setPlatform}
          onSubmit={handleFollowCreator}
        />
      </div>

      {/* Search and Filter */}
      <div className="border-border border-b p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCreator} onValueChange={setSelectedCreator}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
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
                    <span className="truncate">{creator.displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Videos Grid */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading videos...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">{error}</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Users className="text-muted-foreground h-12 w-12" />
            <div className="space-y-2 text-center">
              <div className="text-foreground text-lg font-medium">No creators followed yet</div>
              <div className="text-muted-foreground text-sm">Follow creators to see their latest videos here</div>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No videos match your search</div>
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filteredVideos.map((video) => (
              <CreatorVideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
