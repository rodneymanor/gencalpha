"use client";
import { useState, useEffect, useCallback } from "react";

import { ClarityLoader } from "@/components/ui/loading";
import { VideoGridProcessingPlaceholder } from "@/components/ui/video-grid-processing-placeholder";
import { useAuth } from "@/contexts/auth-context";
import { useVideoProcessing } from "@/contexts/video-processing-context";
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

// eslint-disable-next-line complexity
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
  const { jobs } = useVideoProcessing();
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

  // Filter jobs for current collection and get active ones
  const activeJobs = jobs.filter((job) => {
    const isRelevant = collectionId === "all-videos" || job.collectionId === collectionId;
    const isActive = job.status === "pending" || job.status === "processing";
    return isRelevant && isActive;
  });

  // Keyboard navigation
  useVideoGridKeyboard({ selectedVideoId, videos, onVideoSelect });

  // Render state helpers
  const hasContent = videos.length > 0 || activeJobs.length > 0;
  const isEmptyLoading = loading && !hasContent;
  const isEmpty = !hasContent && !loading;

  if (isEmptyLoading) return <VideoGridLoadingState className={className} />;
  if (error) return <VideoGridErrorState error={error} onRetry={loadVideos} />;
  if (isEmpty) return <VideoGridEmptyState collectionId={collectionId} className={className} />;

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Processing placeholders first */}
        {activeJobs.map((job) => (
          <VideoGridProcessingPlaceholder
            key={job.id}
            job={job}
            onRetry={() => {
              // TODO: Implement retry logic
              console.log("Retry job:", job.id);
            }}
            onRemove={() => {
              // TODO: Implement remove logic
              console.log("Remove job:", job.id);
            }}
          />
        ))}

        {/* Existing videos */}
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
