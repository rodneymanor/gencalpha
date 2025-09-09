"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus, Bookmark } from "lucide-react";

import { VideoModalOverlay } from "@/components/modals/video-modal-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionCombobox } from "@/components/ui/collection-combobox";
import { EditableText } from "@/components/ui/edit-button";
import { CardSkeleton } from "@/components/ui/loading";
import { VideoGrid as NewVideoGrid, type VideoData } from "@/components/video/video-grid";
import { useAuth } from "@/contexts/auth-context";
import { VideoInsightsProvider } from "@/contexts/video-insights-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { CollectionsService, type Collection, type Video } from "@/lib/collections";
import { VideoInsights } from "@/types/video-insights";

import { AddVideoDialog } from "./_components/add-video-dialog";
import { CollectionManagementPanel } from "./_components/collection-management-panel";
import { CollectionsProvider, useCollections } from "./_components/collections-context";
import { CollectionsTabs } from "./_components/collections-tabs";
import { VideoGrid } from "./_components/video-grid";
import { VideoManagementPanel } from "./_components/video-management-panel";

// Helper hook for collection editing
const useCollectionEditing = (
  user: { uid?: string } | null,
  selectedCollectionId: string,
  selectedCollection: Collection | null,
  canWrite: boolean,
  dispatch: (action: { type: string; payload: any }) => void,
) => {
  const handleEditTitle = useCallback(async () => {
    if (!user?.uid || !selectedCollection || !canWrite || selectedCollectionId === "all-videos") return;

    const newTitle = prompt("Edit collection title:", selectedCollection.title);
    if (newTitle && newTitle !== selectedCollection.title) {
      try {
        await CollectionsService.updateCollection(user.uid, selectedCollectionId, {
          title: newTitle,
          updatedAt: new Date().toISOString(),
        });

        // Update local state
        dispatch({
          type: "UPDATE_COLLECTION",
          payload: {
            id: selectedCollectionId,
            updates: { title: newTitle, updatedAt: new Date().toISOString() },
          },
        });
      } catch (error) {
        console.error("Failed to update collection title:", error);
        alert("Failed to update title. Please try again.");
      }
    }
  }, [user?.uid, selectedCollection, canWrite, selectedCollectionId, dispatch]);

  const handleEditDescription = useCallback(async () => {
    if (!user?.uid || !selectedCollection || !canWrite || selectedCollectionId === "all-videos") return;

    const newDescription = prompt("Edit collection description:", selectedCollection.description || "");
    if (newDescription !== null && newDescription !== selectedCollection.description) {
      try {
        await CollectionsService.updateCollection(user.uid, selectedCollectionId, {
          description: newDescription,
          updatedAt: new Date().toISOString(),
        });

        // Update local state
        dispatch({
          type: "UPDATE_COLLECTION",
          payload: {
            id: selectedCollectionId,
            updates: { description: newDescription, updatedAt: new Date().toISOString() },
          },
        });
      } catch (error) {
        console.error("Failed to update collection description:", error);
        alert("Failed to update description. Please try again.");
      }
    }
  }, [user?.uid, selectedCollection, canWrite, selectedCollectionId, dispatch]);

  return { handleEditTitle, handleEditDescription };
};

// Helper function to load collections
type LoadCollectionsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_COLLECTIONS"; payload: Collection[] };
const useLoadCollections = (user: { uid?: string } | null, dispatch: (action: any) => void) => {
  const loadCollections = useCallback(async () => {
    if (!user?.uid) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await RBACClientService.getUserCollections(user.uid);
      console.log("🔍 [Collections Page] Loaded collections:", result.collections.length);

      // Sort: favorites first, then by updatedAt desc
      const sortedCollections = [...result.collections].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      dispatch({ type: "SET_COLLECTIONS", payload: sortedCollections });
    } catch (error) {
      console.error("Failed to load collections:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (user?.uid) {
      loadCollections();
    }
  }, [user?.uid, loadCollections]);
};

// Collections tab content component
function CollectionsTabContent({
  selectedCollectionId,
  onVideoClick,
  isPanelOpen,
}: {
  selectedCollectionId: string;
  onVideoClick: (video: Video) => void;
  isPanelOpen?: boolean;
}) {
  return (
    <>
      {/* Main Content */}
      <div className="mt-6">
        {/* Video Grid */}
        <VideoGrid
          collectionId={selectedCollectionId}
          onVideoClick={onVideoClick}
          forceColumns={isPanelOpen ? 1 : undefined}
        />
      </div>
    </>
  );
}

