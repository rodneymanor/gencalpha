"use client";

import { useState } from "react";

import { Play, Clock, User, ExternalLink, Zap, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import {
  VideoPreview,
  VideoMetricsGrid,
  VideoActionButtons,
  ScriptComponents,
  TranscriptTab,
} from "./video-insights-components";
import { MetadataTab } from "./video-metadata-components";

interface DailyVideoInsightsDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Full height video preview component for left column
function VideoPreviewFullHeight({ video }: { video: Video }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-6">
        {/* Video thumbnail taking most of the space */}
        <div className="bg-muted relative mb-4 flex-1 overflow-hidden rounded-lg">
          <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
              <Play className="h-6 w-6 fill-white text-white" />
            </Button>
          </div>
        </div>

        {/* Video info */}
        <div className="space-y-3">
          <div>
            <h3 className="mb-2 text-lg leading-tight font-semibold">{video.title}</h3>
            <div className="text-muted-foreground space-y-2 text-sm">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{video.metadata?.author ?? "Unknown"}</span>
              </div>
              {video.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Original
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sticky action buttons component
function StickyActionButtons({ video }: { video: Video }) {
  const handleWriteHooks = () => {
    console.log("🎬 Write Hooks for video:", video.title);
    console.log("🎬 Video transcript:", video.transcript);
    // TODO: Integrate with hook writing functionality
  };

  const handleRemixScript = () => {
    console.log("📝 Remix Script for video:", video.title);
    console.log("📝 Video transcript:", video.transcript);
    // TODO: Integrate with script remix functionality
  };

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={handleWriteHooks} variant="outline" className="gap-2" disabled={!video.transcript}>
        <Zap className="h-4 w-4" />
        Write Hooks
      </Button>
      <Button onClick={handleRemixScript} className="gap-2" disabled={!video.transcript}>
        <FileText className="h-4 w-4" />
        Remix Script
      </Button>
      {!video.transcript && <p className="text-muted-foreground text-xs">Transcript required for AI actions.</p>}
    </div>
  );
}

export function DailyVideoInsightsDialog({ video, open, onOpenChange }: DailyVideoInsightsDialogProps) {
  const [copiedText, setCopiedText] = useState<string>("");

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-7xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  video.platform.toLowerCase() === "tiktok"
                    ? "bg-black text-white"
                    : video.platform.toLowerCase() === "instagram"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-red-600 text-white",
                )}
              >
                {video.platform}
              </Badge>
              <span className="truncate">{video.title}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed insights, script components, transcript and metadata for this viral video.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full gap-6">
            {/* Left Column - Video & Actions (1/3 width, full height) */}
            <div className="flex w-1/3 flex-col">
              <div className="flex-1 overflow-auto">
                <VideoPreviewFullHeight video={video} />
              </div>
              {/* Sticky Action Buttons */}
              <div className="bg-background sticky bottom-0 mt-4 border-t pt-4">
                <StickyActionButtons video={video} />
              </div>
            </div>

            {/* Right Column - All Insights (2/3 width) */}
            <div className="flex w-2/3 flex-col">
              <Tabs defaultValue="script" className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="script">Script</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex-1 overflow-auto">
                  <TabsContent value="script" className="mt-0 space-y-4">
                    <ScriptComponents video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                  </TabsContent>

                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <VideoMetricsGrid video={video} />
                  </TabsContent>

                  <TabsContent value="transcript" className="mt-0 space-y-4">
                    <TranscriptTab video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-0 space-y-4">
                    <MetadataTab video={video} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
