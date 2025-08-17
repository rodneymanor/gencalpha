"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AnalyzerHeader } from "./analyzer-header";
import { InsightsPane } from "./insights-pane";
import type { AnalysisData, SocialMediaVideoAnalyzerProps, VideoData } from "./types";
import { analyzeTranscriptBasic, detectPlatform, sampleData } from "./utils";
import { VideoPane } from "./video-pane";

export default function SocialMediaVideoAnalyzer({
  className,
  initialData,
  onExportProfile: _onExportProfile,
  onUseStyleForRescript: _onUseStyleForRescript,
}: SocialMediaVideoAnalyzerProps) {
  const [url, setUrl] = React.useState("");
  const [isInsightsOpen, setInsightsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"metrics" | "content" | "transcript" | "voice">("metrics");
  const [video, setVideo] = React.useState<VideoData | null>(initialData ?? null);
  const [videoSrc, setVideoSrc] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const transcriptStats = React.useMemo(() => {
    if (!video) return null;
    return analyzeTranscriptBasic(video.content.transcript, video.durationSec);
  }, [video]);

  function handleLoadVideo(inputUrl?: string) {
    const u = (inputUrl ?? url).trim();
    if (!u) return;
    const platform = detectPlatform(u);
    if (!platform) {
      alert("Please enter a valid TikTok, Instagram, or YouTube Shorts URL");
      return;
    }
    setVideo(sampleData);
    setVideoSrc("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    setTimeout(() => {
      if (!isInsightsOpen) setInsightsOpen(true);
    }, 400);
  }

  function handleDeepAnalysis() {
    if (!video) {
      alert("Please load a video first");
      return;
    }
    setActiveTab("voice");
    setIsAnalyzing(true);
    setTimeout(() => {
      const analysisData: AnalysisData = {
        voiceSignature: {
          tone: "Conversational & Authoritative",
          toneStrengthPercent: 75,
          register: "Semi-Formal",
          registerPositionPercent: 65,
          energy: "High Engagement",
          energyLevelDots: 4,
        },
        linguisticPatterns: {
          dominantStructures: [
            "Short declarative openers (5-7 words)",
            "Complex middle sentences (15-20 words)",
            "Question-based transitions",
            "List-based explanations",
          ],
          signaturePhrases: [
            '"Here\'s what you need to do"',
            '"The key is to understand"',
            '"Stop scrolling"',
            '"Let\'s talk about"',
            '"First, let\'s"',
            '"So here\'s"',
          ],
          vocabulary: { complexity: "Accessible (Grade 8-10)", uniqueWords: "68%", technicalTerms: "12%" },
        },
        rhetoricalFramework: {
          persuasionTechniques: [
            "Problem-Solution Framework",
            "Social Proof & Authority",
            'Direct Address ("You")',
            "Urgency Triggers",
            "Concrete Examples",
          ],
          narrativeStyle:
            "Linear progression with strategic hooks. Opens with attention-grabbing statement, builds through logical steps, closes with actionable takeaway.",
        },
        microElements: {
          discourseMarkers: ["So", "First", "Actually", "Here's the thing", "But", "Now", "Right?"],
          cadencePattern: "Varied pacing with punchy openers and detailed explanations",
        },
      };
      setAnalysis(analysisData);
      setIsAnalyzing(false);
    }, 1200);
  }

  function handleCopyLink() {
    const link = video?.videoUrl ?? url;
    if (!link) return;
    void navigator.clipboard.writeText(link);
  }

  // Callbacks can be passed from parent when integrating

  return (
    <Card
      className={cn(
        "bg-card text-card-foreground rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)]",
        className,
      )}
    >
      <CardHeader className="border-border border-b">
        <AnalyzerHeader
          creatorName={video?.creator.name}
          creatorHandle={video?.creator.handle}
          platform={video?.platform}
          isInsightsOpen={isInsightsOpen}
          onToggleInsights={() => setInsightsOpen((v) => !v)}
          onDeepAnalysis={handleDeepAnalysis}
          onCopyLink={handleCopyLink}
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("grid transition-all", isInsightsOpen ? "lg:grid-cols-2" : "grid-cols-1")}>
          <VideoPane url={url} setUrl={setUrl} videoSrc={videoSrc} onLoadVideo={handleLoadVideo} />
          {isInsightsOpen && (
            <InsightsPane
              activeTab={activeTab}
              onChangeTab={(v) => setActiveTab(v)}
              isAnalyzing={isAnalyzing}
              analysis={analysis}
              video={video}
              transcriptStats={transcriptStats}
              onRunAnalysis={handleDeepAnalysis}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
