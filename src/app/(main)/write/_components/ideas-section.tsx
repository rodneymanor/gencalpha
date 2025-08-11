"use client";

import { useState } from "react";

import { Users, Inbox, PenLine, ArrowLeft } from "lucide-react";

import AIGhostwriterPage from "@/app/(main)/dashboard/ai-ghostwriter/page";
import CreatorVideosGrid, { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { DailyIdeaInboxSection } from "@/app/(main)/dashboard/daily/_components/daily-idea-inbox-section";
import { Button } from "@/components/ui/button";
import ResourceGrid, { type ResourceItem } from "@/components/ui/resource-grid";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

export function IdeasSection() {
  const [activeIdeasSection, setActiveIdeasSection] = useState<
    null | "follow-creators" | "idea-inbox" | "ai-ghostwriter"
  >(null);
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

  const handleVideoClick = (videoData: VideoData) => {
    const video = transformVideoDataToVideo(videoData);
    openVideo(video);
  };

  return (
    <div className="min-h-[1px]">
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
              items={getIdeasItems({
                onOpenFollowCreators: () => setActiveIdeasSection("follow-creators"),
                onOpenIdeaInbox: () => setActiveIdeasSection("idea-inbox"),
                onOpenGhostwriter: () => setActiveIdeasSection("ai-ghostwriter"),
              })}
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

      {/* Idea Inbox Section (hidden until selected) */}
      {activeIdeasSection === "idea-inbox" && (
        <div className="space-y-4 px-6 pb-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveIdeasSection(null)} className="h-11 px-3">
              <ArrowLeft className="mr-2 size-4" aria-hidden />
              <span>Back to ideas</span>
            </Button>
          </div>

          <DailyIdeaInboxSection />
        </div>
      )}

      {/* AI Ghostwriter Section (hidden until selected) */}
      {activeIdeasSection === "ai-ghostwriter" && (
        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between px-6">
            <Button variant="ghost" onClick={() => setActiveIdeasSection(null)} className="h-11 px-3">
              <ArrowLeft className="mr-2 size-4" aria-hidden />
              <span>Back to ideas</span>
            </Button>
          </div>
          <AIGhostwriterPage />
        </div>
      )}

      {/* Floating Video Player */}
      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}

function getIdeasItems({
  onOpenFollowCreators,
  onOpenIdeaInbox,
  onOpenGhostwriter,
}: {
  onOpenFollowCreators: () => void;
  onOpenIdeaInbox: () => void;
  onOpenGhostwriter: () => void;
}): ResourceItem[] {
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
      onClick: onOpenIdeaInbox,
    },
    {
      id: "ai-ghostwriter",
      title: "AI Ghostwriter",
      icon: <PenLine className="text-foreground/75 size-4" aria-hidden />,
      kindLabel: "Create",
      onClick: onOpenGhostwriter,
    },
  ];
}

export default IdeasSection;
