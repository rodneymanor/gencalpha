"use client";

import { useState, useEffect, useCallback } from "react";

import { Play } from "lucide-react";

import { VideoInsightsPanel } from "@/components/video-insights-panel/video-insights-panel";
import { Button } from "@/components/ui/button";
import { CardSkeleton, LoadingBoundary, useAsyncOperation, useIsLoading } from "@/components/ui/loading";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import { VideoGridProcessingPlaceholder } from "@/components/ui/video-grid-processing-placeholder";
import { VideoGrid as NewVideoGrid, type VideoData } from "@/components/video/video-grid";
import { useAuth } from "@/contexts/auth-context";
import { useVideoProcessing } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";
import { VideoInsights } from "@/types/video-insights";
import { processScriptComponents } from "@/hooks/use-script-analytics";

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

  // Handle click/activation from new VideoGrid component (opens panel)
  const handleNewVideoGridClick = useCallback(
    (videoData: VideoData) => {
      // Find the original Video object by ID to preserve all metadata
      const originalVideo = state.videos.find((v) => v.id === videoData.id);
      if (originalVideo) {
        setSelectedVideo(originalVideo);
      }
    },
    [state.videos],
  );

  // Handle keyboard selection (auto-change video when panel is open)
  const handleVideoSelection = useCallback(
    (videoData: VideoData, index: number) => {
      // Find the original Video object by ID to preserve all metadata
      const originalVideo = state.videos.find((v) => v.id === videoData.id);
      
      // If panel is open (selectedVideo is not null), auto-change the video
      if (selectedVideo && originalVideo) {
        setSelectedVideo(originalVideo);
        console.log("Auto-changed video via keyboard:", videoData.title);
      } else {
        // Panel is closed, just log the selection for visual feedback
        console.log("Video selected via keyboard (panel closed):", videoData.title);
      }
    },
    [state.videos, selectedVideo],
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

  // Transform Video to VideoInsights format
  const transformToVideoInsights = useCallback((video: Video): VideoInsights => {
    const transcript = video.transcript || "No transcript available";
    
    // Create script components from transcript if available
    const scriptComponents = transcript !== "No transcript available" 
      ? processScriptComponents([
          {
            id: `${video.id}-hook`,
            type: "hook",
            label: "Hook",
            content: transcript.split('.')[0] + '.' || "Opening statement to grab attention",
            icon: "H",
          },
          {
            id: `${video.id}-bridge`, 
            type: "bridge",
            label: "Bridge",
            content: transcript.split('.').slice(1, 3).join('.') || "Transition element connecting ideas",
            icon: "B",
          },
          {
            id: `${video.id}-nugget`,
            type: "nugget", 
            label: "Golden Nugget",
            content: transcript.split('.').slice(3, 6).join('.') || "Key value proposition or insight",
            icon: "G",
          },
          {
            id: `${video.id}-cta`,
            type: "cta",
            label: "Call to Action", 
            content: transcript.split('.').slice(-2).join('.') || "Clear call to action",
            icon: "C",
          },
        ])
      : [];

    return {
      id: video.id || "",
      videoUrl: video.iframeUrl || video.directUrl || video.originalUrl || "",
      thumbnailUrl: video.thumbnailUrl || "/api/placeholder/300/400",
      title: video.title || "Untitled Video",
      scriptData: {
        id: video.id || "",
        title: video.title || "Untitled Video",
        fullScript: transcript,
        components: scriptComponents,
        metrics: {
          totalWords: transcript.split(' ').length,
          totalDuration: video.metadata?.duration || 30,
          avgWordsPerSecond: transcript.split(' ').length / (video.metadata?.duration || 30),
          readabilityScore: 75 + Math.floor(Math.random() * 20), // Mock score 75-95
          engagementScore: 70 + Math.floor(Math.random() * 25), // Mock score 70-95
        },
        createdAt: video.addedAt || new Date().toISOString(),
        updatedAt: video.addedAt || new Date().toISOString(),
        tags: video.hashtags || [],
        metadata: {
          platform: video.platform || "unknown",
          genre: "educational", // Default
          targetAudience: "general",
        },
      },
      metadata: {
        title: video.title || "Untitled Video",
        duration: video.metadata?.duration || 30,
        resolution: "1080x1920", // Default for mobile videos
        format: "mp4",
        platform: video.platform || "unknown",
        viewCount: video.metrics?.views || 0,
        likeCount: video.metrics?.likes || 0,
        commentCount: video.metrics?.comments || 0,
        shareCount: video.metrics?.shares || 0,
        uploadDate: video.addedAt || new Date().toISOString(),
        tags: video.hashtags || [],
        description: video.metadata?.description || "No description available",
        author: {
          name: video.metadata?.author || "Unknown Creator",
          verified: false,
        },
      },
      suggestions: {
        hooks: [
          {
            id: `${video.id}-hook-question`,
            type: "question",
            content: "What if one simple change could transform your content?",
            strength: "high",
            rationale: "Questions create curiosity gaps that viewers want filled",
            estimatedEngagement: 85,
          },
          {
            id: `${video.id}-hook-statistic`,
            type: "statistic", 
            content: "89% of successful videos use this opening pattern",
            strength: "medium",
            rationale: "Statistics provide credibility and authority",
            estimatedEngagement: 78,
          },
        ],
        content: [
          {
            id: `${video.id}-improve-hook`,
            type: "improvement",
            target: "opening",
            suggestion: "Add a visual pattern interrupt in the first 2 seconds",
            impact: "high",
            effort: "medium",
          },
          {
            id: `${video.id}-add-testimonial`,
            type: "addition",
            target: "middle", 
            suggestion: "Include social proof or success story",
            impact: "medium",
            effort: "low",
          },
        ],
      },
      analysis: {
        readability: {
          score: 75 + Math.floor(Math.random() * 20),
          grade: "8th Grade",
          complexity: "medium",
          sentenceLength: {
            average: 12,
            longest: 25,
            shortest: 3,
          },
          wordComplexity: {
            simple: transcript.split(' ').length * 0.8,
            complex: transcript.split(' ').length * 0.2,
            percentage: 80,
          },
          recommendations: [
            "Use shorter sentences for better flow",
            "Include more emotional language",
            "Add visual cues to support text",
          ],
        },
        engagement: {
          hookStrength: 70 + Math.floor(Math.random() * 25),
          paceVariation: 65 + Math.floor(Math.random() * 30),
          emotionalTone: {
            positive: 70,
            negative: 5,
            neutral: 25,
          },
          callToActionStrength: 75 + Math.floor(Math.random() * 20),
          retentionPotential: 70 + Math.floor(Math.random() * 25),
          predictedDropoffPoints: [
            {
              timestamp: 8.5,
              reason: "Transition needs improvement",
              confidence: 0.72,
            },
          ],
        },
        seo: {
          keywordDensity: [
            { word: "content", count: 5, density: 3.2 },
            { word: "video", count: 4, density: 2.8 },
            { word: "tips", count: 3, density: 2.1 },
          ],
          titleOptimization: {
            score: 80,
            suggestions: [
              "Add power words for emotional impact",
              "Include target year for relevance",
            ],
          },
          descriptionOptimization: {
            score: 75,
            suggestions: [
              "Add relevant hashtags",
              "Include clear call-to-action",
            ],
          },
          hashtagSuggestions: video.hashtags?.slice(0, 6) || ["viral", "content", "tips"],
        },
      },
      createdAt: video.addedAt || new Date().toISOString(),
      updatedAt: video.addedAt || new Date().toISOString(),
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
                onVideoSelect={handleVideoSelection}
                enableKeyboardNavigation={true}
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
          config={{
            ...ClaudeArtifactConfig,
            showHeader: false, // Let VideoInsightsPanel handle its own header
            showCloseButton: true, // VideoInsightsPanel has its own close button
            adjustsContent: true, // Ensure content adjustment works
            backdrop: false,
            modal: false,
            animationType: "claude",
            position: "right",
            width: "lg",
          }}
        >
          <VideoInsightsPanel
            videoInsights={transformToVideoInsights(selectedVideo)}
            onCopy={(content: string, componentType?: string) => {
              console.log(`Copied ${componentType ?? "content"}:`, content);
            }}
            onDownload={(videoInsights: VideoInsights) => {
              console.log("Downloaded video insights:", videoInsights.title);
            }}
            onVideoPlay={() => {
              console.log("Video started playing");
            }}
            onVideoPause={() => {
              console.log("Video paused");
            }}
            onClose={() => setSelectedVideo(null)}
            showDownload={true}
            showMetrics={true}
          />
        </UnifiedSlideout>
      )}
    </>
  );
}
