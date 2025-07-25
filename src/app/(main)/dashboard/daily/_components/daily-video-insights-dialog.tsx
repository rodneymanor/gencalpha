"use client";

import { useState } from "react";

import { Zap, FileText, Copy, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      {/* Hook Section with prominent display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Hook
            </span>
            <div className="flex gap-2">
              <Button onClick={handleGenerateHooks} size="sm" className="gap-2" disabled={!video.transcript}>
                <Zap className="h-4 w-4" />
                Generate Hook
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 flex min-h-[80px] items-center rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              {(video as any).hook ?? "No hook available. Generate one using the button above."}
            </p>
          </div>
          {!video.transcript && (
            <p className="text-muted-foreground mt-3 text-xs">Transcript required for hook generation.</p>
          )}
        </CardContent>
      </Card>

      {/* Transcript Section with fixed height and scrolling */}
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
            <div className="bg-muted/20 h-60 overflow-y-auto rounded-lg p-4 text-sm leading-relaxed">
              {video.transcript}
            </div>
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

// Sticky action buttons component for bottom
function StickyActionButtons({ video }: { video: Video }) {
  const handleRewriteScript = () => {
    console.log("✏️ Rewrite Script for video:", video.title);
    console.log("✏️ Video transcript:", video.transcript);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="bg-background sticky bottom-0 border-t px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Video Metrics */}
        {video.metrics && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatNumber(video.metrics.views)}</span>
              <span className="text-muted-foreground">views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatNumber(video.metrics.likes)}</span>
              <span className="text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatNumber(video.metrics.comments)}</span>
              <span className="text-muted-foreground">comments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatNumber(video.metrics.shares)}</span>
              <span className="text-muted-foreground">shares</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleRewriteScript} className="gap-2" disabled={!video.transcript}>
            <FileText className="h-4 w-4" />
            Rewrite Script
          </Button>
        </div>
      </div>
      {!video.transcript && (
        <p className="text-muted-foreground mt-2 text-right text-xs">Transcript required for AI actions.</p>
      )}
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
      <DialogContent className="h-[calc(90vh-13px)] !max-w-[1200px] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Fixed Video Column */}
          <div className="flex h-[600px] w-[400px] max-w-[400px] min-w-[400px] items-center justify-center bg-black">
            <VideoPreviewWithMetrics video={video} showMetrics={false} />
          </div>

          {/* Main Content Panel */}
          <div className="bg-background flex flex-1 flex-col">
            {/* Header with video info */}
            <div className="border-b px-6 py-4">
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
                <h2 className="truncate text-lg font-semibold">{video.title}</h2>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Tabs defaultValue="insights" className="flex h-full flex-col">
                <div className="border-b px-6 py-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="script">Script Components</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                </div>

                {/* Scrollable Tab Contents */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <TabsContent value="insights" className="mt-0 h-full">
                    <MainInsightsTab video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                  </TabsContent>

                  <TabsContent value="script" className="mt-0 h-full">
                    <ScriptComponents video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-0 h-full">
                    <MetadataTab video={video} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Sticky Footer - Always Visible */}
            <StickyActionButtons video={video} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
