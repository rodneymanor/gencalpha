"use client";

import { useState, useEffect, useCallback } from "react";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardSkeleton, LoadingBoundary, useAsyncOperation, useIsLoading } from "@/components/ui/loading";
import { VideoGridProcessingPlaceholder } from "@/components/ui/video-grid-processing-placeholder";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import { VideoAnalyzerSlideout } from "@/app/test-video-analyzer/_components/video-analyzer-slideout";
import { VideoGrid as NewVideoGrid, type VideoData } from "@/components/video/video-grid";
import { useAuth } from "@/contexts/auth-context";
import { useVideoProcessing } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";

import { useCollections } from "./collections-context";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { MoveVideoDialog } from "./move-video-dialog";

interface VideoGridProps {
  collectionId: string;
}

// eslint-disable-next-line complexity
export function VideoGrid({ collectionId }: VideoGridProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const { canWrite: _canWrite, canDelete: _canDelete } = useRBAC();
  const { jobs } = useVideoProcessing();
  const [movingVideo, setMovingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Transform Video to VideoData for the new grid component
  const transformVideoToVideoData = useCallback((video: Video): VideoData => {
    return {
      id: video.id || "",
      title: video.title || "Untitled Video",
      creator: video.metadata?.author || "Unknown Creator",
      thumbnail: video.thumbnailUrl || "/api/placeholder/300/400",
      platform: video.platform as "instagram" | "tiktok" | "youtube" | undefined,
      views: video.metrics?.views,
      likes: video.metrics?.likes,
      duration: video.metadata?.duration?.toString(),
    };
  }, []);

  // Handle click from new VideoGrid component
  const handleNewVideoGridClick = useCallback(
    (videoData: VideoData) => {
      // Find the original Video object by ID to preserve all metadata
      const originalVideo = state.videos.find(v => v.id === videoData.id);
      if (originalVideo) {
        setSelectedVideo(originalVideo);
      }
    },
    [state.videos],
  );

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


  // Transform Video to VideoAnalyzer format
  const transformToAnalyzerData = useCallback((video: Video) => {
    return {
      id: video.id || "",
      url: video.originalUrl || "",
      title: video.title || "Untitled Video",
      thumbnailUrl: video.thumbnailUrl || "/api/placeholder/300/400",
      transcript: video.transcript || "No transcript available",
      components: {
        hook: "Opening statement to grab attention",
        bridge: "Transition element connecting ideas",
        nugget: "Key value proposition or insight",
        wta: "Clear call to action"
      },
      metadata: {
        author: video.metadata?.author || "Unknown Creator",
        description: video.metadata?.description || "No description available",
        platform: video.platform || "unknown",
        duration: typeof video.metadata?.duration === 'number' ? video.metadata.duration : 0,
      },
      metrics: {
        likes: video.metrics?.likes || 0,
        comments: video.metrics?.comments || 0,
        saves: video.metrics?.saves || 0,
        shares: video.metrics?.shares || 0,
      },
      hashtags: video.hashtags || [],
      addedAt: video.addedAt || new Date().toISOString(),
      deepAnalysis: {
        contentThemes: ["Entertainment", "Educational", "Lifestyle"],
        targetAudience: "General audience",
        emotionalTriggers: ["Curiosity", "Excitement", "Inspiration"],
        scriptStructure: {
          introduction: "Engaging opening to capture attention",
          body: "Main content delivering value",
          conclusion: "Strong ending with clear next steps"
        },
        visualElements: ["Dynamic visuals", "Text overlays", "Smooth transitions"],
        performanceFactors: ["Strong hook", "Clear messaging", "Engaging visuals"],
        recommendedImprovements: ["Enhance audio quality", "Add more visual elements", "Improve call-to-action"]
      }
    };
  }, []);

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
          <div className="space-y-6">
            {/* Processing placeholders first - rendered above the new grid */}
            {activeJobs.length > 0 && (
              <div className="@container">
                <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
                  {activeJobs.map((job) => (
                    <VideoGridProcessingPlaceholder
                      key={job.id}
                      job={job}
                      onRetry={() => {
                        console.log("Retry job:", job.id);
                      }}
                      onRemove={() => {
                        console.log("Remove job:", job.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VideoGrid component */}
            {state.videos.length > 0 && (
              <NewVideoGrid
                videos={state.videos.map(transformVideoToVideoData)}
                columns={4}
                onVideoClick={handleNewVideoGridClick}
              />
            )}
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
        <UnifiedSlideout
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title || "Video Analysis"}
          config={ClaudeArtifactConfig}
        >
          <VideoAnalyzerSlideout video={transformToAnalyzerData(selectedVideo)} />
        </UnifiedSlideout>
      )}
    </>
  );
}
