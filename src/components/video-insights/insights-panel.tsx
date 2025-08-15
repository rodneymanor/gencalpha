"use client";

import { Lightbulb, FileText, MessageSquare, Video as VideoIcon } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Video } from "@/lib/collections";

import { InsightsSection } from "@/components/video-insights/insights-section";

interface InsightsPanelProps {
  video: Video;
}

// Default insights data
const defaultInsightsData = {
  hookIdeas: [
    "Start with a surprising statistic about your topic",
    "Ask a thought-provoking question to hook viewers",
    "Share a personal story that connects to the content",
    "Use a bold statement that challenges common beliefs",
    "Begin with a visual metaphor or analogy",
  ],
  contentIdeas: [
    "Create a tutorial series based on this video&apos;s topic",
    "Make a response video addressing viewer comments",
    "Develop a behind-the-scenes follow-up",
    "Create a beginner&apos;s guide version",
    "Make a &apos;mistakes to avoid&apos; companion video",
  ],
  videoCaption:
    "🔥 This changes everything! Here&apos;s what I learned about creating engaging content that actually converts. The secret isn&apos;t what you think... #ContentCreator #ViralTips #SocialMediaStrategy",
};

export function InsightsPanel({ video }: InsightsPanelProps) {
  return (
    <ScrollArea className="flex-1 px-6 py-4">
      <div className="space-y-6">
        <InsightsSection title="Hook Ideas" icon={Lightbulb}>
          <ul className="space-y-2">
            {defaultInsightsData.hookIdeas.map((idea, ideaIndex) => (
              <li
                key={`hook-${idea.slice(0, 20)}-${ideaIndex}`}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span className="text-secondary mt-0.5 font-medium">•</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </InsightsSection>

        <InsightsSection title="Content Ideas" icon={FileText}>
          <ul className="space-y-2">
            {defaultInsightsData.contentIdeas.map((idea, ideaIndex) => (
              <li
                key={`content-${idea.slice(0, 20)}-${ideaIndex}`}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span className="text-secondary mt-0.5 font-medium">•</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </InsightsSection>

        <InsightsSection title="Video Caption" icon={MessageSquare}>
          <div className="bg-muted/50 rounded-[var(--radius-button)] p-4">
            <p className="text-foreground text-sm">{defaultInsightsData.videoCaption}</p>
          </div>
        </InsightsSection>

        <InsightsSection title="Transcript" icon={VideoIcon}>
          <div className="bg-muted/50 max-h-48 overflow-y-auto rounded-[var(--radius-button)] p-4">
            <div className="space-y-3 text-sm leading-relaxed">
              {video.transcript ? (
                video.transcript.split("\n").map((line: string, lineIndex: number) => (
                  <p key={`transcript-${line.slice(0, 15)}-${lineIndex}`} className="text-muted-foreground text-sm">
                    {line.trim()}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Hey everyone, welcome back to my channel. Today I want to talk about something that&apos;s been on my
                  mind lately - how we can create content that truly resonates with our audience. I&apos;ve been
                  experimenting with different approaches, and I think I&apos;ve discovered something really
                  interesting...
                </p>
              )}
            </div>
          </div>
        </InsightsSection>
      </div>
    </ScrollArea>
  );
}
