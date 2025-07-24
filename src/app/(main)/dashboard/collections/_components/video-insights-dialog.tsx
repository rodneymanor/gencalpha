"use client";

import { useState } from "react";
import { Play, Clock, User, ExternalLink, Copy, CheckCircle, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCollections } from "./collections-context";
import { VideoMetricsGrid } from "./video-metrics-grid";
import { ScriptComponentsTab } from "./script-components-tab";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge className={cn(
                video.platform?.toLowerCase() === "tiktok" 
                  ? "bg-black text-white" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              )}>
                {video.platform}
              </Badge>
              <span className="truncate">{video.title}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <VideoPreview video={video} />
                {video.metrics && <VideoMetricsGrid metrics={video.metrics} />}
                <HookRewriteCard />
              </TabsContent>

              <TabsContent value="script" className="space-y-4 mt-0">
                <ScriptComponentsTab 
                  components={video.components}
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                />
              </TabsContent>

              <TabsContent value="transcript" className="space-y-4 mt-0">
                <TranscriptTab 
                  transcript={video.transcript}
                  visualContext={video.visualContext}
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                />
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4 mt-0">
                <MetadataTab video={video} />
              </TabsContent>
            </div>
          </Tabs>
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
          <div className="w-48 aspect-[9/16] relative rounded-lg overflow-hidden bg-muted">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="icon" className="rounded-full">
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

function HookRewriteCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Hook Rewrite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Rewrite Hook with AI</Button>
      </CardContent>
    </Card>
  );
}

function TranscriptTab({ transcript, visualContext, copiedText, onCopy }: any) {
  if (!transcript) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50">📄</div>
          <h3 className="text-lg font-semibold mb-2">No Transcript Available</h3>
          <p className="text-muted-foreground mb-4">
            The transcript hasn&apos;t been generated yet for this video.
          </p>
          <Button>Generate Transcript</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Full Transcript</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(transcript, "transcript")}
          >
            {copiedText === "transcript" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={transcript}
          readOnly
          rows={12}
          className="resize-none"
        />
        {visualContext && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="font-semibold mb-2">Visual Context</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {visualContext}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetadataTab({ video }: { video: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="text-primary hover:underline text-sm break-all"
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