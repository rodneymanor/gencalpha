"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionsProvider } from "./_components/collections-context";
import { CollectionsSidebar } from "./_components/collections-sidebar";
import { VideoGrid } from "./_components/video-grid";
import { CreateCollectionDialog } from "./_components/create-collection-dialog";
import { AddVideoDialog } from "./_components/add-video-dialog";
import { VideoInsightsDialog } from "./_components/video-insights-dialog";

export default function CollectionsPage() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);

  return (
    <CollectionsProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Video Collections</h1>
              <p className="text-muted-foreground">
                Organize and manage your video content
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddVideoDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Video
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
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
                    {selectedCollectionId === "all-videos" ? "All Videos" : "Collection Videos"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoGrid collectionId={selectedCollectionId} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <CreateCollectionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
        
        <AddVideoDialog
          open={isAddVideoDialogOpen}
          onOpenChange={setIsAddVideoDialogOpen}
          selectedCollectionId={selectedCollectionId}
        />

        <VideoInsightsDialog />
      </div>
    </CollectionsProvider>
  );
}