"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
            {/* Left Column - Script (1/3 width) */}
            <div className="flex w-1/3 flex-col">
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Script Components</h3>
                <div className="flex-1 overflow-auto">
                  <ScriptComponents video={video} copiedText={copiedText} onCopy={copyToClipboard} />
                </div>
              </div>
            </div>

            {/* Right Column - Information (2/3 width) */}
            <div className="flex w-2/3 flex-col">
              <Tabs defaultValue="overview" className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex-1 overflow-auto">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <VideoPreview video={video} />
                    <VideoMetricsGrid video={video} />
                    <VideoActionButtons video={video} />
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
