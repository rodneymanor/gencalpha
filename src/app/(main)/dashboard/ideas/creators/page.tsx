"use client";

import { useCallback, useState } from "react";

import { UserPlus } from "lucide-react";

import CreatorVideosGrid, { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { Button } from "@/components/ui/button";
import { MenuTriggerButton } from "@/components/ui/menu-trigger-button";
import { SearchField } from "@/components/ui/search-field";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

export default function IdeasCreatorsPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [availableCreators, setAvailableCreators] = useState<Array<{
    username: string;
    displayName: string;
    platform: "instagram" | "tiktok";
  }>>([]);

  const handleVideoClick = useCallback(
    (videoData: VideoData) => {
      const video = transformVideoDataToVideo(videoData);
      openVideo(video);
    },
    [openVideo],
  );

  const handleCreatorsUpdated = useCallback((creators: Array<{
    username: string;
    displayName: string;
    platform: "instagram" | "tiktok";
  }>) => {
    setAvailableCreators(creators);
  }, []);

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
            <div className="flex gap-3">
              <div className="flex-1">
                <SearchField value={search} onChange={setSearch} placeholder="Search creators, videos, or content..." />
              </div>
            </div>
            {availableCreators.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <MenuTriggerButton
                  label="All Creators"
                  selected={selectedCreator === "all"}
                  onClick={() => setSelectedCreator("all")}
                  className="h-8 px-3 text-sm"
                />
                {availableCreators.map((creator) => (
                  <MenuTriggerButton
                    key={creator.username}
                    label={creator.displayName}
                    selected={selectedCreator === creator.username}
                    onClick={() => setSelectedCreator(creator.username)}
                    className="h-8 px-3 text-sm"
                  />
                ))}
              </div>
            )}
          <CreatorVideosGrid
            onVideoClick={handleVideoClick}
            showFollowButton={showNewCreatorForm}
            searchQuery={search}
            onSearchQueryChange={setSearch}
            selectedCreator={selectedCreator}
            onSelectedCreatorChange={setSelectedCreator}
            onCreatorsUpdated={handleCreatorsUpdated}
            hideSearch={true}
          />
        </div>
      </div>

      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
