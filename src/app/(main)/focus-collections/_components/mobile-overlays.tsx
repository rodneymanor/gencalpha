"use client";

import { FocusCollectionsSidebar } from "./focus-collections-sidebar";
// Insights overlay removed; unified FloatingVideoPlayer fixed is used globally

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

interface MobileOverlaysProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  collections: Collection[];
  selectedCollectionId: string;
  setSelectedCollectionId: (id: string) => void;
  onBackToDashboard: () => void;
  onCreateCollection: () => void;
}

export function MobileOverlays({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  collections,
  selectedCollectionId,
  setSelectedCollectionId,
  onBackToDashboard,
  onCreateCollection,
}: MobileOverlaysProps) {
  return (
    <>
      {/* Mobile/Tablet Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="bg-background/60 absolute inset-0 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="bg-sidebar text-sidebar-foreground absolute top-0 left-0 h-full w-80 shadow-[var(--shadow-soft-drop)]">
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

      {/* Insights overlay removed; unified FloatingVideoPlayer fixed handles all breakpoints */}
    </>
  );
}
