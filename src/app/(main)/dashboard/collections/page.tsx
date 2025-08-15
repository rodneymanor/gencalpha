"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoInsightsWrapper } from "@/components/video-insights";
import { useAuth } from "@/contexts/auth-context";
import { VideoInsightsProvider } from "@/contexts/video-insights-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";
import { RBACClientService } from "@/core/auth/rbac-client";

import { CategorySelector } from "../../collections/_components/category-selector";

import { AddVideoDialog } from "./_components/add-video-dialog";
import { CollectionsProvider, useCollections } from "./_components/collections-context";
import { CollectionsTabs } from "./_components/collections-tabs";
import { VideoGrid } from "./_components/video-grid";

// Helper function to load collections
const useLoadCollections = (user: any, dispatch: any) => {
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

function CollectionsContent() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("collections");
  const { state, dispatch } = useCollections();
  const { user } = useAuth();

  // Load collections from database
  useLoadCollections(user, dispatch);

  // Get the selected collection data
  const selectedCollection =
    selectedCollectionId === "all-videos" ? null : state.collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Collections</h1>
            <p className="text-muted-foreground">Organize and manage your video content</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsAddVideoDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </div>
        </div>

        {/* Collections Tabs */}
        <CollectionsTabs className="mb-6" defaultTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "collections" && (
          <>
            {/* Category Selector */}
            <CategorySelector
              selectedCategory={selectedCollectionId}
              onCategoryChange={setSelectedCollectionId}
              collections={state.collections}
              loading={state.loading}
            />

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Video Grid */}
              <div className="col-span-1 lg:col-span-12">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedCollectionId === "all-videos"
                        ? "All Videos"
                        : (selectedCollection?.title ?? "Collection Videos")}
                    </CardTitle>
                    {selectedCollection?.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{selectedCollection.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <VideoGrid collectionId={selectedCollectionId} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === "saved-collections" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="col-span-1 lg:col-span-12">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Collections</CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">Collections you&apos;ve saved for later</p>
                </CardHeader>
                <CardContent>
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Saved collections functionality coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
