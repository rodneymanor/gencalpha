import * as React from "react";

import { Play, Video } from "lucide-react";

interface ProductionVideoPaneProps {
  videoSrc?: string | null;
  title?: string;
  platform?: "tiktok" | "instagram" | "youtube";
}

export function ProductionVideoPane({ videoSrc, title, platform }: ProductionVideoPaneProps) {
  return (
    <div className="grid aspect-[9/16] max-h-[80vh] w-full place-items-center bg-black/95">
      {videoSrc ? (
        <video src={videoSrc} controls className="h-full w-full object-contain" />
      ) : (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-6 text-white">
          <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm">
            <Video className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">{title ?? "Video Analysis Ready"}</h3>
            <p className="text-sm text-white/70">
              {platform ? `${platform.charAt(0).toUpperCase()}${platform.slice(1)} video` : "Social media video"}{" "}
              analysis complete
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-button)] bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Play className="h-4 w-4" />
            <span className="text-sm">Video placeholder</span>
          </div>
        </div>
      )}
    </div>
  );
}
