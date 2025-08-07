"use client";

import { Metadata } from "next";
import { useState } from "react";

import { ManusPrompt } from "@/components/manus-prompt";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

import CreatorVideosGrid, { type VideoData } from "./_components/creator-videos-grid";

export default function DailyPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

  const handleVideoClick = (videoData: VideoData) => {
    console.log("🎬 Opening video player for:", videoData.altText);
    
    // Transform VideoData to Video format for the player
    const video = transformVideoDataToVideo(videoData);
    openVideo(video);
  };

  return (
    <div className="min-h-screen">
      {/* Manus Prompt positioned higher on page with fixed spacing to prevent shifting */}
      <div className="pt-8 pb-8">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
          className=""
        />
      </div>

      {/* Creator Inspiration Section */}
      <div className="px-6 pb-8">
        <CreatorVideosGrid 
          onVideoClick={handleVideoClick}
          showFollowButton={true}
        />
      </div>

      {/* Floating Video Player */}
      {currentVideo && (
        <FloatingVideoPlayer
          isOpen={isOpen}
          onClose={closeVideo}
          video={currentVideo}
        />
      )}
    </div>
  );
}
