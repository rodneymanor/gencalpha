"use client";

import { useCallback, useState } from "react";

import { UserPlus, Check, ChevronsUpDown } from "lucide-react";

import CreatorVideosGrid, { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import { transformVideoDataToVideo } from "@/lib/video-player-helpers";

export default function IdeasCreatorsPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();
  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [availableCreators, setAvailableCreators] = useState<
    Array<{
      username: string;
      displayName: string;
      platform: "instagram" | "tiktok";
    }>
  >([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleVideoClick = useCallback(
    (videoData: VideoData) => {
      const video = transformVideoDataToVideo(videoData);
      openVideo(video);
    },
    [openVideo],
  );

  const handleCreatorsUpdated = useCallback(
    (
      creators: Array<{
        username: string;
        displayName: string;
        platform: "instagram" | "tiktok";
      }>,
    ) => {
      setAvailableCreators(creators);
    },
    [],
  );

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Mobile-first header */}
      <div className="bg-background/95 border-border sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-foreground text-lg font-semibold sm:text-xl md:text-2xl">Creator Inspiration</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Discover creators and track their latest content.
              </p>
            </div>

            {/* Mobile-optimized action buttons */}
            <div className="flex gap-2 sm:gap-3">
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:flex-initial"
                  >
                    <span className="truncate">
                      {selectedCreator === "all"
                        ? "All Creators"
                        : (availableCreators.find((creator) => creator.username === selectedCreator)?.displayName ??
                          "Select creator")}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] p-0 sm:w-[300px]">
                  <Command>
                    <CommandInput placeholder="Search creators..." />
                    <CommandList>
                      <CommandEmpty>No creators found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all"
                          value="all"
                          onSelect={() => {
                            setSelectedCreator("all");
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedCreator === "all" ? "opacity-100" : "opacity-0"}`}
                          />
                          All Creators
                        </CommandItem>
                        {availableCreators.map((creator) => (
                          <CommandItem
                            key={creator.username}
                            value={creator.username}
                            onSelect={() => {
                              setSelectedCreator(creator.username);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedCreator === creator.username ? "opacity-100" : "opacity-0"}`}
                            />
                            <div className="flex items-center gap-2">
                              {creator.platform === "instagram" && (
                                <div className="flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                                  IG
                                </div>
                              )}
                              {creator.platform === "tiktok" && (
                                <div className="bg-foreground text-background flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-bold">
                                  T
                                </div>
                              )}
                              <span>{creator.displayName}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => setShowNewCreatorForm(!showNewCreatorForm)}
                className={`flex items-center gap-2 transition-all duration-200 ${showNewCreatorForm ? "bg-accent text-accent-foreground" : ""}`}
                variant={showNewCreatorForm ? "secondary" : "default"}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Creator</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with improved mobile spacing */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {/* Enhanced mobile-responsive grid */}
        <div className="space-y-4">
          <CreatorVideosGrid
            onVideoClick={handleVideoClick}
            showFollowButton={showNewCreatorForm}
            selectedCreator={selectedCreator}
            onSelectedCreatorChange={setSelectedCreator}
            onCreatorsUpdated={handleCreatorsUpdated}
            hideSearch={true}
            columns={3} // Optimized for mobile: 1 col mobile, 2 col tablet, 3 col desktop
          />
        </div>
      </div>

      {/* Floating video player */}
      {currentVideo && <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo} />}
    </div>
  );
}
