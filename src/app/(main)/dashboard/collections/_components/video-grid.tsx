"use client";

import { useState, useEffect, useCallback } from "react";

import { Play, Star, StarOff, MoreHorizontal, Eye, Trash2, Copy, Move } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { useRBAC } from "@/hooks/use-rbac";
import { Video, CollectionsService } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { useCollections } from "./collections-context";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { MoveVideoDialog } from "./move-video-dialog";

interface VideoGridProps {
  collectionId: string;
}

export function VideoGrid({ collectionId }: VideoGridProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const { canWrite, canDelete } = useRBAC();
  const [movingVideo, setMovingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);

  const loadVideos = useCallback(async () => {
    if (!user?.uid) return;

    console.log("🔍 [Video Grid] Loading videos for collection:", collectionId, "user:", user.uid);
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await RBACClientService.getCollectionVideos(
        user.uid,
        collectionId === "all-videos" ? undefined : collectionId,
      );

      console.log("🔍 [Video Grid] Loaded videos:", result.videos.length);
      dispatch({ type: "SET_VIDEOS", payload: result.videos });
    } catch (error) {
      console.error("❌ [Video Grid] Failed to load videos:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user?.uid, collectionId, dispatch]);

  useEffect(() => {
    if (user?.uid) {
      loadVideos();
    }
  }, [user?.uid, collectionId, loadVideos]);

  const handleVideoClick = (video: Video) => {
    dispatch({ type: "SET_SELECTED_VIDEO", payload: video });
    dispatch({ type: "SET_INSIGHTS_DIALOG_OPEN", payload: true });
  };

  const handleToggleFavorite = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      const newFavoriteStatus = !video.favorite;
      await CollectionsService.setVideoFavorite(user.uid, video.id, newFavoriteStatus);

      dispatch({
        type: "UPDATE_VIDEO",
        payload: {
          id: video.id,
          updates: { favorite: newFavoriteStatus },
        },
      });
    } catch (error) {
      console.error("Failed to toggle video favorite:", error);
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!user?.uid || !video.id) return;

    try {
      await CollectionsService.deleteVideo(user.uid, video.id);
      dispatch({ type: "DELETE_VIDEO", payload: video.id });
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (state.loading && state.videos.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(12)].map((_, index) => (
          <div key={`loading-${index}`} className="relative aspect-[9/16]">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {state.videos.map((video) => (
            <div
              key={video.id}
              className="group bg-muted relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg"
              onClick={() => handleVideoClick(video)}
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/50">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </Button>
                </div>

                <div className="absolute top-2 right-2 left-2 flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <Badge className={cn("text-xs", getPlatformBadgeColor(video.platform))}>{video.platform}</Badge>
                    {video.favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(video);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Insights
                      </DropdownMenuItem>
                      {canWrite && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(video);
                          }}
                        >
                          {video.favorite ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove from favorites
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Add to favorites
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {canWrite && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setMovingVideo(video);
                            }}
                          >
                            <Move className="mr-2 h-4 w-4" />
                            Move to Collection
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle copy
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Collection
                          </DropdownMenuItem>
                        </>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingVideo(video);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium text-white">{video.title}</h3>
                  {video.metrics && (
                    <div className="flex items-center gap-3 text-xs text-white/80">
                      {video.metrics.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(video.metrics.views)}
                        </span>
                      )}
                      {video.metrics.likes > 0 && <span>❤️ {formatNumber(video.metrics.likes)}</span>}
                      {video.metrics.comments > 0 && <span>💬 {formatNumber(video.metrics.comments)}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {state.videos.length === 0 && !state.loading && (
          <div className="py-12 text-center">
            <Play className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {collectionId === "all-videos"
                ? "Start by adding your first video to build your collection."
                : "This collection is empty. Add some videos to get started."}
            </p>
            <Button>Add Video</Button>
          </div>
        )}
      </div>

      <MoveVideoDialog
        video={movingVideo}
        open={!!movingVideo}
        onOpenChange={(open) => !open && setMovingVideo(null)}
        onSuccess={() => {
          setMovingVideo(null);
          loadVideos();
        }}
      />

      <DeleteConfirmDialog
        title="Delete Video"
        description={`Are you sure you want to delete "${deletingVideo?.title}"? This action cannot be undone.`}
        open={!!deletingVideo}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
        onConfirm={async () => {
          if (deletingVideo) {
            await handleDeleteVideo(deletingVideo);
            setDeletingVideo(null);
          }
        }}
      />
    </>
  );
}
