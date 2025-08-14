"use client";

import { useCallback, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { Video } from "@/lib/collections";

import { FocusVideoGrid } from "../_components/focus-video-grid";

export default function TestCollectionPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);

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

  return (
    <div className="font-sans">
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-semibold md:text-2xl">Test Collection</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Testing collection structure with focus components.
            </p>
          </div>
          <Button onClick={() => setShowNewCollectionForm(!showNewCollectionForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Collection
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

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
