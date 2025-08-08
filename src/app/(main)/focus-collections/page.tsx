"use client";

import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import { VideoSlideout } from "@/components/video/video-slideout";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { Video } from "@/lib/collections";

import { CollectionHeader } from "./_components/collection-header";
import { FocusCollectionsSidebar } from "./_components/focus-collections-sidebar";
import { FocusVideoGrid } from "./_components/focus-video-grid";
import { MobileOverlays } from "./_components/mobile-overlays";

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

// Helper functions
interface RawCollection {
  id: string;
  title: string;
  description?: string;
  videos?: unknown[];
}

const transformCollections = (collections: RawCollection[]): Collection[] => {
  return collections.map((col) => ({
    id: col.id,
    title: col.title,
    description: col.description,
    videoCount: col.videos?.length ?? 0,
  }));
};

export default function FocusCollectionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileInsightsOpen, setIsMobileInsightsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  // Load collections
  const loadCollections = useCallback(async () => {
    if (!user?.uid) return;

    console.log("🔍 [Focus Collections] Loading collections for user:", user.uid);
    setLoading(true);

    try {
      const result = await RBACClientService.getUserCollections(user.uid);
      console.log("🔍 [Focus Collections] Loaded collections:", result.collections.length);

      const collectionsWithCount = transformCollections(result.collections);
      setCollections(collectionsWithCount);
    } catch (error) {
      console.error("❌ [Focus Collections] Failed to load collections:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadCollections();
    }
  }, [user?.uid, loadCollections]);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleCreateCollection = () => {
    console.log("Create collection clicked");
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    if (window.innerWidth < 1024) {
      setIsMobileInsightsOpen(true);
    } else {
      setIsSlideoutOpen(true);
    }
  };

  const handleVideoMove = (video: Video) => {
    console.log("Move video:", video.id);
  };

  const handleVideoCopy = (video: Video) => {
    console.log("Copy video:", video.id);
  };

  const handleVideoDelete = (video: Video) => {
    console.log("Delete video:", video.id);
  };

  if (loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading collections...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <MobileOverlays
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isMobileInsightsOpen={isMobileInsightsOpen}
        setIsMobileInsightsOpen={setIsMobileInsightsOpen}
        collections={collections}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
        selectedVideo={selectedVideo}
        onBackToDashboard={handleBackToDashboard}
        onCreateCollection={handleCreateCollection}
      />

      {/* Desktop: Left Sidebar (borderless, tonal separation handled by bg) */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <FocusCollectionsSidebar
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={setSelectedCollectionId}
          onBackToDashboard={handleBackToDashboard}
          onCreateCollection={handleCreateCollection}
          className="h-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <CollectionHeader
              selectedCollectionId={selectedCollectionId}
              collections={collections}
              selectedVideo={selectedVideo}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenMobileInsights={() => setIsMobileInsightsOpen(true)}
            />

            <div className="flex-1 overflow-y-auto">
              <FocusVideoGrid
                collectionId={selectedCollectionId}
                selectedVideoId={selectedVideo?.id}
                onVideoSelect={handleVideoSelect}
                onVideoMove={handleVideoMove}
                onVideoCopy={handleVideoCopy}
                onVideoDelete={handleVideoDelete}
              />
            </div>
          </div>
        </div>

        {/* Desktop: Slideout video panel for details */}
        <VideoSlideout isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} video={selectedVideo} />
      </div>
    </div>
  );
}
