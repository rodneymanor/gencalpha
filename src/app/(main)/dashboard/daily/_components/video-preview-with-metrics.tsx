"use client";

import { useState } from "react";

import Image from "next/image";

import { Play, Heart, MessageCircle, Share, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { Video } from "@/lib/collections";

// Instagram-style video preview with overlaid metrics
interface VideoPreviewWithMetricsProps {
  video: Video;
  showMetrics?: boolean;
}

export function VideoPreviewWithMetrics({ video, showMetrics = true }: VideoPreviewWithMetricsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFallbackImage, setShowFallbackImage] = useState(true);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handlePlayVideo = () => {
    console.log("🎮 [Video Preview] Play button clicked for:", video.title);
    console.log("🎮 [Video Preview] Video URLs:", {
      originalUrl: video.originalUrl,
      iframeUrl: video.iframeUrl,
      directUrl: video.directUrl,
    });

    // If we have an iframe URL or direct URL, start playing in the component
    if (video.iframeUrl || video.directUrl) {
      setIsPlaying(true);
      setShowFallbackImage(false);
    } else if (video.originalUrl) {
      // Fallback to opening in new tab if no playable URL
      window.open(video.originalUrl, "_blank");
    } else {
      console.warn("⚠️ [Video Preview] No playable URL found for video:", video.id);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Video Player or Image Preview */}
      {isPlaying && (video.iframeUrl || video.directUrl) ? (
        <VideoPlayer
          video={video}
          className="h-full w-full"
          autoPlay={true}
          onError={() => {
            console.warn("⚠️ [Video Preview] Video playback failed, falling back to image");
            setIsPlaying(false);
            setShowFallbackImage(true);
          }}
        />
      ) : showFallbackImage && video.thumbnailUrl ? (
        <div className="relative h-full w-full">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 40vw, 480px"
            priority
          />
        </div>
      ) : (
        <div className="bg-muted flex h-full w-full items-center justify-center">
          <div className="text-center text-white">
            <Play className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm">No Preview</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay - only show when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
            onClick={handlePlayVideo}
          >
            <Play className="h-8 w-8 fill-white text-white" />
          </Button>
        </div>
      )}

      {/* Metrics Overlay - Right Side */}
      {showMetrics && video.metrics && (
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
          {/* Likes */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow-lg">{formatNumber(video.metrics.likes)}</span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow-lg">
              {formatNumber(video.metrics.comments)}
            </span>
          </div>

          {/* Shares */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30">
              <Share className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow-lg">
              {formatNumber(video.metrics.shares)}
            </span>
          </div>

          {/* Views */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow-lg">{formatNumber(video.metrics.views)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