// Header component
function CollectionsHeader({
  selectedCollectionId,
  selectedCollection,
  canWrite,
  handleEditTitle,
  handleEditDescription,
  setIsAddVideoDialogOpen,
  onOpenCollectionPanel,
  onOpenVideoPanel,
}: {
  selectedCollectionId: string;
  selectedCollection: Collection | null;
  canWrite: boolean;
  handleEditTitle: () => void;
  handleEditDescription: () => void;
  setIsAddVideoDialogOpen: (open: boolean) => void;
  onOpenCollectionPanel: () => void;
  onOpenVideoPanel: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        {selectedCollectionId === "all-videos" ? (
          <h1 className="text-3xl font-bold tracking-tight">All Videos</h1>
        ) : (
          <EditableText
            onEdit={handleEditTitle}
            editButtonSize="md"
            showEditButton={canWrite && selectedCollection !== null}
          >
            <h1 className="text-3xl font-bold tracking-tight">{selectedCollection?.title ?? "Collection"}</h1>
          </EditableText>
        )}

        {selectedCollectionId === "all-videos" ? (
          <p className="text-muted-foreground mt-1">All your video content in one place</p>
        ) : (
          <EditableText
            onEdit={handleEditDescription}
            editButtonSize="sm"
            showEditButton={canWrite && selectedCollection !== null}
            className="mt-1"
          >
            <p className="text-muted-foreground">
              {selectedCollection?.description ?? "Organize and manage your video content"}
            </p>
          </EditableText>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={onOpenCollectionPanel} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Collection
        </Button>
        <Button onClick={onOpenVideoPanel} variant="soft" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>
    </div>
  );
}

// Shared utility: Transform Video to VideoData for grid display
const transformVideoToVideoData = (video: Video): VideoData => {
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
};

// Transform Video to VideoInsights format helper function
const transformToVideoInsights = (video: Video): VideoInsights => {
  const transcript = video.transcript || "No transcript available";

  // Create script components from transcript if available
  const scriptComponents =
    transcript !== "No transcript available"
      ? processScriptComponents([
          {
            id: `${video.id}-hook`,
            type: "hook",
            label: "Hook",
            content: transcript.split(".")[0] + "." || "Opening statement to grab attention",
            icon: "H",
          },
          {
            id: `${video.id}-bridge`,
            type: "bridge",
            label: "Bridge",
            content: transcript.split(".").slice(1, 3).join(".") || "Transition element connecting ideas",
            icon: "B",
          },
          {
            id: `${video.id}-nugget`,
            type: "nugget",
            label: "Golden Nugget",
            content: transcript.split(".").slice(3, 6).join(".") || "Key value proposition or insight",
            icon: "G",
          },
          {
            id: `${video.id}-cta`,
            type: "cta",
            label: "Call to Action",
            content: transcript.split(".").slice(-2).join(".") || "Clear call to action",
            icon: "C",
          },
        ])
      : [];

  const resolvedVideoUrl = video.iframeUrl || video.directUrl || video.originalUrl || "";

  console.log("🎬 transformToVideoInsights - Video URL resolution:", {
    videoId: video.id,
    iframeUrl: video.iframeUrl,
    directUrl: video.directUrl,
    originalUrl: video.originalUrl,
    resolvedVideoUrl,
    hasVideoUrl: !!resolvedVideoUrl,
  });

  return {
    id: video.id || "",
    videoUrl: resolvedVideoUrl,
    thumbnailUrl: video.thumbnailUrl || "/api/placeholder/300/400",
    title: video.title || "Untitled Video",
    scriptData: {
      id: video.id || "",
      title: video.title || "Untitled Video",
      fullScript: transcript,
      components: scriptComponents,
      metrics: {
        totalWords: transcript.split(" ").length,
        totalDuration: video.metadata?.duration || 30,
        avgWordsPerSecond: transcript.split(" ").length / (video.metadata?.duration || 30),
        readabilityScore: 75 + Math.floor(Math.random() * 20),
        engagementScore: 70 + Math.floor(Math.random() * 25),
      },
      createdAt: video.addedAt || new Date().toISOString(),
      updatedAt: video.addedAt || new Date().toISOString(),
      tags: video.hashtags || [],
      metadata: {
        platform: video.platform || "unknown",
        genre: "educational",
        targetAudience: "general",
      },
    },
    metadata: {
      title: video.title ?? "Untitled Video",
      duration: video.metadata?.duration ?? 30,
      resolution: "1080x1920",
      format: "mp4",
      platform: video.platform ?? "unknown",
      viewCount: video.metrics?.views ?? 0,
      likeCount: video.metrics?.likes ?? 0,
      commentCount: video.metrics?.comments ?? 0,
      shareCount: video.metrics?.shares ?? 0,
      uploadDate: video.addedAt ?? new Date().toISOString(),
      tags: video.hashtags ?? [],
      description: video.metadata?.description ?? "No description available",
      author: {
        name: video.metadata?.author ?? "Unknown Creator",
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
          simple: transcript.split(" ").length * 0.8,
          complex: transcript.split(" ").length * 0.2,
          percentage: 80,
        },
        recommendations: ["Use shorter sentences for better flow", "Include more emotional language"],
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
        predictedDropoffPoints: [],
      },
      seo: {
        keywordDensity: [
          { word: "content", count: 5, density: 3.2 },
          { word: "video", count: 4, density: 2.8 },
        ],
        titleOptimization: {
          score: 80,
          suggestions: ["Add power words for emotional impact"],
        },
        descriptionOptimization: {
          score: 75,
          suggestions: ["Add relevant hashtags"],
        },
        hashtagSuggestions: video.hashtags?.slice(0, 6) || ["viral", "content"],
      },
    },
    createdAt: video.addedAt || new Date().toISOString(),
    updatedAt: video.addedAt || new Date().toISOString(),
  };
};

// Saved videos tab content component with improved responsive design
function SavedCollectionsTabContent({
  selectedVideo,
  setSelectedVideo,
  isPanelOpen,
}: {
  selectedVideo: Video | null;
  setSelectedVideo: (video: Video | null) => void;
  isPanelOpen?: boolean;
}) {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadSavedVideos = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const result = await RBACClientService.getCollectionVideos(user.uid);
      // Filter for videos marked as favorite
      const favoriteVideos = result.videos.filter((video) => video.favorite === true);

      // Debug: Log video data to check metadata
      console.log(
        "Loaded saved videos:",
        favoriteVideos.map((v) => ({
          id: v.id,
          title: v.title,
          hasMetadata: !!v.metadata,
          author: v.metadata?.author,
          platform: v.platform,
        })),
      );

      setSavedVideos(favoriteVideos);
    } catch (error) {
      console.error("Failed to load saved videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadSavedVideos();
    }
  }, [user?.uid, loadSavedVideos]);

  // Use shared transformation function with debug logging
  const transformVideoToVideoDataWithLogging = useCallback((video: Video): VideoData => {
    const transformed = transformVideoToVideoData(video);
    console.log("🔄 transformVideoToVideoData:", {
      input_video_id: video.id,
      input_has_metadata: !!video.metadata,
      input_author: video.metadata?.author,
      output_creator: transformed.creator,
      full_input: video,
    });
    return transformed;
  }, []);

  // Handle click/activation from new VideoGrid component (opens panel)
  const handleNewVideoGridClick = useCallback(
    (videoData: VideoData) => {
      console.log("🖱️ VIDEO CLICKED - VideoData received:", {
        id: videoData.id,
        title: videoData.title,
        creator: videoData.creator,
        platform: videoData.platform,
      });

      console.log(
        "📚 savedVideos array:",
        savedVideos.map((v) => ({
          id: v.id,
          title: v.title,
          hasMetadata: !!v.metadata,
          author: v.metadata?.author,
        })),
      );

      // Find the original Video object by ID to preserve all metadata
      const originalVideo = savedVideos.find((v) => v.id === videoData.id);

      if (originalVideo) {
        console.log("✅ Found original video:", {
          id: originalVideo.id,
          title: originalVideo.title,
          hasMetadata: !!originalVideo.metadata,
          author: originalVideo.metadata?.author,
          fullMetadata: originalVideo.metadata,
          fullVideo: originalVideo,
        });
        setSelectedVideo(originalVideo);
      } else {
        console.error("❌ Could not find original video with ID:", videoData.id);
        console.log(
          "Available IDs:",
          savedVideos.map((v) => v.id),
        );
      }
    },
    [savedVideos],
  );

  // Track selectedVideo changes
  useEffect(() => {
    console.log("📌 selectedVideo state changed:", {
      hasVideo: !!selectedVideo,
      id: selectedVideo?.id,
      title: selectedVideo?.title,
      hasMetadata: !!selectedVideo?.metadata,
      author: selectedVideo?.metadata?.author,
      fullVideo: selectedVideo,
    });
  }, [selectedVideo]);

  // Handle keyboard selection (auto-change video when panel is open)
  const handleVideoSelection = useCallback(
    (videoData: VideoData, index: number) => {
      // Find the original Video object by ID to preserve all metadata
      const originalVideo = savedVideos.find((v) => v.id === videoData.id);

      // If panel is open (selectedVideo is not null), auto-change the video
      if (selectedVideo && originalVideo) {
        setSelectedVideo(originalVideo);
        console.log("Auto-changed video via keyboard:", videoData.title);
      } else {
        // Panel is closed, just log the selection for visual feedback
        console.log("Video selected via keyboard (panel closed):", videoData.title);
      }
    },
    [savedVideos, selectedVideo],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="col-span-1 lg:col-span-12">
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Saved Videos</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Videos you&apos;ve saved for later</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {isLoading ? (
              <div className="@container">
                <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @sm:gap-4 @lg:grid-cols-3 @lg:gap-5 @xl:grid-cols-4 @xl:gap-6">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div key={`loading-skeleton-${index}`} className="relative aspect-[9/16]">
                      <CardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ) : savedVideos.length > 0 ? (
              <div className="@container">
                <div className="relative">
                  <NewVideoGrid
                    videos={savedVideos.map(transformVideoToVideoDataWithLogging)}
                    columns={isPanelOpen ? 1 : 4}
                    onVideoClick={handleNewVideoGridClick}
                    onVideoSelect={handleVideoSelection}
                    enableKeyboardNavigation={true}
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center sm:py-12">
                <Bookmark className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50 sm:mb-4 sm:h-16 sm:w-16" />
                <h3 className="mb-1.5 text-base font-semibold sm:mb-2 sm:text-lg">No saved videos</h3>
                <p className="text-muted-foreground mb-3 px-4 text-xs sm:mb-4 sm:text-base">
                  Videos you favorite will appear here for quick access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CollectionsContent() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("collections");

  // Panel management state
  const [isCollectionPanelOpen, setIsCollectionPanelOpen] = useState(false);
  const [isVideoPanelOpen, setIsVideoPanelOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Derive panel open state
  const isPanelOpen = !!selectedVideo;

  // Filter replaced by explicit collection picker
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const { canWrite } = useRBAC();

  // Load collections from database
  useLoadCollections(user, dispatch);

  // Get the selected collection data
  const selectedCollection =
    selectedCollectionId === "all-videos" ? null : state.collections.find((c) => c.id === selectedCollectionId);

  // Use editing hook
  const { handleEditTitle, handleEditDescription } = useCollectionEditing(
    user,
    selectedCollectionId,
    selectedCollection ?? null,
    canWrite,
    dispatch as (action: { type: string; payload: any }) => void,
  );

  // Handle collection creation
  const handleCollectionCreated = useCallback(
    async (collectionId: string) => {
      console.log("🎉 [Collections] New collection created:", collectionId);
      // Refresh collections list
      if (user?.uid) {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
          const result = await RBACClientService.getUserCollections(user.uid);
          const sortedCollections = [...result.collections].sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          dispatch({ type: "SET_COLLECTIONS", payload: sortedCollections });

          // Auto-select the new collection
          setSelectedCollectionId(collectionId);
        } catch (error) {
          console.error("Failed to refresh collections:", error);
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    },
    [user?.uid, dispatch],
  );

  // Handle video addition
  const handleVideoAdded = useCallback(
    async (videoId: string, collectionId: string) => {
      console.log("🎥 [Collections] Video added:", videoId, "to collection:", collectionId);
      // Refresh collections to update video counts
      if (user?.uid) {
        try {
          const result = await RBACClientService.getUserCollections(user.uid);
          const sortedCollections = [...result.collections].sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          dispatch({ type: "SET_COLLECTIONS", payload: sortedCollections });
        } catch (error) {
          console.error("Failed to refresh collections after video addition:", error);
        }
      }
    },
    [user?.uid, dispatch],
  );

  // Get current video list for navigation
  const getCurrentVideos = (): Video[] => {
    if (activeTab === "collections") {
      return state.videos || [];
    }
    // For saved videos tab, this would need to be lifted up or handled differently
    return [];
  };

  // Navigation handlers for modal
  const handleVideoNavigation = (direction: "prev" | "next") => {
    const currentVideos = getCurrentVideos();
    if (currentVideos.length === 0 || !selectedVideo) return;

    const currentIndex = currentVideos.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : currentVideos.length - 1;
    } else {
      newIndex = currentIndex < currentVideos.length - 1 ? currentIndex + 1 : 0;
    }

    const newVideo = currentVideos[newIndex];
    if (newVideo) {
      setSelectedVideo(newVideo);
    }
  };

  // Check if navigation is available
  const getNavigationState = () => {
    const currentVideos = getCurrentVideos();
    if (currentVideos.length === 0 || !selectedVideo) {
      return { canNavigatePrev: false, canNavigateNext: false };
    }

    const currentIndex = currentVideos.findIndex((v) => v.id === selectedVideo.id);
    return {
      canNavigatePrev: currentVideos.length > 1,
      canNavigateNext: currentVideos.length > 1,
    };
  };

  return (
    <div className="bg-background flex min-h-screen w-full" id="collections-main-content">
      {/* Main Content Area - No longer needs margin adjustment */}
      <div className="flex flex-1 justify-center overflow-x-hidden overflow-y-scroll">
        <div className="container mx-auto px-6" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <div className="pt-6">
            <CollectionsHeader
              selectedCollectionId={selectedCollectionId}
              selectedCollection={selectedCollection ?? null}
              canWrite={canWrite}
              handleEditTitle={handleEditTitle}
              handleEditDescription={handleEditDescription}
              setIsAddVideoDialogOpen={setIsAddVideoDialogOpen}
              onOpenCollectionPanel={() => setIsCollectionPanelOpen(true)}
              onOpenVideoPanel={() => setIsVideoPanelOpen(true)}
            />
          </div>

          {/* Collections Tabs */}
          <CollectionsTabs
            className="mb-4 sm:mb-6"
            defaultTab={activeTab}
            onTabChange={setActiveTab}
            rightContent={
              <CollectionCombobox
                selectedCollectionId={selectedCollectionId}
                onChange={setSelectedCollectionId}
                placeholder="All Videos"
              />
            }
          />

          {/* Tab Content */}
          {activeTab === "collections" ? (
            <CollectionsTabContent
              selectedCollectionId={selectedCollectionId}
              onVideoClick={setSelectedVideo}
              isPanelOpen={isPanelOpen}
            />
          ) : (
            <SavedCollectionsTabContent
              selectedVideo={selectedVideo}
              setSelectedVideo={setSelectedVideo}
              isPanelOpen={isPanelOpen}
            />
          )}

          {/* Bottom margin for spacing */}
          <div className="mb-6"></div>
        </div>
      </div>

      {/* Video Modal Overlay - Instagram-style modal */}
      <VideoModalOverlay
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onVideoChange={handleVideoNavigation}
        {...getNavigationState()}
        transformToVideoInsights={transformToVideoInsights}
        callbacks={{
          onCopy: (content: string, componentType?: string) => {
            console.log(`Copied ${componentType ?? "content"}:`, content);
            // Copy to clipboard
            navigator.clipboard
              .writeText(content)
              .then(() => {
                console.log("Successfully copied to clipboard");
              })
              .catch((err) => {
                console.error("Failed to copy to clipboard:", err);
              });
          },
          onDownload: () => {
            console.log("Downloaded video insights:", selectedVideo?.title);
            // TODO: Implement actual download functionality
          },
          onVideoPlay: () => {
            console.log("Video started playing");
          },
          onVideoPause: () => {
            console.log("Video paused");
          },
        }}
      />

      {/* Dialogs */}
      <AddVideoDialog
        open={isAddVideoDialogOpen}
        onOpenChange={setIsAddVideoDialogOpen}
        selectedCollectionId={selectedCollectionId}
      />

      {/* Collection Management Panel */}
      <CollectionManagementPanel
        isOpen={isCollectionPanelOpen}
        onClose={() => setIsCollectionPanelOpen(false)}
        onCollectionCreated={handleCollectionCreated}
      />

      {/* Video Management Panel */}
      <VideoManagementPanel
        isOpen={isVideoPanelOpen}
        onClose={() => setIsVideoPanelOpen(false)}
        initialCollectionId={selectedCollectionId !== "all-videos" ? selectedCollectionId : ""}
        onVideoAdded={handleVideoAdded}
      />
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <VideoProcessingProvider>
      <VideoInsightsProvider>
        <CollectionsProvider>
          <CollectionsContent />
        </CollectionsProvider>
      </VideoInsightsProvider>
    </VideoProcessingProvider>
  );
}
