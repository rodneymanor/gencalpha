"use client";

import { useCallback } from "react";

import CreatorVideosGrid, { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

export default function IdeasCreatorsPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

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
        <div className="space-y-2">
          <h1 className="text-foreground text-xl font-semibold md:text-2xl">Follow creators</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Discover creators and track their latest content.
          </p>
        </div>
        <div className="mt-6">
          <CreatorVideosGrid onVideoClick={handleVideoClick} showFollowButton={true} />
        </div>
      </div>

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
