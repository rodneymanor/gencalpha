"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoInsightsWrapper } from "@/components/video-insights";
import { VideoInsightsProvider } from "@/contexts/video-insights-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";

import { CollectionsDropdown } from "../../collections/_components/collections-dropdown";

import { AddVideoDialog } from "./_components/add-video-dialog";
import { CollectionsProvider, useCollections } from "./_components/collections-context";
import { VideoGrid } from "./_components/video-grid";

function CollectionsContent() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const { state } = useCollections();

  // Get the selected collection data
  const selectedCollection =
    selectedCollectionId === "all-videos" ? null : state.collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Video Collections</h1>
              <p className="text-muted-foreground">Organize and manage your video content</p>
            </div>
            <CollectionsDropdown
              selectedCollection={selectedCollectionId}
              onCollectionChange={setSelectedCollectionId}
              collections={state.collections}
              loading={state.loading}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsAddVideoDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </div>
        </div>

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
