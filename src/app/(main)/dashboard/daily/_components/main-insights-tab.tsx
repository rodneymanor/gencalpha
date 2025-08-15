"use client";

import { Zap, FileText, Copy, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/lib/collections";

interface MainInsightsTabProps {
  video: Video;
  copiedText: string;
  onCopy: (text: string, label: string) => void;
  onGenerateHooks?: (video: Video) => void;
  onGenerateTranscript?: (video: Video) => void;
}

export function MainInsightsTab({
  video,
  copiedText,
  onCopy,
  onGenerateHooks,
  onGenerateTranscript,
}: MainInsightsTabProps) {
  const handleGenerateHooks = () => onGenerateHooks?.(video);
  const handleGenerateTranscript = () => onGenerateTranscript?.(video);

  return (
    <div className="space-y-6">
      {/* Hook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> Hook
            </span>
            <Button onClick={handleGenerateHooks} size="sm" className="gap-2" disabled={!video.transcript}>
              <Zap className="h-4 w-4" /> Generate Hook
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 flex min-h-20 items-center rounded-lg p-4 text-sm leading-relaxed">
            {video.components?.hook ?? "No hook available. Generate one using the button above."}
          </div>
          {!video.transcript && (
            <p className="text-muted-foreground mt-3 text-xs">Transcript required for hook generation.</p>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      {video.transcript ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Full Transcript
              <Button variant="outline" size="sm" onClick={() => onCopy(video.transcript!, "transcript")}>
                {copiedText === "transcript" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 h-60 overflow-y-auto rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {video.transcript}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50">📄</div>
            <h3 className="mb-2 text-lg font-semibold">No Transcript Available</h3>
            <p className="text-muted-foreground mb-4">The transcript hasn&apos;t been generated yet for this video.</p>
            <Button onClick={handleGenerateTranscript} className="gap-2">
              <FileText className="h-4 w-4" /> Generate Transcript
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
