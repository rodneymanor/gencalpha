"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AddVideoDialog } from "./_components/add-video-dialog";
import { CollectionsProvider } from "./_components/collections-context";
import { useCollections } from "./_components/collections-context";
import { CollectionsSidebar } from "./_components/collections-sidebar";
import { CreateCollectionDialog } from "./_components/create-collection-dialog";
import { VideoGrid } from "./_components/video-grid";
import { VideoInsightsDialog } from "./_components/video-insights-dialog";

function CollectionsContent() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const { state } = useCollections();

  // Get the selected collection data
  const selectedCollection =
    selectedCollectionId === "all-videos" ? null : state.collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Collections</h1>
            <p className="text-muted-foreground">Organize and manage your video content</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsAddVideoDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <CollectionsSidebar
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
            />
          </div>

          {/* Video Grid */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCollectionId === "all-videos"
                    ? "All Videos"
                    : selectedCollection?.title || "Collection Videos"}
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
      <CreateCollectionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <AddVideoDialog
        open={isAddVideoDialogOpen}
        onOpenChange={setIsAddVideoDialogOpen}
        selectedCollectionId={selectedCollectionId}
      />

      <VideoInsightsDialog />
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <CollectionsProvider>
      <CollectionsContent />
    </CollectionsProvider>
  );
}
