"use client";

import { useCallback, useState, useEffect } from "react";

import { Video } from "lucide-react";

import CollectionsVideoGrid, { type VideoData } from "./_components/collections-video-grid";
import { Button } from "@/components/ui/button";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import type { Video as VideoType, Collection } from "@/lib/collections";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

import { CategorySelector } from "./_components/category-selector";

export default function CollectionsPage() {
  const { user } = useAuth();
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewVideoForm, setShowNewVideoForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all-videos");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const handleVideoClick = useCallback(
    (videoData: VideoData) => {
      const video = transformVideoDataToVideo(videoData);
      openVideo(video);
    },
    [openVideo],
  );

  // Helper function to format views
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Transform collection videos to VideoData format
  const transformCollectionVideoToVideoData = useCallback((video: VideoType): VideoData => {
    return {
      id: video.id || "",
      href: video.originalUrl,
      thumbnail: video.thumbnailUrl,
      videoSrc: video.iframeUrl || video.directUrl,
      altText: video.title,
      views: video.metrics?.views ? formatViews(video.metrics.views) : "0",
      platform: video.platform as "instagram" | "tiktok",
      author: {
        username: video.metadata?.author || "Unknown",
        displayName: video.metadata?.author || "Unknown",
      },
      metrics: {
        views: video.metrics?.views || 0,
        likes: video.metrics?.likes || 0,
        comments: video.metrics?.comments || 0,
        shares: video.metrics?.shares || 0,
      },
    };
  }, []);

  const handleCategoryChange = useCallback((collectionId: string) => {
    setSelectedCategory(collectionId);
    console.log("Collection changed:", collectionId);
  }, []);

  const loadCollections = useCallback(async () => {
    if (!user?.uid) return;
    
    setCollectionsLoading(true);
    try {
      const result = await RBACClientService.getUserCollections(user.uid);
      console.log("📚 [Collections Page] Loaded collections:", result.collections.length);
      setCollections(result.collections);
    } catch (error) {
      console.error("❌ [Collections Page] Failed to load collections:", error);
    } finally {
      setCollectionsLoading(false);
    }
  }, [user?.uid]);

  const loadVideos = useCallback(async () => {
    if (!user?.uid) return;

    setVideosLoading(true);
    try {
      const result = await RBACClientService.getCollectionVideos(
        user.uid,
        selectedCategory === "all-videos" ? undefined : selectedCategory,
      );
      console.log("🎥 [Collections Page] Loaded videos:", result.videos.length);
      const transformedVideos = result.videos.map(transformCollectionVideoToVideoData);
      setVideos(transformedVideos);
    } catch (error) {
      console.error("❌ [Collections Page] Failed to load videos:", error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, [user?.uid, selectedCategory, transformCollectionVideoToVideoData]);

  useEffect(() => {
    if (user?.uid) {
      loadCollections();
    }
  }, [user?.uid, loadCollections]);

  useEffect(() => {
    if (user?.uid) {
      loadVideos();
    }
  }, [user?.uid, selectedCategory, loadVideos]);

  return (
    <div className="h-full font-sans">
      <div className="mx-auto h-full max-w-6xl">
        <div className="px-4 pt-6 pb-8 md:px-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-foreground text-xl font-semibold md:text-2xl">My Collections</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Organize and manage your video content collections.
              </p>
            </div>
            <Button onClick={() => setShowNewVideoForm(!showNewVideoForm)} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              New Video
            </Button>
          </div>
          <div className="mt-6">
            <CategorySelector 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange}
              collections={collections}
              loading={collectionsLoading}
            />
            <div className="mt-6">
              <CollectionsVideoGrid
                videos={videos}
                onVideoClick={handleVideoClick}
                columns={5}
                loading={videosLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}