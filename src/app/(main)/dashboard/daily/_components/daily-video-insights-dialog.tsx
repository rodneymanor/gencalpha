"use client";

import { useState, useEffect } from "react";

import { Zap, FileText, Copy, CheckCircle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { VideoInsightsService } from "@/lib/video-insights-service";

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
              {video.components?.hook || "No hook available. Generate one using the button above."}
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
  const { user } = useAuth();
  const [copiedText, setCopiedText] = useState<string>("");
  const [enhancedVideo, setEnhancedVideo] = useState<Video | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  // Load enhanced video insights when dialog opens and video changes
  useEffect(() => {
    const loadVideoInsights = async () => {
      if (!video?.id || !user?.uid || !open) {
        setEnhancedVideo(null);
        return;
      }

      setIsLoadingInsights(true);
      try {
        console.log("🔍 [Video Insights Dialog] Loading enhanced insights for video:", video.id);
        const videoWithInsights = await VideoInsightsService.getVideoWithInsights(user.uid, video.id);
        setEnhancedVideo(videoWithInsights);
        console.log("✅ [Video Insights Dialog] Enhanced insights loaded successfully");
      } catch (error) {
        console.error("❌ [Video Insights Dialog] Failed to load enhanced insights:", error);
        // Fallback to the original video data if enhanced loading fails
        setEnhancedVideo(video);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadVideoInsights();
  }, [video?.id, user?.uid, open]);

  if (!video) return null;

  // Use enhanced video data if available, otherwise fallback to original
  const displayVideo = enhancedVideo || video;

  // Enhanced debug logging for video data structure
  console.log("🎬 [Video Insights Dialog] Complete video object:", {
    id: displayVideo.id,
    title: displayVideo.title,
    platform: displayVideo.platform,
    thumbnailUrl: displayVideo.thumbnailUrl,
    originalUrl: displayVideo.originalUrl,
    iframeUrl: displayVideo.iframeUrl,
    directUrl: displayVideo.directUrl,
    transcript: displayVideo.transcript?.substring(0, 100) + "...",
    hasTranscript: !!displayVideo.transcript,
    transcriptLength: displayVideo.transcript?.length ?? 0,
    components: displayVideo.components,
    hasComponents: !!displayVideo.components,
    metrics: displayVideo.metrics,
    hasMetrics: !!displayVideo.metrics,
    metadata: displayVideo.metadata,
    hasMetadata: !!displayVideo.metadata,
    visualContext: displayVideo.visualContext,
    hasVisualContext: !!displayVideo.visualContext,
    allKeys: Object.keys(displayVideo),
    isLoadingInsights,
    isEnhanced: !!enhancedVideo,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(90vh-13px)] !max-w-[1200px] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{displayVideo.title} - Video Insights</DialogTitle>
          <DialogDescription>
            Video insights and analysis for {displayVideo.title} from {displayVideo.platform}
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full min-h-0">
          {/* Fixed Video Column */}
          <div className="flex h-[600px] w-[400px] max-w-[400px] min-w-[400px] items-center justify-center bg-black">
            {isLoadingInsights ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : (
              <VideoPreviewWithMetrics video={displayVideo} showMetrics={false} />
            )}
          </div>

          {/* Main Content Panel */}
          <div className="bg-background flex h-full min-h-0 flex-1 flex-col">
            {/* Header with video info */}
            <div className="flex-shrink-0 border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    displayVideo.platform.toLowerCase() === "tiktok"
                      ? "bg-black text-white"
                      : displayVideo.platform.toLowerCase() === "instagram"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-red-600 text-white",
                  )}
                >
                  {displayVideo.platform}
                </Badge>
                <h2 className="truncate text-lg font-semibold">{displayVideo.title}</h2>
                {isLoadingInsights && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
              </div>
            </div>

            {/* Tabs Container */}
            <Tabs defaultValue="insights" className="flex min-h-0 flex-1 flex-col">
              {/* Tab List - Fixed Height */}
              <div className="bg-muted/30 flex-shrink-0 border-b px-6 py-4">
                <TabsList className="bg-background grid w-full grid-cols-3 border shadow-sm">
                  <TabsTrigger
                    value="insights"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Insights
                  </TabsTrigger>
                  <TabsTrigger
                    value="script"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Script Components
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Metadata
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Scrollable Tab Contents */}
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <TabsContent value="insights" className="mt-0">
                  <MainInsightsTab video={displayVideo} copiedText={copiedText} onCopy={copyToClipboard} />
                </TabsContent>

                <TabsContent value="script" className="mt-0">
                  <ScriptComponents video={displayVideo} copiedText={copiedText} onCopy={copyToClipboard} />
                </TabsContent>

                <TabsContent value="metadata" className="mt-0">
                  <MetadataTab video={displayVideo} />
                </TabsContent>
              </div>
            </Tabs>

            {/* Sticky Footer - Always Visible */}
            <div className="flex-shrink-0">
              <StickyActionButtons video={displayVideo} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
