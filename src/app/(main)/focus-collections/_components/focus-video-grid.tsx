"use client";
import { ClarityLoader } from "@/components/ui/loading";

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { FocusVideoCard } from "./focus-video-card";
import { useVideoGridKeyboard } from "./video-grid-keyboard";
import { VideoGridLoadingState, VideoGridErrorState, VideoGridEmptyState } from "./video-grid-states";

interface FocusVideoGridProps {
  collectionId: string;
  selectedVideoId?: string;
  onVideoSelect: (video: Video) => void;
  onVideoMove?: (video: Video) => void;
  onVideoCopy?: (video: Video) => void;
  onVideoDelete?: (video: Video) => void;
  className?: string;
}

export function FocusVideoGrid({
  collectionId,
  selectedVideoId,
  onVideoSelect,
  onVideoMove,
  onVideoCopy,
  onVideoDelete,
  className,
}: FocusVideoGridProps) {
  const { user } = useAuth();
  const { canWrite, canDelete } = useRBAC();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    if (!user?.uid) return;

    console.log("🔍 [Focus Video Grid] Loading videos for collection:", collectionId, "user:", user.uid);
    setLoading(true);
    setError(null);

    try {
      const result = await RBACClientService.getCollectionVideos(
        user.uid,
        collectionId === "all-videos" ? undefined : collectionId,
      );

      console.log("🔍 [Focus Video Grid] Loaded videos:", result.videos.length);
      setVideos(result.videos);
    } catch (error) {
      console.error("❌ [Focus Video Grid] Failed to load videos:", error);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, collectionId]);

  useEffect(() => {
    if (user?.uid) {
      loadVideos();
    }
  }, [user?.uid, collectionId, loadVideos]);

  const handleToggleFavorite = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      const newFavoriteStatus = !video.favorite;
      await CollectionsService.setVideoFavorite(user.uid, video.id, newFavoriteStatus);

      setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, favorite: newFavoriteStatus } : v)));
    } catch (error) {
      console.error("Failed to toggle video favorite:", error);
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      await CollectionsService.deleteVideo(user.uid, video.id);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  // Keyboard navigation
  useVideoGridKeyboard({ selectedVideoId, videos, onVideoSelect });

  // Loading state
  if (loading && videos.length === 0) {
    return <VideoGridLoadingState className={className} />;
  }

  // Error state
  if (error) {
    return <VideoGridErrorState error={error} onRetry={loadVideos} />;
  }

  // Empty state
  if (videos.length === 0 && !loading) {
    return <VideoGridEmptyState collectionId={collectionId} className={className} />;
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <FocusVideoCard
            key={video.id}
            video={video}
            isSelected={selectedVideoId === video.id}
            onClick={onVideoSelect}
            onToggleFavorite={handleToggleFavorite}
            onMove={onVideoMove}
            onCopy={onVideoCopy}
            onDelete={onVideoDelete ? () => onVideoDelete(video) : handleDeleteVideo}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && videos.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <ClarityLoader size="inline" />
            <span>Loading more videos...</span>
          </div>
        </div>
      )}
    </div>
  );
}
