"use client";

import { useState } from "react";

import Image from "next/image";

import {
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Copy,
  Lightbulb,
  TrendingUp,
  FileText,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { InsightsTabsContent } from "./insights-tabs-content";

interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  engagementRate?: number;
}

interface Video {
  id: string;
  title: string;
  platform: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  favorite: boolean;
  metrics?: VideoMetrics;
  duration?: string;
  uploadDate?: string;
  description?: string;
  tags?: string[];
}

interface HookIdea {
  id: string;
  text: string;
  type: "question" | "statement" | "statistic" | "story";
  confidence: number;
}

interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  category: "improvement" | "variation" | "trend";
}

interface FocusInsightsPanelProps {
  video: Video | null;
  className?: string;
}

// Helper functions and constants
const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return "text-green-600";
  if (confidence >= 0.7) return "text-yellow-600";
  return "text-orange-600";
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "improvement":
      return <TrendingUp className="h-4 w-4" />;
    case "variation":
      return <Copy className="h-4 w-4" />;
    case "trend":
      return <Sparkles className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

// Mock data - in real app this would come from API
const mockHookIdeas: HookIdea[] = [
  {
    id: "1",
    text: "Did you know that 73% of people make this common mistake?",
    type: "question",
    confidence: 0.92,
  },
  {
    id: "2",
    text: "The secret technique that changed everything...",
    type: "statement",
    confidence: 0.88,
  },
  {
    id: "3",
    text: "Here's what happened when I tried this for 30 days",
    type: "story",
    confidence: 0.85,
  },
];

const mockContentSuggestions: ContentSuggestion[] = [
  {
    id: "1",
    title: "Add captions for accessibility",
    description: "Videos with captions get 40% more engagement",
    category: "improvement",
  },
  {
    id: "2",
    title: "Create a longer version",
    description: "This content could work well as a 3-minute tutorial",
    category: "variation",
  },
  {
    id: "3",
    title: "Trending hashtag opportunity",
    description: "#ProductivityHacks is trending in your niche",
    category: "trend",
  },
];

export function FocusInsightsPanel({ video, className }: FocusInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState("hooks");

  if (!video) {
    return (
      <div className={cn("flex h-full items-center justify-center p-8", className)}>
        <div className="text-center">
          <Eye className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 font-sans text-lg font-semibold">Select a video to view insights</h3>
          <p className="text-muted-foreground text-sm">
            Click on any video from the grid to see detailed analytics and AI-generated insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-background flex h-full flex-col", className)}>
      {/* Video Header */}
      <div className="border-border flex-shrink-0 border-b p-6">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-button)]">
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <Play className="text-muted-foreground h-6 w-6" />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="min-w-0 flex-1">
            <h2 className="mb-2 line-clamp-2 font-sans text-lg font-semibold">{video.title}</h2>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant={video.platform.toLowerCase() === "instagram" ? "instagram" : "secondary"}
                className="text-xs"
              >
                {video.platform}
              </Badge>
              {video.duration && <span className="text-muted-foreground text-xs">{video.duration}</span>}
              <span className="text-muted-foreground text-xs">{formatDate(video.uploadDate)}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <ExternalLink className="h-3 w-3" />
                View
              </Button>

              <Button size="sm" variant="outline" className="gap-2">
                <Copy className="h-3 w-3" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {video.metrics && (
        <div className="border-border flex-shrink-0 border-b p-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center justify-center gap-1">
              <Eye className="text-secondary h-4 w-4" />
              <span className="text-sm font-semibold">{formatNumber(video.metrics.views)}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Heart className="text-destructive h-4 w-4" />
              <span className="text-sm font-semibold">{formatNumber(video.metrics.likes)}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <MessageCircle className="text-primary h-4 w-4" />
              <span className="text-sm font-semibold">{formatNumber(video.metrics.comments)}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Share2 className="text-brand-foreground h-4 w-4" />
              <span className="text-sm font-semibold">
                {video.metrics.shares ? formatNumber(video.metrics.shares) : "0"}
              </span>
            </div>
          </div>
          {video.metrics.engagementRate && (
            <div className="mt-2 flex items-center justify-center gap-1">
              <TrendingUp className="text-secondary h-4 w-4" />
              <span className="text-sm font-semibold">{(video.metrics.engagementRate * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Insights Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <TabsList className="mx-6 mt-4 grid w-full grid-cols-4">
            <TabsTrigger value="hooks" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              <span className="hidden sm:inline">Hooks</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <InsightsTabsContent
              video={video}
              mockHookIdeas={mockHookIdeas}
              mockContentSuggestions={mockContentSuggestions}
              formatDate={formatDate}
              getConfidenceColor={getConfidenceColor}
              getCategoryIcon={getCategoryIcon}
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
