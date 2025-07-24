import Image from "next/image";

import { Play, Clock, User, ExternalLink, Copy, CheckCircle, Zap, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useRBAC } from "@/hooks/use-rbac";
import { Video } from "@/lib/collections";

export function VideoPreview({ video }: { video: Video }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="bg-muted relative aspect-[9/16] w-48 overflow-hidden rounded-lg">
            <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                <Play className="h-6 w-6 fill-white text-white" />
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
            {video.description && (
              <div>
                <h4 className="mb-1 font-medium">Description</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{video.description}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VideoMetricsGrid({ video }: { video: Video }) {
  if (!video.metrics) return null;

  const metrics = [
    { label: "Views", value: video.metrics.views, icon: "👁️" },
    { label: "Likes", value: video.metrics.likes, icon: "❤️" },
    { label: "Comments", value: video.metrics.comments, icon: "💬" },
    { label: "Shares", value: video.metrics.shares, icon: "🔄" },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="mb-1 text-2xl">{metric.icon}</div>
              <div className="text-2xl font-bold">{formatNumber(metric.value)}</div>
              <div className="text-muted-foreground text-sm">{metric.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VideoActionButtons({ video }: { video: Video }) {
  const { canWrite, loading } = useRBAC();

  const handleGenerateHooks = () => {
    console.log("🎬 Generate Hooks for video:", video.title);
  };

  const handleGenerateScript = () => {
    console.log("📝 Generate Script for video:", video.title);
    console.log("📝 Video transcript:", video.transcript);
  };

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

export function ScriptComponents({
  video,
  copiedText,
  onCopy,
}: {
  video: Video;
  copiedText: string;
  onCopy: (text: string, label: string) => void;
}) {
  if (!video.components || !Array.isArray(video.components) || video.components.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50">📝</div>
          <h3 className="mb-2 text-lg font-semibold">No Script Components</h3>
          <p className="text-muted-foreground">This video doesn&rsquo;t have generated script components yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {video.components.map((component: { type: string; content: string }, index: number) => (
        <Card key={`component-${component.type}-${component.content.slice(0, 20)}-${index}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{component.type}</span>
              <Button variant="outline" size="sm" onClick={() => onCopy(component.content, `component-${index}`)}>
                {copiedText === `component-${index}` ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{component.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TranscriptTab({
  video,
  copiedText,
  onCopy,
}: {
  video: Video;
  copiedText: string;
  onCopy: (text: string, label: string) => void;
}) {
  const handleGenerateTranscript = () => {
    console.log("🎤 Generate Transcript for video:", video.title);
    console.log("🎤 Video URL:", video.originalUrl);
  };

  if (!video.transcript) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50">📄</div>
          <h3 className="mb-2 text-lg font-semibold">No Transcript Available</h3>
          <p className="text-muted-foreground mb-4">The transcript hasn&rsquo;t been generated yet for this video.</p>
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
          <Button variant="outline" size="sm" onClick={() => onCopy(video.transcript!, "transcript")}>
            {copiedText === "transcript" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea value={video.transcript} readOnly rows={12} className="resize-none" />
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
  );
}
