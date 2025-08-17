"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AnalyzerHeader } from "./analyzer-header";
import { InsightsPane } from "./insights-pane";
import { ProductionVideoPane } from "./production-video-pane";
import type { AnalysisData, VideoData } from "./types";
import { analyzeTranscriptBasic } from "./utils";

export interface ProductionVideoAnalyzerProps {
  className?: string;
  videoData: VideoData;
  videoSrc?: string | null;
  onExportProfile?: (analysis: AnalysisData) => void;
  onUseStyleForRescript?: (analysis: AnalysisData) => void;
}

export default function ProductionVideoAnalyzer({
  className,
  videoData,
  videoSrc,
  onExportProfile,
  onUseStyleForRescript,
}: ProductionVideoAnalyzerProps) {
  const [activeTab, setActiveTab] = React.useState<"metrics" | "content" | "transcript" | "voice">("metrics");
  const [analysis, setAnalysis] = React.useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const transcriptStats = React.useMemo(() => {
    return analyzeTranscriptBasic(videoData.content.transcript, videoData.durationSec);
  }, [videoData]);

  function handleDeepAnalysis() {
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

      // Call callbacks if provided
      if (onExportProfile) onExportProfile(analysisData);
      if (onUseStyleForRescript) onUseStyleForRescript(analysisData);
    }, 1200);
  }

  function handleCopyLink() {
    if (!videoData.videoUrl) return;
    void navigator.clipboard.writeText(videoData.videoUrl);
  }

  return (
    <Card
      className={cn(
        "bg-card text-card-foreground rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)]",
        className,
      )}
    >
      <CardHeader className="border-border border-b">
        <AnalyzerHeader
          creatorName={videoData.creator.name}
          creatorHandle={videoData.creator.handle}
          platform={videoData.platform}
          isInsightsOpen={true}
          onToggleInsights={() => {}} // No-op since insights are always open
          onDeepAnalysis={handleDeepAnalysis}
          onCopyLink={handleCopyLink}
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid transition-all lg:grid-cols-2">
          <ProductionVideoPane videoSrc={videoSrc} title={videoData.title} platform={videoData.platform} />
          <InsightsPane
            activeTab={activeTab}
            onChangeTab={(v) => setActiveTab(v)}
            isAnalyzing={isAnalyzing}
            analysis={analysis}
            video={videoData}
            transcriptStats={transcriptStats}
            onRunAnalysis={handleDeepAnalysis}
          />
        </div>
      </CardContent>
    </Card>
  );
}
