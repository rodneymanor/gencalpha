"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Video } from "@/lib/collections";

import { FocusCollectionsSidebar } from "./focus-collections-sidebar";
import { FocusInsightsWrapper } from "./focus-insights-wrapper";

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

interface MobileOverlaysProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isMobileInsightsOpen: boolean;
  setIsMobileInsightsOpen: (open: boolean) => void;
  collections: Collection[];
  selectedCollectionId: string;
  setSelectedCollectionId: (id: string) => void;
  selectedVideo: Video | null;
  onBackToDashboard: () => void;
  onCreateCollection: () => void;
}

export function MobileOverlays({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isMobileInsightsOpen,
  setIsMobileInsightsOpen,
  collections,
  selectedCollectionId,
  setSelectedCollectionId,
  selectedVideo,
  onBackToDashboard,
  onCreateCollection,
}: MobileOverlaysProps) {
  return (
    <>
      {/* Mobile/Tablet Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="bg-background absolute top-0 left-0 h-full w-80 shadow-[var(--shadow-soft-drop)]">
            <FocusCollectionsSidebar
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={(id) => {
                setSelectedCollectionId(id);
                setIsMobileSidebarOpen(false);
              }}
              onBackToDashboard={onBackToDashboard}
              onCreateCollection={onCreateCollection}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Mobile/Tablet Insights Overlay */}
      {isMobileInsightsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileInsightsOpen(false)} />
          <div className="bg-background absolute top-0 right-0 h-full w-full max-w-md shadow-[var(--shadow-soft-drop)]">
            <div className="flex h-full flex-col">
              <div className="border-border flex items-center justify-between border-b p-4">
                <h2 className="font-sans text-lg font-semibold">Video Insights</h2>
                <Button size="icon" variant="ghost" onClick={() => setIsMobileInsightsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <FocusInsightsWrapper video={selectedVideo} className="h-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
