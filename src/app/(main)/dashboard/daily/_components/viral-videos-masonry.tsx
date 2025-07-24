"use client";

import { useState, useEffect, useCallback } from "react";

import { Play } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MasonryVideoGrid } from "@/components/ui/masonry-video-grid";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { Video } from "@/lib/collections";

import { DailyVideoInsightsDialog } from "./daily-video-insights-dialog";

interface ViralVideosMasonryProps {
  className?: string;
}

export function ViralVideosMasonry({ className }: ViralVideosMasonryProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);

  const loadAllVideos = useCallback(async () => {
    if (!user?.uid) return;

    console.log("🔍 [Viral Videos] Loading all videos for user:", user.uid);
    setLoading(true);
    try {
      // Fetch all videos from all collections
      const result = await RBACClientService.getCollectionVideos(user.uid);

      console.log("🔍 [Viral Videos] Loaded videos:", result.videos.length);

      // Sort videos by metrics (views, likes) to show most viral first
      const sortedVideos = result.videos.sort((a, b) => {
        const aScore = (a.metrics?.views ?? 0) + (a.metrics?.likes ?? 0) * 2;
        const bScore = (b.metrics?.views ?? 0) + (b.metrics?.likes ?? 0) * 2;
        return bScore - aScore;
      });

      setVideos(sortedVideos);
    } catch (error) {
      console.error("❌ [Viral Videos] Failed to load videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadAllVideos();
    }
  }, [user?.uid, loadAllVideos]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsInsightsDialogOpen(true);
  };

  const handleToggleFavorite = (updatedVideo: Video) => {
    setVideos((prev) => prev.map((video) => (video.id === updatedVideo.id ? updatedVideo : video)));
  };

  const handleDeleteVideo = (deletedVideo: Video) => {
    setVideos((prev) => prev.filter((video) => video.id !== deletedVideo.id));
  };

  const handleMoveVideo = (video: Video) => {
    // Handle move video functionality
    console.log("📁 [Viral Videos] Move video:", video.title);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Viral Video Inspiration</CardTitle>
              <p className="text-muted-foreground mt-1">Discover trending content from all your collections</p>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Play className="h-4 w-4" />
              <span>{videos.length} videos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MasonryVideoGrid
            videos={videos}
            loading={loading}
            onVideoClick={handleVideoClick}
            onToggleFavorite={handleToggleFavorite}
            onDeleteVideo={handleDeleteVideo}
            onMoveVideo={handleMoveVideo}
            showActions={true}
            className="min-h-[600px]"
          />
        </CardContent>
      </Card>

      <DailyVideoInsightsDialog
        video={selectedVideo}
        open={isInsightsDialogOpen}
        onOpenChange={setIsInsightsDialogOpen}
      />
    </div>
  );
}
