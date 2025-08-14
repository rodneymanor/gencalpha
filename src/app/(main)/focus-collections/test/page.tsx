"use client";

import { useCallback, useState } from "react";

import { Plus, Collection, Video as VideoIcon, Star, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { FocusVideoGrid } from "../_components/focus-video-grid";

export default function TestCollectionPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleVideoClick = useCallback(
    (video: Video) => {
      openVideo(video);
    },
    [openVideo],
  );

  const handleVideoMove = (video: Video) => {
    console.log("Move video:", video.id);
  };

  const handleVideoCopy = (video: Video) => {
    console.log("Copy video:", video.id);
  };

  const handleVideoDelete = (video: Video) => {
    console.log("Delete video:", video.id);
  };

  const sidebarCategories = [
    { id: "all", label: "All Videos", icon: VideoIcon, count: 24 },
    { id: "favorites", label: "Favorites", icon: Star, count: 8 },
    { id: "recent", label: "Recent", icon: Collection, count: 12 },
  ];

  return (
    <div className="bg-background flex min-h-screen font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="bg-card border-border relative h-full w-64 border-r">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">Categories</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileSidebarOpen(false)} className="h-8 w-8 p-0">
                  ×
                </Button>
              </div>
              <nav className="mt-6 space-y-2">
                {sidebarCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors",
                        selectedCategory === category.id
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </div>
                      <span className="text-xs">{category.count}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="bg-card border-border hidden w-64 flex-shrink-0 border-r lg:block">
        <div className="p-6">
          <h2 className="text-foreground text-lg font-semibold">Categories</h2>
          <nav className="mt-6 space-y-2">
            {sidebarCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-button)] px-3 py-2 text-left text-sm transition-colors",
                    selectedCategory === category.id
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                  <span className="text-xs">{category.count}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content - Centered and Constrained */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-4xl">
          <div className="px-4 pt-6 pb-8 lg:px-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="h-8 w-8 p-0 lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="space-y-2">
                  <h1 className="text-foreground text-xl font-semibold md:text-2xl">Test Collection</h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Testing collection structure with focus components and centered layout.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Collection</span>
              </Button>
            </div>
            <div className="mt-6">
              <FocusVideoGrid
                collectionId="test-collection"
                selectedVideoId={currentVideo?.id}
                onVideoSelect={handleVideoClick}
                onVideoMove={handleVideoMove}
                onVideoCopy={handleVideoCopy}
                onVideoDelete={handleVideoDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
