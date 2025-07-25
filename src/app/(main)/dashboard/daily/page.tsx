"use client";

import { useState } from "react";

import { Metadata } from "next";

import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { ContentIdeasGrid } from "./_components/content-ideas-grid";
import { PersonalizationDialog } from "./_components/personalization-dialog";
import { ViralVideosMasonry } from "./_components/viral-videos-masonry";

// Remove metadata export for client component
// export const metadata: Metadata = {
//   title: "Daily | Studio Admin",
//   description: "Daily content inspiration and ideas",
// };

export default function DailyPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Mock video data - replace with actual data
  const mockVideo = {
    url: "https://example.com/video.mp4",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=video",
    creator: {
      name: "Creator Name",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creator",
      handle: "@creator",
    },
    stats: {
      likes: "1.2M",
      comments: "8,432",
      shares: "2.3K",
      saves: "15K",
    },
    description: "This is an amazing video description that explains what the content is about. #trending #viral",
    comments: [
      { id: 1, user: "User 1", text: "Amazing content!", time: "2h" },
      { id: 2, user: "User 2", text: "Love this perspective", time: "3h" },
      { id: 3, user: "User 3", text: "So insightful!", time: "5h" },
    ],
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left side - Video Player (Instagram Reels style) */}
      <div className="flex h-full w-full flex-1 items-center justify-center bg-black lg:w-[60%]">
        <div className="relative h-full w-full max-w-[480px]">
          {/* Video placeholder - replace with actual video player */}
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <img src={mockVideo.thumbnail} alt="Video thumbnail" className="h-full w-full object-contain" />
          </div>

          {/* Video overlay controls */}
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={mockVideo.creator.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{mockVideo.creator.name}</p>
                <p className="text-xs text-gray-300">{mockVideo.creator.handle}</p>
              </div>
              <Button size="sm" variant="secondary">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Video Insights (Instagram style) */}
      <div className="bg-background hidden h-full w-[40%] flex-col border-l lg:flex">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={mockVideo.creator.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{mockVideo.creator.name}</p>
                <p className="text-muted-foreground text-sm">{mockVideo.creator.handle}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {/* Description */}
            <div>
              <p className="text-sm">{mockVideo.description}</p>
            </div>

            <Separator />

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="font-semibold">Comments</h3>
              {mockVideo.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{comment.user}</p>
                      <p className="text-muted-foreground text-xs">{comment.time}</p>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button size="icon" variant="ghost">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold">{mockVideo.stats.likes} likes</p>
            <p className="text-muted-foreground text-xs">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
