"use client";

import Image from "next/image";

import { Instagram, Play } from "lucide-react";

import { Card } from "@/components/ui/card";

interface VideoData {
  id: string;
  href: string;
  thumbnail: string;
  altText: string;
  views: string;
  platform: "instagram" | "tiktok";
  author: {
    username: string;
    displayName?: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface CreatorVideoCardProps {
  video: VideoData;
}

export function CreatorVideoCard({ video }: CreatorVideoCardProps) {
  return (
    <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.altText}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              <span className="text-xs font-semibold">{video.views}</span>
            </div>
            <div className="flex items-center gap-1">
              {video.platform === "instagram" && <Instagram className="h-3 w-3" />}
              {video.platform === "tiktok" && (
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white text-[8px] font-bold text-black">
                  T
                </div>
              )}
              <span className="text-xs">@{video.author.username}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-foreground line-clamp-2 text-sm">{video.altText}</p>
      </div>
    </Card>
  );
}
