import * as React from "react";

import { ArrowRight, FileText, MessageSquare, Mic, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { AnalysisData, VideoData } from "./types";
import { SegmentedBar, TickScale, EnergyDots } from "./ui";

export function MetricsPanel({ video }: { video: VideoData | null }) {
  const items = [
    { label: "Views", value: video ? format(video.metrics.views) : "—" },
    { label: "Likes", value: video ? format(video.metrics.likes) : "—" },
    { label: "Comments", value: video ? format(video.metrics.comments) : "—" },
    { label: "Shares", value: video ? format(video.metrics.shares) : "—" },
    { label: "Saves", value: video ? format(video.metrics.saves) : "—" },
    { label: "Engagement Rate", value: video ? `${(video.metrics.engagementRate * 100).toFixed(1)}%` : "—" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {items.map((m) => (
        <div
          key={m.label}
          className="bg-card rounded-[var(--radius-button)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-drop)]"
        >
          <div className="text-muted-foreground text-[12px]">{m.label}</div>
          <div className="mt-1 text-2xl font-semibold">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ContentPanel({ video }: { video: VideoData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[var(--radius-button)] p-3">
        <div className="text-muted-foreground mb-2 text-[12px] font-medium">Format</div>
        <div className="text-sm">{video ? video.content.format.replace(/-/g, " ") : "—"}</div>
      </div>
      <FieldCopy label="Hook" value={video?.content.hook} />
      <FieldCopy label="Caption" value={video?.content.caption} />
      <ListBlock label="Hook Ideas" items={video?.content.hookIdeas ?? []} />
      <ListBlock label="Content Ideas" items={video?.content.contentIdeas ?? []} />
    </div>
  );
}

export function TranscriptPanel({
  transcript,
  stats,
}: {
  transcript: string | undefined;
  stats: {
    wordCount: number;
    avgWordsPerSentence: number;
    readingEase: number;
    easeText: string;
    sentenceCount: number;
    avgSyllablesPerWord: number;
  } | null;
}) {
  if (!transcript) {
    return <div className="text-muted-foreground text-sm">No transcript available.</div>;
  }

  const { easeText, wordCount, sentenceCount, avgWordsPerSentence } = stats || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-[var(--radius-button)] p-3">
          <div className="text-muted-foreground text-[12px]">Words</div>
          <div className="text-xl font-semibold">{wordCount ?? "—"}</div>
        </div>
        <div className="bg-card rounded-[var(--radius-button)] p-3">
          <div className="text-muted-foreground text-[12px]">Sentences</div>
          <div className="text-xl font-semibold">{sentenceCount ?? "—"}</div>
        </div>
        <div className="bg-card rounded-[var(--radius-button)] p-3">
          <div className="text-muted-foreground text-[12px]">Avg Words/Sentence</div>
          <div className="text-xl font-semibold">{avgWordsPerSentence ? avgWordsPerSentence.toFixed(1) : "—"}</div>
        </div>
        <div className="bg-card rounded-[var(--radius-button)] p-3">
          <div className="text-muted-foreground text-[12px]">Reading Level</div>
          <div className="text-xl font-semibold">{easeText ?? "—"}</div>
        </div>
      </div>
      <div className="bg-card rounded-[var(--radius-button)] p-4">
        <h3 className="mb-3 font-medium">Full Transcript</h3>
        <ScrollArea className="max-h-[200px]">
          <div className="text-sm leading-relaxed">{transcript}</div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function VoicePanel({
  analysis,
  isAnalyzing,
  onRunAnalysis,
}: {
  analysis: AnalysisData | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}) {
  if (!analysis && !isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mic className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">Voice Signature Analysis</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Analyze the creator's unique voice patterns, tone, and linguistic style
        </p>
        <button
          type="button"
          onClick={onRunAnalysis}
          className="bg-primary text-primary-foreground rounded-[var(--radius-button)] px-6 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-drop)]"
        >
          <Sparkles className="mr-2 inline h-4 w-4" />
          Run Voice Analysis
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="border-muted border-t-primary mb-4 h-12 w-12 animate-spin rounded-full border-4" />
        <h3 className="mb-2 text-lg font-medium">Analyzing Voice Signature...</h3>
        <p className="text-muted-foreground text-sm">This may take a moment</p>
      </div>
    );
  }

  if (!analysis) return null;

  const { voiceSignature, linguisticPatterns, rhetoricalFramework, microElements } = analysis;

  return (
    <div className="space-y-8">
      {/* Voice Signature */}
      <div className="space-y-4">
        <h3 className="flex items-center text-lg font-medium">
          <Mic className="mr-2 h-5 w-5" />
          Voice Signature
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card rounded-[var(--radius-button)] p-4">
            <div className="text-muted-foreground mb-2 text-[12px]">Tone</div>
            <div className="mb-3 font-medium">{voiceSignature.tone}</div>
            <SegmentedBar value={voiceSignature.toneStrengthPercent} />
          </div>
          <div className="bg-card rounded-[var(--radius-button)] p-4">
            <div className="text-muted-foreground mb-2 text-[12px]">Register</div>
            <div className="mb-3 font-medium">{voiceSignature.register}</div>
            <TickScale value={voiceSignature.registerPositionPercent} />
          </div>
          <div className="bg-card rounded-[var(--radius-button)] p-4">
            <div className="text-muted-foreground mb-2 text-[12px]">Energy</div>
            <div className="mb-3 font-medium">{voiceSignature.energy}</div>
            <EnergyDots count={voiceSignature.energyLevelDots} />
          </div>
        </div>
      </div>

      {/* Linguistic Patterns */}
      <div className="space-y-4">
        <h3 className="flex items-center text-lg font-medium">
          <FileText className="mr-2 h-5 w-5" />
          Linguistic Patterns
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="bg-card rounded-[var(--radius-button)] p-4">
              <h4 className="mb-3 font-medium">Vocabulary Profile</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complexity:</span>
                  <span>{linguisticPatterns.vocabulary.complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unique Words:</span>
                  <span>{linguisticPatterns.vocabulary.uniqueWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technical Terms:</span>
                  <span>{linguisticPatterns.vocabulary.technicalTerms}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <ListBlock label="Dominant Structures" items={linguisticPatterns.dominantStructures} />
            <ListBlock label="Signature Phrases" items={linguisticPatterns.signaturePhrases} />
          </div>
        </div>
      </div>

      {/* Rhetorical Framework */}
      <div className="space-y-4">
        <h3 className="flex items-center text-lg font-medium">
          <MessageSquare className="mr-2 h-5 w-5" />
          Rhetorical Framework
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <ListBlock label="Persuasion Techniques" items={rhetoricalFramework.persuasionTechniques} />
          <div className="bg-card rounded-[var(--radius-button)] p-4">
            <h4 className="mb-3 font-medium">Narrative Style</h4>
            <p className="text-sm leading-relaxed">{rhetoricalFramework.narrativeStyle}</p>
          </div>
        </div>
      </div>

      {/* Micro Elements */}
      <div className="space-y-4">
        <h3 className="flex items-center text-lg font-medium">
          <ArrowRight className="mr-2 h-5 w-5" />
          Micro Elements
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <ListBlock label="Discourse Markers" items={microElements.discourseMarkers} />
          <div className="bg-card rounded-[var(--radius-button)] p-4">
            <h4 className="mb-3 font-medium">Cadence Pattern</h4>
            <p className="text-sm leading-relaxed">{microElements.cadencePattern}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function format(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function FieldCopy({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-card rounded-[var(--radius-button)] p-4">
      <div className="text-muted-foreground mb-2 text-[12px] font-medium">{label}</div>
      <div className="text-sm leading-relaxed">{value || "—"}</div>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bg-card rounded-[var(--radius-button)] p-4">
      <h4 className="mb-3 font-medium">{label}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start text-sm">
            <Badge variant="secondary" className="mt-0.5 mr-2 h-5 w-5 rounded-full p-0 text-[10px]">
              {i + 1}
            </Badge>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
