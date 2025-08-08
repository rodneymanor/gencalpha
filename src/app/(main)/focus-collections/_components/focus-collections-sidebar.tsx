"use client";

import { useState } from "react";

import { ArrowLeft, Plus, Video as VideoIcon, GalleryVerticalEnd } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
}

interface FocusCollectionsSidebarProps {
  collections: Collection[];
  selectedCollectionId: string;
  onSelectCollection: (id: string) => void;
  onBackToDashboard: () => void;
  onCreateCollection: () => void;
  className?: string;
}

export function FocusCollectionsSidebar({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onBackToDashboard,
  onCreateCollection,
  className,
}: FocusCollectionsSidebarProps) {
  const [hoveredCollection] = useState<string | null>(null);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAddVideo = async () => {
    if (!user?.uid) return;
    setSubmitError(null);
    if (!videoUrl || !/^https?:\/\//.test(videoUrl)) {
      setSubmitError("Please enter a valid video URL");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/video/add-to-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          collectionId: selectedCollectionId === "all-videos" ? undefined : selectedCollectionId,
          userId: user.uid,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add video to queue");
      }
      setVideoUrl("");
      setIsAddVideoOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to add video. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={cn("bg-sidebar text-sidebar-foreground flex h-full w-full flex-col", className)}>
        {/* Header Section */}
        <div className="flex-shrink-0 p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToDashboard}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground mb-4 gap-2 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="space-y-2">
            <Button
              onClick={() => setIsAddVideoOpen(true)}
              variant="secondary"
              className="text-sidebar-foreground w-full gap-2 rounded-[var(--radius-button)]"
              size="default"
            >
              <VideoIcon className="h-4 w-4" />
              New Video
            </Button>

            <Button
              onClick={onCreateCollection}
              variant="ghost"
              className="text-sidebar-foreground/80 hover:text-sidebar-foreground w-full gap-2 rounded-[var(--radius-button)]"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* All Videos Option */}
            <button
              onClick={() => onSelectCollection("all-videos")}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              className={cn(
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-[var(--radius-button)] p-2 text-left text-sm transition-colors",
                selectedCollectionId === "all-videos"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-button)] transition-colors",
                  selectedCollectionId === "all-videos"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-sidebar-accent/20 text-sidebar-foreground",
                )}
              >
                <VideoIcon className={cn("h-4 w-4", selectedCollectionId === "all-videos" ? "stroke-1" : "stroke-2")} />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span>All Videos</span>
                <span className="text-sidebar-foreground/70 text-xs">
                  {collections.reduce((total, col) => total + col.videoCount, 0)}
                </span>
              </div>
            </button>

            {/* Individual Collections */}
            {collections.map((collection) => {
              return (
                <button
                  key={collection.id}
                  onClick={() => onSelectCollection(collection.id)}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                  className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-[var(--radius-button)] p-2 text-left text-sm transition-colors",
                    selectedCollectionId === collection.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-button)] transition-colors",
                      selectedCollectionId === collection.id
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-sidebar-accent/20 text-sidebar-foreground",
                    )}
                  >
                    <GalleryVerticalEnd
                      className={cn("h-4 w-4", selectedCollectionId === collection.id ? "stroke-1" : "stroke-2")}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{collection.title}</div>
                    <div className="text-sidebar-foreground/70 mt-1 truncate text-xs">
                      {collection.description ?? "Collection of curated videos"}
                    </div>
                  </div>
                  <span className="text-sidebar-foreground/70 ml-2 text-xs">{collection.videoCount}</span>
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {collections.length === 0 && (
            <div className="text-sidebar-foreground/70 py-8 text-center">
              <p className="text-sm">No collections yet</p>
              <p className="text-xs">Create your first collection to get started</p>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={isAddVideoOpen}
        onOpenChange={(open) => {
          setIsAddVideoOpen(open);
          setSubmitError(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
            <DialogDescription>
              Paste a TikTok or Instagram video URL. It will be added to the selected collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/... or https://www.instagram.com/reel/..."
            />
            {submitError && <p className="text-destructive text-sm">{submitError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddVideoOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddVideo} disabled={isSubmitting || !videoUrl} className="gap-2">
              {isSubmitting ? "Processing..." : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
