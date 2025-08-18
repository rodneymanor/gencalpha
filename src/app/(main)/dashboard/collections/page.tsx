"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/loading";
import { CollectionCombobox } from "@/components/ui/collection-combobox";
import { EditableText } from "@/components/ui/edit-button";
import { VideoInsightsWrapper } from "@/components/video-insights";
import { GenericSlideout } from "@/components/video/generic-slideout";
import { VideoAnalyzerSlideout } from "@/app/test-video-analyzer/_components/video-analyzer-slideout";
import { VideoGrid as NewVideoGrid, type VideoData } from "@/components/video/video-grid";
import { useAuth } from "@/contexts/auth-context";
import { VideoInsightsProvider } from "@/contexts/video-insights-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { CollectionsService, type Collection, type Video } from "@/lib/collections";

import { AddVideoDialog } from "./_components/add-video-dialog";
import { CollectionsProvider, useCollections } from "./_components/collections-context";
import { CollectionsTabs } from "./_components/collections-tabs";
import { VideoGrid } from "./_components/video-grid";

// Helper hook for collection editing
const useCollectionEditing = (
  user: { uid?: string } | null,
  selectedCollectionId: string,
  selectedCollection: Collection | null,
  canWrite: boolean,
  dispatch: (action: { type: string; payload: any }) => void
) => {
  const handleEditTitle = useCallback(async () => {
    if (!user?.uid || !selectedCollection || !canWrite || selectedCollectionId === "all-videos") return;
    
    const newTitle = prompt("Edit collection title:", selectedCollection.title);
    if (newTitle && newTitle !== selectedCollection.title) {
      try {
        await CollectionsService.updateCollection(user.uid, selectedCollectionId, {
          title: newTitle,
          updatedAt: new Date().toISOString()
        });
        
        // Update local state
        dispatch({
          type: "UPDATE_COLLECTION",
          payload: {
            id: selectedCollectionId,
            updates: { title: newTitle, updatedAt: new Date().toISOString() }
          }
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
          updatedAt: new Date().toISOString()
        });
        
        // Update local state
        dispatch({
          type: "UPDATE_COLLECTION",
          payload: {
            id: selectedCollectionId,
            updates: { description: newDescription, updatedAt: new Date().toISOString() }
          }
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
const useLoadCollections = (user: { uid?: string } | null, dispatch: (action: LoadCollectionsAction) => void) => {
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
function CollectionsTabContent({ selectedCollectionId }: { selectedCollectionId: string }) {
  return (
    <>
      {/* Main Content */}
      <div className="mt-6">
        {/* Video Grid */}
        <VideoGrid collectionId={selectedCollectionId} />
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
  setIsAddVideoDialogOpen
}: {
  selectedCollectionId: string;
  selectedCollection: Collection | null;
  canWrite: boolean;
  handleEditTitle: () => void;
  handleEditDescription: () => void;
  setIsAddVideoDialogOpen: (open: boolean) => void;
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
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedCollection?.title ?? "Collection"}
            </h1>
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
        <Button onClick={() => setIsAddVideoDialogOpen(true)} variant="soft" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>
    </div>
  );
}

// Saved videos tab content component
function SavedCollectionsTabContent() {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { user } = useAuth();

  const loadSavedVideos = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const result = await RBACClientService.getCollectionVideos(user.uid);
      // Filter for videos marked as favorite
      const favoriteVideos = result.videos.filter(video => video.favorite === true);
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
      const originalVideo = savedVideos.find(v => v.id === videoData.id);
      if (originalVideo) {
        setSelectedVideo(originalVideo);
      }
    },
    [savedVideos],
  );

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


  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>Saved Videos</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">Videos you&apos;ve saved for later</p>
            </CardHeader>
            <CardContent>

              {isLoading ? (
                <div className="@container">
                  <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
                    {Array.from({ length: 8 }, (_, index) => (
                      <div key={`loading-skeleton-${index}`} className="relative aspect-[9/16]">
                        <CardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : savedVideos.length > 0 ? (
                <NewVideoGrid
                  videos={savedVideos.map(transformVideoToVideoData)}
                  columns={4}
                  onVideoClick={handleNewVideoGridClick}
                />
              ) : (
                <div className="py-12 text-center">
                  <Bookmark className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
                  <h3 className="mb-2 text-lg font-semibold">No saved videos</h3>
                  <p className="text-muted-foreground mb-4">
                    Videos you favorite will appear here for quick access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedVideo && (
        <GenericSlideout
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title || "Video Analysis"}
        >
          <VideoAnalyzerSlideout video={transformToAnalyzerData(selectedVideo)} />
        </GenericSlideout>
      )}
    </>
  );
}

function CollectionsContent() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("collections");
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
    dispatch
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <CollectionsHeader
          selectedCollectionId={selectedCollectionId}
          selectedCollection={selectedCollection ?? null}
          canWrite={canWrite}
          handleEditTitle={handleEditTitle}
          handleEditDescription={handleEditDescription}
          setIsAddVideoDialogOpen={setIsAddVideoDialogOpen}
        />

        {/* Collections Tabs */}
        <CollectionsTabs
          className="mb-6"
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
          <CollectionsTabContent selectedCollectionId={selectedCollectionId} />
        ) : (
          <SavedCollectionsTabContent />
        )}
      </div>

      {/* Dialogs */}
      <AddVideoDialog
        open={isAddVideoDialogOpen}
        onOpenChange={setIsAddVideoDialogOpen}
        selectedCollectionId={selectedCollectionId}
      />

      <VideoInsightsWrapper />
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
