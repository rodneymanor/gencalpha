"use client";

import { useState } from "react";

import Image from "next/image";

import { Play, Clock, User, ExternalLink, Zap, FileText, Copy, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { ScriptComponents } from "./video-insights-components";
import { MetadataTab } from "./video-metadata-components";

interface DailyVideoInsightsDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Left column with video and Instagram-style metrics overlay
function VideoAndMetricsColumn({ video }: { video: Video }) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex h-full flex-col p-4">
        <div className="bg-muted relative mb-3 flex-1 overflow-hidden rounded-lg">
          {video.thumbnailUrl ? (
            <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <div className="text-muted-foreground text-center">
                <Play className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No Preview</p>
              </div>
            </div>
          )}

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
              <Play className="h-6 w-6 fill-white text-white" />
            </Button>
          </div>

          {/* Instagram-style metrics overlay on right side */}
          {video.metrics && (
            <div className="absolute right-4 bottom-4 flex flex-col items-center gap-4">
              {/* Likes */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.likes)}
                </span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                  <span className="text-lg">💬</span>
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.comments)}
                </span>
              </div>

              {/* Shares */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                  <span className="text-lg">🔄</span>
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.shares)}
                </span>
              </div>

              {/* Views */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                  <span className="text-lg">👁️</span>
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.views)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <User className="h-4 w-4" />
            <span>{video.metadata?.author ?? "Unknown"}</span>
          </div>
          {video.duration && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm">
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
      </CardContent>
    </Card>
  );
}

// Main insights tab with hooks and transcript
function MainInsightsTab({
  video,
  copiedText,
  onCopy,
}: {
  video: Video;
  copiedText: string;
  onCopy: (text: string, label: string) => void;
}) {
  const handleGenerateHooks = () => {
    console.log("🎬 Generate Hooks for video:", video.title);
    console.log("🎬 Video transcript:", video.transcript);
  };

  const handleGenerateTranscript = () => {
    console.log("🎤 Generate Transcript for video:", video.title);
    console.log("🎤 Video URL:", video.originalUrl);
  };

  return (
    <div className="space-y-6">
      {/* Hook Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Hooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Create engaging hooks based on this video&apos;s content and style.
          </p>
          <Button onClick={handleGenerateHooks} className="gap-2" disabled={!video.transcript}>
            <Zap className="h-4 w-4" />
            Generate Hooks
          </Button>
          {!video.transcript && (
            <p className="text-muted-foreground mt-2 text-xs">Transcript required for hook generation.</p>
          )}
        </CardContent>
      </Card>

      {/* Transcript Section */}
      {video.transcript ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Full Transcript</span>
              <Button variant="outline" size="sm" onClick={() => onCopy(video.transcript!, "transcript")}>
                {copiedText === "transcript" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={video.transcript} readOnly rows={8} className="resize-none" />
            {video.visualContext && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="mb-2 font-semibold">Visual Context</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{video.visualContext}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50">📄</div>
            <h3 className="mb-2 text-lg font-semibold">No Transcript Available</h3>
            <p className="text-muted-foreground mb-4">The transcript hasn&apos;t been generated yet for this video.</p>
            <Button onClick={handleGenerateTranscript} className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Transcript
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sticky action buttons component for bottom right
function StickyActionButtons({ video }: { video: Video }) {
  const handleRemixScript = () => {
    console.log("📝 Remix Script for video:", video.title);
    console.log("📝 Video transcript:", video.transcript);
  };

  return (
    <div className="bg-background sticky bottom-0 border-t pt-4">
      <div className="flex gap-3">
        <Button onClick={handleRemixScript} className="flex-1 gap-2" disabled={!video.transcript}>
          <FileText className="h-4 w-4" />
          Remix Script
        </Button>
      </div>
      {!video.transcript && <p className="text-muted-foreground mt-2 text-xs">Transcript required for AI actions.</p>}
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
      <DialogContent className="flex h-[90vh] w-[900px] !max-w-[900px] flex-col">
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
            {/* Left Column - Video & Metrics (1/3 width) */}
            <div className="w-1/3">
              <VideoAndMetricsColumn video={video} />
            </div>

            {/* Right Column - Main Insights with Sticky Actions (2/3 width) */}
            <div className="flex w-2/3 flex-col">
              <Tabs defaultValue="insights" className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="script">Script Components</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex-1 overflow-hidden">
                  <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto">
                      <TabsContent value="insights" className="mt-0">
                        <MainInsightsTab video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                      </TabsContent>

                      <TabsContent value="script" className="mt-0">
                        <ScriptComponents video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                      </TabsContent>

                      <TabsContent value="metadata" className="mt-0">
                        <MetadataTab video={video} />
                      </TabsContent>
                    </div>

                    {/* Sticky Action Buttons at Bottom */}
                    <StickyActionButtons video={video} />
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
