"use client";

import { useCallback, useState } from "react";

import { UserPlus } from "lucide-react";

import CreatorVideosGrid, { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

export default function IdeasCreatorsPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
  const [search, setSearch] = useState("");

  const handleVideoClick = useCallback(
    (videoData: VideoData) => {
      const video = transformVideoDataToVideo(videoData);
      openVideo(video);
    },
    [openVideo],
  );

  return (
    <div className="font-sans">
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-semibold md:text-2xl">Creator Inspiration</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Discover creators and track their latest content.
            </p>
          </div>
          <Button onClick={() => setShowNewCreatorForm(!showNewCreatorForm)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            New Creator
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          <SearchField value={search} onChange={setSearch} placeholder="Search creators, videos, or content..." />
          <CreatorVideosGrid
            onVideoClick={handleVideoClick}
            showFollowButton={showNewCreatorForm}
            searchQuery={search}
            onSearchQueryChange={setSearch}
          />
        </div>
      </div>

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
