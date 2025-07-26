"use client";

import { useState } from "react";

import { Play, Clock, User, ExternalLink, Copy, CheckCircle, Zap, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRBAC } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";

import { useCollections } from "./collections-context";
import { ScriptComponentsTab } from "./script-components-tab";
import { VideoMetricsGrid } from "./video-metrics-grid";

export function VideoInsightsDialog() {
  const { state, dispatch } = useCollections();
  const [copiedText, setCopiedText] = useState<string>("");

  const video = state.selectedVideo;

  const handleClose = () => {
    dispatch({ type: "SET_INSIGHTS_DIALOG_OPEN", payload: false });
    dispatch({ type: "SET_SELECTED_VIDEO", payload: null });
  };

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
    <Dialog open={state.isInsightsDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-[90vh] w-[900px] !max-w-[900px] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  video.platform?.toLowerCase() === "tiktok"
                    ? "bg-black text-white"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                )}
              >
                {video.platform}
              </Badge>
              <span className="truncate">{video.title}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed insights, script components, transcript and metadata for this video.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full gap-6">
            {/* Left Column - Script (1/3 width) */}
            <div className="flex w-1/3 flex-col">
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Script Components</h3>
                <div className="flex-1 overflow-auto">
                  <ScriptComponentsTab components={video.components} copiedText={copiedText} onCopy={copyToClipboard} />
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
                    {video.metrics && <VideoMetricsGrid metrics={video.metrics} />}
                    <VideoActionButtons video={video} />
                  </TabsContent>

                  <TabsContent value="transcript" className="mt-0 space-y-4">
                    <TranscriptTab
                      transcript={video.transcript}
                      visualContext={video.visualContext}
                      copiedText={copiedText}
                      onCopy={copyToClipboard}
                      video={video}
                    />
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

function VideoPreview({ video }: { video: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="bg-muted relative aspect-[9/16] w-48 overflow-hidden rounded-lg">
            {video.thumbnailUrl && (
              <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="icon" className="rounded-full">
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">{video.title}</h3>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {video.metadata?.author ?? "Unknown"}
                </span>
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  <a
                    href={video.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Original
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoActionButtons({ video }: { video: any }) {
  const { canWrite, loading } = useRBAC();

  const handleGenerateHooks = () => {
    console.log("🎬 Generate Hooks for video:", video.title);
    // TODO: Implement hook generation from video transcript
    // This will integrate with your existing hook generation pipeline
  };

  const handleGenerateScript = () => {
    console.log("📝 Generate Script for video:", video.title);
    console.log("📝 Video transcript:", video.transcript);
    // TODO: Implement script generation from video transcript
    // This will:
    // 1. Take the video transcript
    // 2. Send it through the script writing process
    // 3. Open the right-hand panel with generated script
  };

  // Don't show AI actions if user doesn't have write permissions
  if (loading || !canWrite) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button onClick={handleGenerateHooks} variant="outline" className="flex-1 gap-2" disabled={!video.transcript}>
            <Zap className="h-4 w-4" />
            Generate Hooks
          </Button>
          <Button onClick={handleGenerateScript} className="flex-1 gap-2" disabled={!video.transcript}>
            <FileText className="h-4 w-4" />
            Generate Script
          </Button>
        </div>
        {!video.transcript && (
          <p className="text-muted-foreground mt-2 text-sm">
            Transcript required for AI actions. Generate transcript first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TranscriptTab({ transcript, visualContext, copiedText, onCopy, video }: any) {
  const handleGenerateTranscript = () => {
    console.log("🎤 Generate Transcript for video:", video?.title);
    console.log("🎤 Video URL:", video?.originalUrl);
    // TODO: Implement transcript generation
    // This will:
    // 1. Call the transcription API endpoint
    // 2. Process the video's audio
    // 3. Update the video with the generated transcript
  };

  if (!transcript) {
    return (
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Full Transcript</span>
          <Button variant="outline" size="sm" onClick={() => onCopy(transcript, "transcript")}>
            {copiedText === "transcript" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea value={transcript} readOnly rows={12} className="resize-none" />
        {visualContext && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="mb-2 font-semibold">Visual Context</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{visualContext}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetadataTab({ video }: { video: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <Badge>{video.platform}</Badge>
          </div>
          {video.metadata?.author && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Author:</span>
              <span>{video.metadata.author}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Added:</span>
            <span>{new Date(video.addedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <span className="text-muted-foreground text-sm">Original URL:</span>
            <div className="mt-1">
              <a
                href={video.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm break-all hover:underline"
              >
                {video.originalUrl}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {video.metadata?.hashtags && video.metadata.hashtags.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {video.metadata.hashtags.map((hashtag: string, index: number) => (
                <Badge key={`hashtag-${index}`} variant="secondary">
                  #{hashtag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
