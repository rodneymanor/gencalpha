/**
 * Video Insights Panel Types
 *
 * Defines the data structures for video insights components and analysis data
 * used in the VideoInsightsPanel slideout component.
 */

import { ScriptData } from "@/types/script-panel";

export type VideoInsightsTabType = "video" | "transcript" | "components" | "metadata" | "suggestions" | "analysis";

export interface VideoMetadata {
  title?: string;
  duration: number; // in seconds
  resolution?: string;
  format?: string;
  thumbnailUrl?: string;
  uploadDate?: Date | string;
  platform?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  tags?: string[];
  description?: string;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

export interface HookSuggestion {
  id: string;
  type: "question" | "statement" | "statistic" | "story";
  content: string;
  strength: "high" | "medium" | "low";
  rationale?: string;
  estimatedEngagement?: number;
}

export interface ContentSuggestion {
  id: string;
  type: "improvement" | "addition" | "restructure";
  target: "opening" | "middle" | "closing" | "overall";
  suggestion: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface ReadabilityAnalysis {
  score: number; // 0-100
  grade: string;
  complexity: "low" | "medium" | "high";
  sentenceLength: {
    average: number;
    longest: number;
    shortest: number;
  };
  wordComplexity: {
    simple: number;
    complex: number;
    percentage: number;
  };
  recommendations: string[];
}

export interface EngagementMetrics {
  hookStrength: number; // 0-100
  paceVariation: number; // 0-100
  emotionalTone: {
    positive: number;
    negative: number;
    neutral: number;
  };
  callToActionStrength: number; // 0-100
  retentionPotential: number; // 0-100
  predictedDropoffPoints: {
    timestamp: number;
    reason: string;
    confidence: number;
  }[];
}

export interface SEOAnalysis {
  keywordDensity: {
    word: string;
    count: number;
    density: number;
  }[];
  titleOptimization: {
    score: number;
    suggestions: string[];
  };
  descriptionOptimization: {
    score: number;
    suggestions: string[];
  };
  hashtagSuggestions: string[];
}

export interface VideoInsights {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  scriptData: ScriptData; // Reuse existing ScriptData type
  metadata: VideoMetadata;
  suggestions: {
    hooks: HookSuggestion[];
    content: ContentSuggestion[];
  };
  analysis: {
    readability: ReadabilityAnalysis;
    engagement: EngagementMetrics;
    seo: SEOAnalysis;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VideoInsightsPanelProps {
  videoInsights: VideoInsights;
  isLoading?: boolean;
  onCopy?: (content: string, componentType?: string) => void;
  onDownload?: (videoInsights: VideoInsights) => void;
  onClose?: () => void;
  className?: string;
  showDownload?: boolean;
  showMetrics?: boolean;
  customActions?: React.ReactNode;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}

export interface VideoInsightsTabConfig {
  key: VideoInsightsTabType;
  label: string;
  icon?: React.ReactNode;
  enabled: boolean;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
}

export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "brand" | "success" | "warning" | "destructive";
}

// Utility types for video insights hooks
export interface UseVideoInsightsCopyReturn {
  copyText: (text: string) => Promise<boolean>;
  copyStatus: "idle" | "copying" | "success" | "error";
  resetCopyStatus: () => void;
}

export interface UseVideoInsightsDownloadReturn {
  downloadVideoInsights: (videoInsights: VideoInsights, format?: "txt" | "json" | "pdf") => void;
  isDownloading: boolean;
}

// Component icons mapping for suggestions
export const SUGGESTION_TYPE_ICONS: Record<HookSuggestion["type"], string> = {
  question: "?",
  statement: "!",
  statistic: "#",
  story: "S",
};

// Component labels for suggestions
export const SUGGESTION_TYPE_LABELS: Record<HookSuggestion["type"], string> = {
  question: "Question Hook",
  statement: "Statement Hook",
  statistic: "Statistic Hook",
  story: "Story Hook",
};

// Impact/priority colors for suggestions and analysis
export const IMPACT_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "destructive",
  medium: "warning",
  low: "success",
};
