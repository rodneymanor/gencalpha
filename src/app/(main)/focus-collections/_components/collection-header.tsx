"use client";

import { Menu, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Video } from "@/lib/collections";

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

interface CollectionHeaderProps {
  selectedCollectionId: string;
  collections: Collection[];
  selectedVideo: Video | null;
  onOpenMobileSidebar: () => void;
  onOpenMobileInsights: () => void;
}

// Helper functions
const getSelectedCollection = (collections: Collection[], selectedCollectionId: string) => {
  return collections.find((c) => c.id === selectedCollectionId);
};

const getTotalVideos = (collections: Collection[]) => {
  return collections.reduce((total, col) => total + col.videoCount, 0);
};

const getVideoCount = (selectedCollectionId: string, collections: Collection[]) => {
  if (selectedCollectionId === "all-videos") {
    return getTotalVideos(collections);
  }
  return getSelectedCollection(collections, selectedCollectionId)?.videoCount ?? 0;
};

export function CollectionHeader({
  selectedCollectionId,
  collections,
  selectedVideo,
  onOpenMobileSidebar,
  onOpenMobileInsights,
}: CollectionHeaderProps) {
  const selectedCollection = getSelectedCollection(collections, selectedCollectionId);
  const videoCount = getVideoCount(selectedCollectionId, collections);

  return (
    <div className="border-border flex-shrink-0 border-b p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={onOpenMobileSidebar}>
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight lg:text-2xl">
              {selectedCollectionId === "all-videos" ? "All Videos" : (selectedCollection?.title ?? "Collection")}
            </h1>
            {selectedCollectionId !== "all-videos" && selectedCollection?.description && (
              <p className="text-muted-foreground mt-1 text-sm">{selectedCollection.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Insights Toggle */}
          {selectedVideo && (
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={onOpenMobileInsights}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
