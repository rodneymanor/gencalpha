"use client";

import React, { useEffect, useRef, useState } from "react";

import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

import { Video } from "@/lib/collections";
import { videoToNotionData } from "@/lib/video-to-notion-adapter";
import { VideoInsights } from "@/types/video-insights";

import { VideoModalNotionPanel } from "./video-modal-notion-panel";
import { VideoModalPlayer } from "./video-modal-player";

interface VideoModalOverlayProps {
  /** Currently selected video */
  video: Video | null;
  /** Function to close the modal */
  onClose: () => void;
  /** Optional callback when video changes (for arrow navigation) */
  onVideoChange?: (direction: "prev" | "next") => void;
  /** Whether prev/next navigation is available */
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  /** Callback functions for video interactions */
  callbacks?: {
    onCopy?: (content: string, componentType?: string) => void;
    onDownload?: () => void;
    onVideoPlay?: () => void;
    onVideoPause?: () => void;
  };
  /** Function to transform video to video insights */
  transformToVideoInsights?: (video: Video) => VideoInsights;
}

export function VideoModalOverlay({
  video,
  onClose,
  onVideoChange,
  canNavigatePrev = false,
  canNavigateNext = false,
  callbacks,
  transformToVideoInsights,
}: VideoModalOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile vs desktop to render only one video player
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to check if element is in video grid
  const isElementInVideoGrid = (element: Element | null): boolean => {
    if (!element) return false;
    return !!(
      element.closest('[role="grid"]') ||
      element.closest(".video-grid") ||
      (element.getAttribute("role") === "button" &&
        element.getAttribute("aria-label")?.includes("video"))
    );
  };

  // Handle escape key and backdrop click
  useEffect(() => {
    if (!video) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isInGrid = isElementInVideoGrid(document.activeElement);

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "ArrowLeft":
          if (!isInGrid && canNavigatePrev && onVideoChange) {
            event.preventDefault();
            onVideoChange("prev");
          }
          break;
        case "ArrowRight":
          if (!isInGrid && canNavigateNext && onVideoChange) {
            event.preventDefault();
            onVideoChange("next");
          }
          break;
        case "ArrowUp":
          if (!isInGrid && canNavigatePrev && onVideoChange) {
            event.preventDefault();
            onVideoChange("prev");
          }
          break;
        case "ArrowDown":
          if (!isInGrid && canNavigateNext && onVideoChange) {
            event.preventDefault();
            onVideoChange("next");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [video, onClose, onVideoChange, canNavigatePrev, canNavigateNext]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (video) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [video]);

  if (!video) return null;

  const videoInsights = transformToVideoInsights?.(video);
  const notionData = videoInsights ? videoToNotionData(video, videoInsights, callbacks ?? {}) : null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-60 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white"
        aria-label="Close modal"
      >
        <X className="h-6 w-6 text-neutral-800" />
      </button>

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="mx-auto flex h-full w-full max-w-7xl items-start justify-center px-4 py-4 md:px-6 md:py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-2xl lg:max-h-[90vh] lg:flex-row">
          {isMobile ? (
            /* Mobile Layout */
            <>
              {/* Mobile: Video Player */}
              <div className="relative flex-1 overflow-hidden bg-black">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="aspect-[16/9] w-full max-w-full">
                    <VideoModalPlayer
                      video={video}
                      onPlay={callbacks?.onVideoPlay}
                      onPause={callbacks?.onVideoPause}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Mobile: Notion Panel */}
              <div className="flex w-full flex-col">
                {notionData && videoInsights ? (
                  <>
                    <VideoModalNotionPanel video={video} videoInsights={videoInsights} notionData={notionData} />

                    {/* Mobile Navigation - Only shown on mobile when navigation is available */}
                    {(canNavigatePrev || canNavigateNext) && (
                      <div className="flex justify-between border-t border-neutral-200 bg-neutral-50 p-4 md:hidden">
                        <button
                          onClick={() => onVideoChange?.("prev")}
                          disabled={!canNavigatePrev}
                          className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        <button
                          onClick={() => onVideoChange?.("next")}
                          disabled={!canNavigateNext}
                          className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">Loading video insights...</h3>
                      <p className="text-sm text-neutral-600">Please wait while we process the video data.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Desktop Layout */
            <>
              {/* Desktop: Video Player - flexible width */}
              <div className="relative flex-1 overflow-hidden bg-black">
                <VideoModalPlayer
                  video={video}
                  onPlay={callbacks?.onVideoPlay}
                  onPause={callbacks?.onVideoPause}
                  className="h-full w-full"
                />
              </div>

              {/* Desktop: Arrow container - thin strip between video and metrics */}
              {(canNavigatePrev || canNavigateNext) && (
                <div className="relative w-16 flex-shrink-0 bg-gradient-to-r from-black to-neutral-900 flex items-center justify-center">
                  <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur-sm">
                    <button
                      onClick={() => onVideoChange?.("prev")}
                      disabled={!canNavigatePrev}
                      className="group flex h-8 w-8 items-center justify-center rounded-md bg-white/20 transition-all hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Previous video"
                    >
                      <ChevronUp className="h-4 w-4 text-white group-hover:text-white/90" />
                    </button>
                    <button
                      onClick={() => onVideoChange?.("next")}
                      disabled={!canNavigateNext}
                      className="group flex h-8 w-8 items-center justify-center rounded-md bg-white/20 transition-all hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Next video"
                    >
                      <ChevronDown className="h-4 w-4 text-white group-hover:text-white/90" />
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop: Notion Panel - fixed width */}
              <div className="flex w-[600px] flex-shrink-0 flex-col">
                {notionData && videoInsights ? (
                  <VideoModalNotionPanel video={video} videoInsights={videoInsights} notionData={notionData} />
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">Loading video insights...</h3>
                      <p className="text-sm text-neutral-600">Please wait while we process the video data.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
