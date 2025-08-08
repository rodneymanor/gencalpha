"use client";

import { useState } from "react";

import { Users, Inbox, PenLine, ArrowLeft } from "lucide-react";

import { ManusPrompt } from "@/components/manus-prompt";
import { Button } from "@/components/ui/button";
import ResourceGrid, { type ResourceItem } from "@/components/ui/resource-grid";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

import CreatorVideosGrid, { type VideoData } from "./_components/creator-videos-grid";

export default function DailyPage() {
  const [activeIdeasSection, setActiveIdeasSection] = useState<null | "follow-creators">(null);
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

      {/* Get Script Ideas Section */}
      <div className="px-6 pb-8">
        <div className="space-y-2">
          <h2 className="text-foreground text-xl font-semibold md:text-2xl">Get script ideas</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Never run out of ideas — never run out of content.
          </p>
        </div>
        {activeIdeasSection === null && (
          <div className="mt-6">
            <ResourceGrid
              lgColumns={3}
              items={getIdeasItems({ onOpenFollowCreators: () => setActiveIdeasSection("follow-creators") })}
            />
          </div>
        )}
      </div>

      {/* Follow Creators Section (hidden until selected) */}
      {activeIdeasSection === "follow-creators" && (
        <div className="space-y-4 px-6 pb-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveIdeasSection(null)} className="h-11 px-3">
              <ArrowLeft className="mr-2 size-4" aria-hidden />
              <span>Back to ideas</span>
            </Button>
          </div>

          <CreatorVideosGrid onVideoClick={handleVideoClick} showFollowButton={true} />
        </div>
      )}

      {/* Floating Video Player */}
      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
function getIdeasItems({ onOpenFollowCreators }: { onOpenFollowCreators: () => void }): ResourceItem[] {
  return [
    {
      id: "follow-creators",
      title: "Follow creators",
      icon: <Users className="text-foreground/75 size-4" aria-hidden />,
      kindLabel: "Discover",
      onClick: onOpenFollowCreators,
    },
    {
      id: "idea-inbox",
      title: "Idea inbox",
      icon: <Inbox className="text-foreground/75 size-4" aria-hidden />,
      kindLabel: "Organize",
    },
    {
      id: "ai-ghostwriter",
      title: "AI Ghostwriter",
      icon: <PenLine className="text-foreground/75 size-4" aria-hidden />,
      kindLabel: "Create",
    },
  ];
}
