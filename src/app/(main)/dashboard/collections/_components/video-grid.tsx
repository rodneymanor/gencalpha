"use client";

import { useState, useEffect, useCallback } from "react";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardSkeleton, LoadingBoundary, useAsyncOperation, useIsLoading } from "@/components/ui/loading";
import { VideoGridProcessingPlaceholder } from "@/components/ui/video-grid-processing-placeholder";
import { VideoSlideoutPlayer } from "@/components/video/video-slideout-player";
import { useAuth } from "@/contexts/auth-context";
import { useVideoProcessing } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";

import { useCollections } from "./collections-context";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { MoveVideoDialog } from "./move-video-dialog";
import { VideoCard } from "./video-card";

interface VideoGridProps {
  collectionId: string;
}

export function VideoGrid({ collectionId }: VideoGridProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const { canWrite, canDelete } = useRBAC();
  const { jobs } = useVideoProcessing();
  const [movingVideo, setMovingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const loadVideosFn = useCallback(async () => {
    if (!user?.uid) return { videos: [] as Video[] };
    const result = await RBACClientService.getCollectionVideos(
      user.uid,
      collectionId === "all-videos" ? undefined : collectionId,
    );
    return result;
  }, [user?.uid, collectionId]);

  const onSuccessCallback = useCallback(
    (result: { videos: Video[] }) => {
      dispatch({ type: "SET_VIDEOS", payload: result.videos });
    },
    [dispatch],
  );

  const { execute: loadVideos } = useAsyncOperation("collections-videos", loadVideosFn, {
    type: "section",
    action: "fetch",
    message: "Loading your video collection...",
    onSuccess: onSuccessCallback,
  });

  useEffect(() => {
    if (user?.uid) {
      loadVideos();
    }
  }, [user?.uid, collectionId, loadVideos]);

  const isLoading = useIsLoading("collections-videos");

  // Filter processing jobs for current collection
  const relevantJobs = jobs.filter((job) => {
    // Show all jobs for "all-videos" collection
    if (collectionId === "all-videos") return true;
    // Show jobs that match the current collection ID
    return job.collectionId === collectionId;
  });

  // Only show active jobs (pending, processing) in the grid
  const activeJobs = relevantJobs.filter((job) => job.status === "pending" || job.status === "processing");

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleToggleFavorite = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      const newFavoriteStatus = !video.favorite;
      await CollectionsService.setVideoFavorite(user.uid, video.id, newFavoriteStatus);

      dispatch({
        type: "UPDATE_VIDEO",
        payload: {
          id: video.id,
          updates: { favorite: newFavoriteStatus },
        },
      });
    } catch (error) {
      console.error("Failed to toggle video favorite:", error);
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      await CollectionsService.deleteVideo(user.uid, video.id);
      dispatch({ type: "DELETE_VIDEO", payload: video.id });
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  // Loader boundary fallback
  const gridFallback = (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={`loading-skeleton-${index}`} className="relative aspect-[9/16]">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <LoadingBoundary id="collections-videos" fallback={gridFallback}>
          <div className="@container">
            <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
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
              {state.videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  canWrite={canWrite}
                  canDelete={canDelete}
                  onVideoClick={handleVideoClick}
                  onToggleFavorite={handleToggleFavorite}
                  onMoveVideo={setMovingVideo}
                  onDeleteVideo={setDeletingVideo}
                />
              ))}
            </div>
          </div>
        </LoadingBoundary>

        {state.videos.length === 0 && activeJobs.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <Play className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {collectionId === "all-videos"
                ? "Start by adding your first video to build your collection."
                : "This collection is empty. Add some videos to get started."}
            </p>
            <Button>Add Video</Button>
          </div>
        )}
      </div>

      <MoveVideoDialog
        video={movingVideo}
        open={!!movingVideo}
        onOpenChange={(open) => !open && setMovingVideo(null)}
        onSuccess={() => {
          setMovingVideo(null);
          loadVideos();
        }}
      />

      <DeleteConfirmDialog
        title="Delete Video"
        description={`Are you sure you want to delete "${deletingVideo?.title}"? This action cannot be undone.`}
        open={!!deletingVideo}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
        onConfirm={async () => {
          if (deletingVideo) {
            await handleDeleteVideo(deletingVideo);
            setDeletingVideo(null);
          }
        }}
      />

      {selectedVideo && (
        <VideoSlideoutPlayer isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} video={selectedVideo} />
      )}
    </>
  );
}
