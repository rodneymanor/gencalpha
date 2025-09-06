"use client";

import React from "react";

import { ExternalLink, ChevronRight } from "lucide-react";

import { Video } from "@/lib/collections";

interface VideoNotionPanelHeaderProps {
  title: string;
  onTitleChange?: (title: string) => void;
  showPageControls?: boolean;
  placeholder?: string;
  isVisible?: boolean;
  video: Video;
  platform?: string;
  onClose?: () => void;
}

export default function VideoNotionPanelHeader({
  title: _title, // Kept for compatibility but not used
  onTitleChange: _onTitleChange, // Kept for compatibility but not used
  showPageControls: _showPageControls = true, // Kept for compatibility but not used
  placeholder: _placeholder = "Video Title", // Kept for compatibility but not used
  isVisible = true,
  video,
  platform,
  onClose,
}: VideoNotionPanelHeaderProps) {
  // Title editing functionality removed for cleaner experience

  const handleViewOriginal = () => {
    const url = video.originalUrl ?? video.directUrl ?? video.iframeUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Title sync functionality removed

  // Get creator info with comprehensive fallback logic
  const metadata = video?.metadata;

  // Try multiple sources for creator name, in priority order:
  // 1. metadata.author (primary source)
  // 2. Extract from originalUrl (TikTok/Instagram handle)
  // 3. Extract from platform-specific metadata
  // 4. Use video title if it contains creator info
  // 5. Default fallback

  const getCreatorFromUrl = (url: string): string | null => {
    if (!url) return null;

    // TikTok URL pattern: https://www.tiktok.com/@username/video/...
    const tiktokMatch = url.match(/tiktok\.com\/@([^\/]+)/);
    if (tiktokMatch) return tiktokMatch[1];

    // Instagram URL pattern: https://www.instagram.com/p/... or /reel/...
    // Note: Instagram URLs don't typically contain usernames, but might in some cases
    const instagramMatch = url.match(/instagram\.com\/([^\/]+)\//);
    if (instagramMatch && !["p", "reel", "tv"].includes(instagramMatch[1])) {
      return instagramMatch[1];
    }

    return null;
  };

  const creatorName =
    metadata?.author ?? // Primary source from metadata
    getCreatorFromUrl(video?.originalUrl ?? "") ?? // Extract from URL
    getCreatorFromUrl(video?.directUrl ?? "") ?? // Try direct URL too
    "Unknown Creator"; // Final fallback

  // Generate nickname/handle from creator name (safely handle potentially missing properties)
  const metadataAny = metadata as any;
  const creatorNickname =
    metadataAny?.authorNickname ??
    metadataAny?.authorUsername ??
    (creatorName !== "Unknown Creator" ? creatorName.toLowerCase().replace(/[^a-z0-9]/g, "") : "unknown");

  // Debug: Log comprehensive video data to verify creator info
  React.useEffect(() => {
    console.log("VideoNotionPanelHeader - Comprehensive video data analysis:", {
      hasVideo: !!video,
      videoId: video?.id,
      videoTitle: video?.title,

      // Metadata analysis
      hasMetadata: !!video?.metadata,
      metadataAuthor: video?.metadata?.author,
      metadataKeys: video?.metadata ? Object.keys(video.metadata) : [],

      // URL analysis
      originalUrl: video?.originalUrl,
      directUrl: video?.directUrl,
      extractedFromOriginalUrl: getCreatorFromUrl(video?.originalUrl || ""),
      extractedFromDirectUrl: getCreatorFromUrl(video?.directUrl || ""),

      // Final resolved values
      finalCreatorName: creatorName,
      finalCreatorNickname: creatorNickname,

      // Full objects for debugging
      fullMetadata: video?.metadata,
      fullVideo: video,
    });
  }, [video, creatorName, creatorNickname]);

  // Get platform badge styling
  const getPlatformBadge = () => {
    if (!platform) return null;

    const platformStyles = {
      tiktok: "bg-pink-100 text-pink-800 border-pink-200",
      instagram: "bg-purple-100 text-purple-800 border-purple-200",
      youtube: "bg-red-100 text-red-800 border-red-200",
      default: "bg-neutral-100 text-neutral-800 border-neutral-200",
    };

    const style = platformStyles[platform.toLowerCase() as keyof typeof platformStyles] || platformStyles.default;

    return (
      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${style}`}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </span>
    );
  };

  return (
    <div
      className={`transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"} `}
      style={{
        transitionDelay: isVisible ? "100ms" : "0ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Creator Info Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Close Icon and Creator Info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Close Icon */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-button)] text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Avatar with initials - matching VideoCard pattern */}
            <div className="rounded-pill flex h-8 w-8 flex-shrink-0 items-center justify-center bg-neutral-100">
              <span className="text-xs font-medium text-neutral-900">
                {creatorName ? creatorName.slice(0, 2).toUpperCase() : "UN"}
              </span>
            </div>
            {/* Creator name and handle */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{creatorName}</p>
              {creatorNickname && <p className="truncate text-xs text-neutral-600">@{creatorNickname.toLowerCase()}</p>}
            </div>
            {/* Platform Badge */}
            {getPlatformBadge()}
          </div>

          {/* Right: View Original Button */}
          <button
            onClick={handleViewOriginal}
            className="flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Original</span>
          </button>
        </div>
      </div>

      {/* Note: Page Controls moved to individual tabs */}
      {/* Note: Title section removed for cleaner experience */}
    </div>
  );
}
