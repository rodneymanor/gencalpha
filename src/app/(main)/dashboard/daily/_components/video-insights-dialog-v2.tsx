"use client";
/* Clean, smaller rewrite of the dialog – <300 lines & reduced complexity */

import { useState, useEffect } from "react";

import { ClarityLoader } from "@/components/ui/loading";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useAuth } from "@/contexts/auth-context";
import { Video } from "@/lib/collections";
import { VideoInsightsService } from "@/lib/video-insights-service";

import { MainInsightsTab } from "./main-insights-tab";
import { StickyActionButtons } from "./sticky-action-buttons";
import { ScriptComponents } from "./video-insights-components";
import { VideoInsightsHeader } from "./video-insights-header";
import { VideoPreviewWithMetrics } from "./video-preview-with-metrics";

interface VideoInsightsDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateHooks?: (video: Video) => void;
  onGenerateTranscript?: (video: Video) => void;
  onRewriteScript?: (video: Video) => void;
}

export function VideoInsightsDialogV2({
  video,
  open,
  onOpenChange,
  onGenerateHooks,
  onGenerateTranscript,
  onRewriteScript,
}: VideoInsightsDialogProps) {
  const { user } = useAuth();
  const [copiedText, setCopiedText] = useState("");
  const [enhancedVideo, setEnhancedVideo] = useState<Video | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // util
  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2_000);
    } catch {
      /* ignore */
    }
  };

  // load enhanced insights when dialog opens
  useEffect(() => {
    if (!video?.id || !user?.uid || !open) {
      setEnhancedVideo(null);
      return;
    }

    setIsLoadingInsights(true);
    VideoInsightsService.getVideoWithInsights(user.uid, video.id)
      .then(setEnhancedVideo)
      .catch(() => setEnhancedVideo(video))
      .finally(() => setIsLoadingInsights(false));
  }, [open, video?.id, user?.uid]);

  if (!video) return null;
  const displayVideo = enhancedVideo ?? video;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(90vh-13px)] !max-w-[1200px] overflow-hidden p-0">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{displayVideo.title} – Video Insights</DialogTitle>
            <DialogDescription>View detailed insights and analytics for this video</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="flex h-full min-h-0">
          {/* Fixed Video Column */}
          <div className="relative flex h-[600px] w-96 flex-shrink-0 items-center justify-center bg-black">
            {isLoadingInsights ? (
              <ClarityLoader size="sm" inverted />
            ) : (
              <VideoPreviewWithMetrics video={displayVideo} showMetrics={false} />
            )}
          </div>

          {/* Main Panel */}
          <div className="bg-background flex h-full min-h-0 flex-1 flex-col">
            <VideoInsightsHeader video={displayVideo} isLoading={isLoadingInsights} formatNumber={formatNumber} />

            <Tabs defaultValue="insights" className="flex min-h-0 flex-1 flex-col">
              <div className="bg-muted/30 flex-shrink-0 border-b p-6">
                <TabsList className="bg-background grid w-full grid-cols-2 border">
                  <TabsTrigger
                    value="insights"
                    className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-medium"
                  >
                    Insights
                  </TabsTrigger>
                  <TabsTrigger
                    value="script"
                    className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-medium"
                  >
                    Script Components
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <TabsContent value="insights" className="mt-0">
                  <MainInsightsTab
                    video={displayVideo}
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    onGenerateHooks={onGenerateHooks}
                    onGenerateTranscript={onGenerateTranscript}
                  />
                </TabsContent>
                <TabsContent value="script" className="mt-0">
                  <ScriptComponents video={displayVideo} copiedText={copiedText} onCopy={copyToClipboard} />
                </TabsContent>
              </div>
            </Tabs>

            <StickyActionButtons video={displayVideo} onRewriteScript={onRewriteScript} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Alias exports for backward compatibility
export const VideoInsightsDialog = VideoInsightsDialogV2;
export const DailyVideoInsightsDialog = VideoInsightsDialogV2;
