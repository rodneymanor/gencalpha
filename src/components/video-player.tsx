"use client";

import { useState } from "react";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";

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
  onError
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
      <div className={cn("w-full h-full bg-muted flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No video URL available</p>
      </div>
    );
  }

  // Bunny.net iframe player
  if (video.iframeUrl) {
    return (
      <div className={cn("w-full h-full relative", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {hasError ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Failed to load video</p>
          </div>
        ) : (
          <iframe
            src={video.iframeUrl}
            className="w-full h-full border-0"
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
    <div className={cn("w-full h-full relative", className)}>
      {showPlayButton && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <button
            onClick={handlePlayClick}
            className="bg-white/90 hover:bg-white rounded-full p-4 transition-colors"
            aria-label="Play video"
          >
            <Play className="h-8 w-8 text-black fill-current" />
          </button>
        </div>
      )}

      {isLoading && !showPlayButton && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <video
        src={videoUrl}
        poster={video.thumbnailUrl}
        controls={showControls && !showPlayButton}
        autoPlay={autoPlay}
        className={cn("w-full h-full object-cover", className)}
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
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load video</p>
        </div>
      )}
    </div>
  );
}