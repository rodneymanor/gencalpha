"use client";

import { useCallback, useState } from "react";

import { Video } from "lucide-react";

import { FocusVideoGrid } from "@/app/(main)/focus-collections/_components/focus-video-grid";
import { Button } from "@/components/ui/button";
import type { Video as VideoType } from "@/lib/collections";

import { CategorySelector } from "./_components/category-selector";

export default function CollectionsPage() {
  const [showNewVideoForm, setShowNewVideoForm] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleVideoSelect = useCallback((video: VideoType) => {
    setSelectedVideoId(video.id);
    console.log("Video selected:", video);
  }, []);

  const handleVideoMove = useCallback((video: VideoType) => {
    console.log("Video move:", video);
  }, []);

  const handleVideoCopy = useCallback((video: VideoType) => {
    console.log("Video copy:", video);
  }, []);

  const handleVideoDelete = useCallback((video: VideoType) => {
    console.log("Video delete:", video);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log("Collection changed:", categoryId);
  }, []);

  return (
    <div className="h-full font-sans">
      <div className="mx-auto h-full max-w-4xl">
        <div className="px-4 pt-6 pb-8 md:px-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-foreground text-xl font-semibold md:text-2xl">My Collections</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Organize and manage your video content collections.
              </p>
            </div>
            <Button onClick={() => setShowNewVideoForm(!showNewVideoForm)} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              New Video
            </Button>
          </div>
          <div className="mt-6">
            <CategorySelector selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            <div className="mt-6">
              <FocusVideoGrid
                collectionId={selectedCategory === "all" ? "all-videos" : selectedCategory}
                selectedVideoId={selectedVideoId}
                onVideoSelect={handleVideoSelect}
                onVideoMove={handleVideoMove}
                onVideoCopy={handleVideoCopy}
                onVideoDelete={handleVideoDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
