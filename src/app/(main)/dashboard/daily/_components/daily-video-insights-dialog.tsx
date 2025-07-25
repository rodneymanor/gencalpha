"use client";

import { useState } from "react";

import { Zap, FileText, Copy, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { ScriptComponents } from "./video-insights-components";
import { MetadataTab } from "./video-metadata-components";
import { VideoPreviewWithMetrics } from "./video-preview-with-metrics";

interface DailyVideoInsightsDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    <>
      <div className="flex gap-3">
        <Button onClick={handleRemixScript} className="flex-1 gap-2" disabled={!video.transcript}>
          <FileText className="h-4 w-4" />
          Remix Script
        </Button>
      </div>
      {!video.transcript && <p className="text-muted-foreground mt-2 text-xs">Transcript required for AI actions.</p>}
    </>
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

  // Debug logging to see video data structure
  console.log("🎬 [Video Insights] Video data:", {
    id: video.id,
    title: video.title,
    hasTranscript: !!video.transcript,
    hasComponents: !!video.components,
    components: video.components,
    hasMetrics: !!video.metrics,
    metrics: video.metrics,
    hasMetadata: !!video.metadata,
    metadata: video.metadata,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] !w-[1400px] !max-w-[95vw] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Left side - Video Player (Instagram Reels style) */}
          <div className="flex h-full w-[60%] items-center justify-center bg-black">
            <div className="relative h-full w-full max-w-[600px]">
              <VideoPreviewWithMetrics video={video} className="h-full" />
            </div>
          </div>

          {/* Right side - Video Insights (Instagram style) */}
          <div className="bg-background flex h-full w-[40%] flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  <div>
                    <p className="font-semibold">{video.title}</p>
                    <p className="text-muted-foreground text-sm">@{video.creator ?? "creator"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="insights" className="flex h-full flex-col">
                <TabsList className="m-4 grid w-[calc(100%-2rem)] grid-cols-3">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="script">Script Components</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto px-4 pb-4">
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
              </Tabs>
            </div>

            {/* Actions at bottom */}
            <div className="border-t p-4">
              <StickyActionButtons video={video} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
