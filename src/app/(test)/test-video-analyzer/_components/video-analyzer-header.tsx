"use client";

import { Calendar } from "lucide-react";

interface VideoData {
  metadata: {
    author: string;
    duration: number;
  };
  addedAt: string;
}

interface VideoAnalyzerHeaderProps {
  video: VideoData;
}

export function VideoAnalyzerHeader({ video }: VideoAnalyzerHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">👤</div>
      <div className="flex-1">
        <div className="text-sm font-semibold">@{video.metadata.author}</div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3" />
          {formatDate(video.addedAt)} • {video.metadata.duration}s
        </div>
      </div>
    </div>
  );
}
