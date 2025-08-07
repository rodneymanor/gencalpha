"use client";

import React, { useState } from "react";

import { Metadata } from "next";

import { Eye, BarChart3, RotateCcw, Play } from "lucide-react";

import { ManusPrompt } from "@/components/manus-prompt";

// --- MOCK DATA & TYPES ---
interface VideoData {
  id: number;
  thumbnailUrl: string;
  videoUrl: string;
  views: string;
}

const videoData: VideoData[] = [
  {
    id: 1,
    thumbnailUrl: "https://placehold.co/200x355/DBE8FF/337BFF?text=Video+1",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "25.1K",
  },
  {
    id: 2,
    thumbnailUrl: "https://placehold.co/200x355/E9F0FF/337BFF?text=Video+2",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "27.7K",
  },
  {
    id: 3,
    thumbnailUrl: "https://placehold.co/200x355/DBE8FF/337BFF?text=Video+3",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "22.2K",
  },
  {
    id: 4,
    thumbnailUrl: "https://placehold.co/200x355/E9F0FF/337BFF?text=Video+4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "190.6K",
  },
  {
    id: 5,
    thumbnailUrl: "https://placehold.co/200x355/DBE8FF/337BFF?text=Video+5",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "416.0K",
  },
  {
    id: 6,
    thumbnailUrl: "https://placehold.co/200x355/E9F0FF/337BFF?text=Video+6",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "32.6K",
  },
  {
    id: 7,
    thumbnailUrl: "https://placehold.co/200x355/DBE8FF/337BFF?text=Video+7",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "85.1K",
  },
  {
    id: 8,
    thumbnailUrl: "https://placehold.co/200x355/E9F0FF/337BFF?text=Video+8",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "12.9K",
  },
];

// --- REUSABLE SUB-COMPONENTS ---
interface VideoCardProps {
  video: VideoData;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="border-border bg-card relative flex w-full max-w-xs flex-col gap-4 rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-soft-drop)]">
      {/* Video Player */}
      <div
        className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[var(--radius-button)]"
        onClick={handlePlay}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"}`}
          onEnded={() => setIsPlaying(false)}
        />
        <img
          src={video.thumbnailUrl}
          alt="Video thumbnail"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/200x355/FF0000/FFFFFF?text=Error";
          }}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-pill)] bg-black/60 transition-transform hover:scale-110">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Views Badge */}
      <div className="absolute top-8 left-8 z-10 flex items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-black/60 px-2 py-1 text-white">
        <Eye className="h-3 w-3" />
        <p className="text-xs font-normal">{video.views}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full gap-2">
        <button className="border-border bg-card text-foreground hover:bg-accent flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-button)] border text-xs font-medium transition-all duration-300 select-none">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="truncate">Rewrite</span>
        </button>
        <button className="border-border bg-card text-foreground hover:bg-accent flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-button)] border text-xs font-medium transition-all duration-300 select-none">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="truncate">Analyse</span>
        </button>
      </div>
    </div>
  );
};

const CreatorVideosGrid: React.FC = () => {
  return (
    <div className="w-full">
      <div className="border-border bg-card flex flex-col gap-6 rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-soft-drop)]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)]">
            <Play className="text-secondary-foreground h-4 w-4" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">Short Form Videos</h1>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {videoData.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="min-h-screen">
      {/* Manus Prompt positioned higher on page with fixed spacing to prevent shifting */}
      <div className="pt-8 pb-8">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
          className=""
        />
      </div>

      {/* Creator Videos Grid */}
      <div className="px-6 pb-8">
        <CreatorVideosGrid />
      </div>
    </div>
  );
}
