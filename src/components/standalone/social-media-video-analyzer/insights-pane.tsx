import * as React from "react";

import { BarChart3, FileText, MessageSquare, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ContentPanel, MetricsPanel, TranscriptPanel, VoicePanel } from "./panels";
import type { AnalysisData, VideoData } from "./types";

interface InsightsPaneProps {
  activeTab: "metrics" | "content" | "transcript" | "voice";
  onChangeTab: (tab: "metrics" | "content" | "transcript" | "voice") => void;
  isAnalyzing: boolean;
  analysis: AnalysisData | null;
  video: VideoData | null;
  transcriptStats: {
    wordCount: number;
    avgWordsPerSentence: number;
    readingEase: number;
    easeText: string;
    gradeLabel: string;
    speakingWpm: number;
    keyTopics: string[];
  } | null;
  onRunAnalysis: () => void;
}

export function InsightsPane({
  activeTab,
  onChangeTab,
  isAnalyzing,
  analysis,
  video,
  transcriptStats,
  onRunAnalysis,
}: InsightsPaneProps) {
  return (
    <div className="bg-muted p-6 lg:max-h-[80vh]">
      <Tabs value={activeTab} onValueChange={(v) => onChangeTab(v as typeof activeTab)} className="w-full">
        <TabsList className="border-border bg-card w-full justify-start rounded-[var(--radius-button)] border p-1">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-accent">
            <BarChart3 className="mr-2 size-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-accent">
            <MessageSquare className="mr-2 size-4" /> Content
          </TabsTrigger>
          <TabsTrigger value="transcript" className="data-[state=active]:bg-accent">
            <FileText className="mr-2 size-4" /> Transcript
          </TabsTrigger>
          {(isAnalyzing || analysis) && (
            <TabsTrigger value="voice" className="data-[state=active]:bg-accent">
              <Mic className="mr-2 size-4" /> Voice
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="metrics" className="mt-6">
          <MetricsPanel video={video} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentPanel video={video} />
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          <TranscriptPanel transcript={video?.content.transcript} stats={transcriptStats} />
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          {!analysis ? (
            <div className="grid min-h-[320px] place-items-center">
              <div className="bg-card max-w-sm rounded-[var(--radius-card)] p-6 text-center">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Mic className="text-primary size-10 animate-pulse" />
                    <h3 className="text-base font-semibold">Analyzing Communication Style...</h3>
                    <p className="text-muted-foreground text-sm">
                      Extracting linguistic patterns and voice characteristics...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Mic className="text-muted-foreground size-12" />
                    <h3 className="text-base font-semibold">Deep Linguistic Analysis Available</h3>
                    <p className="text-muted-foreground text-sm">
                      Analyze the creator&apos;s unique communication style, voice patterns, and rhetorical techniques.
                    </p>
                    <Button onClick={onRunAnalysis} className="rounded-[var(--radius-button)]">
                      Run Deep Analysis
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <VoicePanel analysis={analysis} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

