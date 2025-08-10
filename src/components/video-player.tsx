"use client";

import { useState } from "react";

import { Play } from "lucide-react";
import { ClarityLoader } from "@/components/ui/loading";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  video: Video;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
}

export function VideoPlayer({
  video,
  className,
  autoPlay = false,
  showControls = true,
  onLoadStart,
  onLoadEnd,
  onError,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(!autoPlay);

  // Determine the best video URL to use
  const getVideoUrl = () => {
    return video.iframeUrl || video.directUrl || video.originalUrl;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.("Failed to load video");
  };

  const handlePlayClick = () => {
    setShowPlayButton(false);
    onLoadStart?.();
  };

  const videoUrl = getVideoUrl();

  if (!videoUrl) {
    return (
      <div className={cn("bg-muted flex h-full w-full items-center justify-center", className)}>
        <p className="text-muted-foreground">No video URL available</p>
      </div>
    );
  }

  // Bunny.net iframe player
  if (video.iframeUrl) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        {isLoading && (
          <div className="bg-muted absolute inset-0 z-10 flex items-center justify-center">
            <ClarityLoader size="sm" />
          </div>
        )}

        {hasError ? (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">Failed to load video</p>
          </div>
        ) : (
          <iframe
            src={video.iframeUrl}
            className="h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={video.title || "Video player"}
          />
        )}
      </div>
    );
  }

  // Fallback HTML5 video player
  return (
    <div className={cn("relative h-full w-full", className)}>
      {showPlayButton && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <button
            onClick={handlePlayClick}
            className="rounded-full bg-white/90 p-4 transition-colors hover:bg-white"
            aria-label="Play video"
          >
            <Play className="h-8 w-8 fill-current text-black" />
          </button>
        </div>
      )}

      {isLoading && !showPlayButton && (
        <div className="bg-muted absolute inset-0 z-10 flex items-center justify-center">
          <ClarityLoader size="sm" />
        </div>
      )}

      <video
        src={videoUrl}
        poster={video.thumbnailUrl}
        controls={showControls && !showPlayButton}
        autoPlay={autoPlay}
        className={cn("h-full w-full object-cover", className)}
        onLoadStart={() => {
          setIsLoading(true);
          onLoadStart?.();
        }}
        onLoadedData={() => {
          setIsLoading(false);
          onLoadEnd?.();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          onError?.("Failed to load video");
        }}
      >
        Your browser does not support the video tag.
      </video>

      {hasError && (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load video</p>
        </div>
      )}
    </div>
  );
}
