"use client";

import React, { useState } from "react";

import { Play, FileText } from "lucide-react";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoModalPlayerProps {
  video: Video;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function VideoModalPlayer({ video, onPlay, onPause, className }: VideoModalPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine the best video URL to use - prioritize iframeUrl, then directUrl, then originalUrl
  const getVideoUrl = () => {
    return video.iframeUrl || video.directUrl || video.originalUrl;
  };

  // Determine if this is an iframe URL (Bunny.net or embed)
  const isIframeUrl = (url: string) => {
    return (
      url &&
      (url.includes("iframe") ||
        url.includes("embed") ||
        url.includes("bunny") ||
        url.includes("youtube.com/embed") ||
        url.includes("vimeo.com/video"))
    );
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    onPlay?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleVideoPlay = () => {
    onPlay?.();
  };

  const handleVideoPause = () => {
    onPause?.();
  };

  const videoUrl = getVideoUrl();

  if (!videoUrl) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-neutral-900", className)}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-neutral-800">
            <Play className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">No video available</h3>
          <p className="text-sm text-neutral-400">This video doesn't have a playable URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <p className="text-sm text-neutral-400">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError ? (
        <div className="flex h-full items-center justify-center bg-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-neutral-800">
              <FileText className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">Unable to load video</h3>
            <p className="text-sm text-neutral-400">There was an error loading this video.</p>
          </div>
        </div>
      ) : isIframeUrl(videoUrl) ? (
        /* Iframe Video Player (for Bunny.net, YouTube embeds, etc.) */
        <iframe
          src={videoUrl}
          className="h-full w-full border-0"
          allowFullScreen
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={video.title || "Video player"}
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      ) : (
        /* Fallback HTML5 Video Player for direct URLs */
        <video
          src={videoUrl}
          poster={video.thumbnailUrl}
          controls
          autoPlay
          className="h-full w-full"
          style={{ objectFit: "cover", objectPosition: "center" }}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={() => setIsLoading(false)}
          onError={handleIframeError}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Video Metadata Overlay - hidden by default, can be toggled */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 hover:opacity-100">
        <h3 className="truncate text-sm font-semibold text-white">{video.title || "Untitled Video"}</h3>
        {video.metadata?.author && <p className="truncate text-xs text-neutral-300">by {video.metadata.author}</p>}
      </div>
    </div>
  );
}
