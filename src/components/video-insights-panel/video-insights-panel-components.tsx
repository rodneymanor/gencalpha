"use client";

import React, { useState } from "react";

import { Play, FileText, Clock, Download, X, BookOpen, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScriptComponent } from "@/types/script-panel";
import {
  VideoInsightsTabConfig,
  VideoInsights,
  VideoMetadata,
  HookSuggestion,
  ContentSuggestion,
  ReadabilityAnalysis,
  EngagementMetrics,
  SEOAnalysis,
  MetricCard,
  SUGGESTION_TYPE_ICONS,
  SUGGESTION_TYPE_LABELS,
} from "@/types/video-insights";

/**
 * Video Insights Panel Header Component
 */
interface VideoInsightsHeaderProps {
  videoInsights: VideoInsights;
  copyStatus: string;
  isDownloading: boolean;
  showDownload: boolean;
  customActions?: React.ReactNode;
  onCopy: (content: string) => void;
  onDownload: () => void;
  onClose?: () => void;
}

export function VideoInsightsHeader({
  videoInsights,
  copyStatus,
  isDownloading,
  showDownload,
  customActions,
  onCopy,
  onDownload,
  onClose,
}: VideoInsightsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 p-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
          Video Insights
        </Badge>
        {videoInsights.title && (
          <span className="max-w-[200px] truncate text-sm text-neutral-600">{videoInsights.title}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Dual Action Button - Copy & Download */}
        <div className="flex overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(videoInsights.scriptData.fullScript)}
            disabled={copyStatus === "copying"}
            className={cn(
              "h-8 rounded-none border-r border-neutral-200 px-3 text-xs font-medium transition-colors duration-200",
              copyStatus === "success" && "bg-success-50 text-success-600 dark:bg-success-950/20",
            )}
          >
            {copyStatus === "copying" ? "Copying..." : copyStatus === "success" ? "Copied" : "Copy"}
          </Button>

          {showDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              disabled={isDownloading}
              className="h-8 rounded-none px-2"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Custom Actions */}
        {customActions}

        {/* Close Button */}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-neutral-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Video Insights Panel Tabs Component
 */
interface VideoInsightsTabsProps {
  tabs: VideoInsightsTabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function VideoInsightsTabs({ tabs, activeTab, onTabChange }: VideoInsightsTabsProps) {
  return (
    <div className="flex border-b border-neutral-200 bg-neutral-200/30">
      {tabs
        .filter((tab) => tab.enabled)
        .map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === tab.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900",
            )}
          >
            {tab.label}
          </button>
        ))}
    </div>
  );
}

/**
 * Video Player View Component - Simple iframe player following Soft UI design system
 */
interface VideoPlayerViewProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export function VideoPlayerView({ videoUrl, thumbnailUrl, onPlay, onPause }: VideoPlayerViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine if this is an iframe URL (Bunny.net) or needs fallback
  const isIframeUrl =
    videoUrl && (videoUrl.includes("iframe") || videoUrl.includes("embed") || videoUrl.includes("bunny"));

  const handleIframeLoad = () => {
    setIsLoading(false);
    onPlay?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!videoUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
            <Play className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-neutral-900">No video available</h3>
          <p className="text-sm text-neutral-600">This video doesn't have a playable URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-neutral-50 p-6">
      <div className="relative w-full max-w-md">
        {/* Video Player Container with Soft UI styling */}
        <div
          className="relative overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 shadow-[var(--shadow-soft-drop)]"
          style={{ aspectRatio: "9/16", minHeight: "400px" }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100">
              <div className="text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                <p className="text-sm text-neutral-600">Loading video...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError ? (
            <div className="flex h-full items-center justify-center bg-neutral-100">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-neutral-200">
                  <FileText className="h-8 w-8 text-neutral-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-neutral-900">Unable to load video</h3>
                <p className="text-sm text-neutral-600">There was an error loading this video.</p>
              </div>
            </div>
          ) : isIframeUrl ? (
            // Iframe Video Player
            <iframe
              src={videoUrl}
              className="h-full w-full border-0"
              allowFullScreen
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Video player"
            />
          ) : (
            // Fallback for direct video URLs
            <video
              src={videoUrl}
              poster={thumbnailUrl}
              controls
              className="h-full w-full object-cover"
              onPlay={onPlay}
              onPause={onPause}
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onError={handleIframeError}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Info - Following Soft UI design patterns */}
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-600">{isIframeUrl ? "Iframe Player" : "Direct Video"}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Transcript View Component (Reuses FullScriptView pattern)
 */
interface TranscriptViewProps {
  script: string;
  onCopy: (content: string) => void;
  copyStatus: string;
}

export function TranscriptView({ script, onCopy, copyStatus }: TranscriptViewProps) {
  return (
    <div className="p-6">
      <div className="relative">
        <div className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
          {/* Transcript Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <span className="text-sm font-semibold text-neutral-600">T</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Transcript</span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(script)}
            className={cn(
              "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              copyStatus === "success" && "bg-success-50 text-success-600 dark:bg-success-950/20 opacity-100",
            )}
          >
            {copyStatus === "success" ? "Copied" : "Copy"}
          </Button>

          {/* Transcript Content */}
          <div className="mt-8 text-sm leading-relaxed whitespace-pre-wrap text-neutral-900">{script}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Components View (Reuses existing ComponentsView pattern)
 */
interface VideoComponentsViewProps {
  components: ScriptComponent[];
  onCopy: (content: string, type?: string) => void;
}

export function VideoComponentsView({ components, onCopy }: VideoComponentsViewProps) {
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null);

  const handleComponentCopy = async (content: string, componentId: string, componentType: string) => {
    setCopiedComponent(componentId);
    await onCopy(content, componentType);
    setTimeout(() => setCopiedComponent(null), 2000);
  };

  return (
    <div className="space-y-4 p-6">
      {components.map((component) => (
        <div
          key={component.id}
          className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5 transition-colors duration-200 hover:bg-neutral-100/60"
        >
          {/* Component Header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <span className="text-sm font-semibold text-neutral-600">{component.icon ?? "?"}</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
              {component.label ?? component.type}
            </span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleComponentCopy(component.content, component.id, component.type)}
            className={cn(
              "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              copiedComponent === component.id && "bg-success-50 text-success-600 dark:bg-success-950/20 opacity-100",
            )}
          >
            {copiedComponent === component.id ? "Copied" : "Copy"}
          </Button>

          {/* Component Content */}
          <div className="mt-1 text-sm leading-relaxed text-neutral-900">{component.content}</div>

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 border-t border-neutral-200 pt-3">
            <div className="flex items-center gap-1.5 text-neutral-600">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">{component.wordCount ?? 0} words</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">~{component.estimatedDuration ?? 0}s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Metadata View Component
 */
interface MetadataViewProps {
  metadata: VideoMetadata;
}

export function MetadataView({ metadata }: MetadataViewProps) {
  const metricCards: MetricCard[] = [
    {
      id: "duration",
      label: "Duration",
      value: Math.floor(metadata.duration / 60),
      unit: "min",
      icon: "⏱️",
    },
    {
      id: "views",
      label: "Views",
      value: metadata.viewCount ? (metadata.viewCount / 1000).toFixed(1) : "N/A",
      unit: metadata.viewCount ? "K" : "",
      icon: "👁️",
    },
    {
      id: "likes",
      label: "Likes",
      value: metadata.likeCount ?? "N/A",
      icon: "❤️",
    },
    {
      id: "comments",
      label: "Comments",
      value: metadata.commentCount ?? "N/A",
      icon: "💬",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Video Info Card */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
            <FileText className="h-4 w-4 text-neutral-600" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Video Details</span>
        </div>

        <div className="space-y-3">
          {metadata.title && (
            <div>
              <span className="text-xs text-neutral-600">Title</span>
              <p className="text-sm text-neutral-900">{metadata.title}</p>
            </div>
          )}

          {metadata.description && (
            <div>
              <span className="text-xs text-neutral-600">Description</span>
              <p className="line-clamp-3 text-sm text-neutral-900">{metadata.description}</p>
            </div>
          )}

          {metadata.author && (
            <div>
              <span className="text-xs text-neutral-600">Author</span>
              <p className="text-sm text-neutral-900">{metadata.author.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {metricCards.map((card) => (
          <div key={card.id} className="rounded-[var(--radius-card)] border border-neutral-200">
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-yellow-400/10 text-yellow-400">
                <span className="text-lg">{card.icon}</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-900">
                  {card.value}
                  {card.unit}
                </div>
                <div className="text-xs text-neutral-600">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <span className="text-sm font-semibold text-neutral-600">#</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Tags</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="mt-1 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Suggestions View Component
 */
interface SuggestionsViewProps {
  hooks: HookSuggestion[];
  content: ContentSuggestion[];
  onCopy: (content: string, type?: string) => void;
}

export function SuggestionsView({ hooks, content, onCopy }: SuggestionsViewProps) {
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);

  const handleSuggestionCopy = async (suggestionContent: string, suggestionId: string, type: string) => {
    setCopiedSuggestion(suggestionId);
    await onCopy(suggestionContent, type);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hook Suggestions */}
      {hooks.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium text-neutral-900">Hook Ideas</h3>
          <div className="space-y-4">
            {hooks.map((hook) => (
              <div
                key={hook.id}
                className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5 transition-colors duration-200 hover:bg-neutral-100/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                      <span className="text-sm font-semibold text-neutral-600">{SUGGESTION_TYPE_ICONS[hook.type]}</span>
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                      {SUGGESTION_TYPE_LABELS[hook.type]}
                    </span>
                  </div>

                  <Badge
                    variant={hook.strength === "high" ? "default" : "outline"}
                    className="px-3 py-1.5 text-sm font-medium"
                  >
                    {hook.strength}
                  </Badge>
                </div>

                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionCopy(hook.content, hook.id, "hook")}
                  className={cn(
                    "absolute top-5 right-5 h-7 px-3 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                    copiedSuggestion === hook.id && "bg-success-50 text-success-600 dark:bg-success-950/20 opacity-100",
                  )}
                >
                  {copiedSuggestion === hook.id ? "Copied" : "Copy"}
                </Button>

                <div className="text-sm leading-relaxed text-neutral-900">{hook.content}</div>

                {hook.rationale && (
                  <div className="mt-3 border-t border-neutral-200 pt-3">
                    <span className="text-xs text-neutral-600">{hook.rationale}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Suggestions */}
      {content.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium text-neutral-900">Content Improvements</h3>
          <div className="space-y-4">
            {content.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5 transition-colors duration-200 hover:bg-neutral-100/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                      <span className="text-sm font-semibold text-neutral-600">
                        {suggestion.type === "improvement" ? "↑" : suggestion.type === "addition" ? "+" : "⟲"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                      {suggestion.type} • {suggestion.target}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="mt-1 text-xs">
                      Impact: {suggestion.impact}
                    </Badge>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Effort: {suggestion.effort}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm leading-relaxed text-neutral-900">{suggestion.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Analysis View Component
 */
interface AnalysisViewProps {
  readability: ReadabilityAnalysis;
  engagement: EngagementMetrics;
  seo: SEOAnalysis;
}

export function AnalysisView({ readability, engagement, seo }: AnalysisViewProps) {
  const analysisCards: MetricCard[] = [
    {
      id: "readability",
      label: "Readability Score",
      value: readability.score,
      unit: "/100",
      icon: "📖",
      color: readability.score > 70 ? "success" : readability.score > 50 ? "warning" : "destructive",
    },
    {
      id: "hook-strength",
      label: "Hook Strength",
      value: engagement.hookStrength,
      unit: "/100",
      icon: "🎣",
      color: engagement.hookStrength > 70 ? "success" : engagement.hookStrength > 50 ? "warning" : "destructive",
    },
    {
      id: "retention",
      label: "Retention Potential",
      value: engagement.retentionPotential,
      unit: "/100",
      icon: "🎯",
      color:
        engagement.retentionPotential > 70 ? "success" : engagement.retentionPotential > 50 ? "warning" : "destructive",
    },
    {
      id: "cta-strength",
      label: "CTA Strength",
      value: engagement.callToActionStrength,
      unit: "/100",
      icon: "📢",
      color:
        engagement.callToActionStrength > 70
          ? "success"
          : engagement.callToActionStrength > 50
            ? "warning"
            : "destructive",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Analysis Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {analysisCards.map((card) => (
          <div key={card.id} className="rounded-[var(--radius-card)] border border-neutral-200">
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-yellow-400/10 text-yellow-400">
                <span className="text-lg">{card.icon}</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-900">
                  {card.value}
                  {card.unit}
                </div>
                <div className="text-xs text-neutral-600">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Readability Details */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
            <BookOpen className="h-4 w-4 text-neutral-600" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Readability Analysis</span>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-xs text-neutral-600">Grade Level</span>
            <p className="text-sm text-neutral-900">{readability.grade}</p>
          </div>

          <div>
            <span className="text-xs text-neutral-600">Complexity</span>
            <Badge variant="outline" className="ml-2 text-xs capitalize">
              {readability.complexity}
            </Badge>
          </div>

          <div>
            <span className="text-xs text-neutral-600">Average Sentence Length</span>
            <p className="text-sm text-neutral-900">{readability.sentenceLength.average} words</p>
          </div>
        </div>

        {readability.recommendations.length > 0 && (
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <span className="text-xs text-neutral-600">Recommendations</span>
            <ul className="mt-2 space-y-1 text-sm text-neutral-900">
              {readability.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SEO Analysis */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
            <Search className="h-4 w-4 text-neutral-600" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">SEO Analysis</span>
        </div>

        <div className="space-y-4">
          {seo.keywordDensity.slice(0, 5).length > 0 && (
            <div>
              <span className="text-xs text-neutral-600">Top Keywords</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {seo.keywordDensity.slice(0, 5).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword.word} ({keyword.density.toFixed(1)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {seo.hashtagSuggestions.length > 0 && (
            <div>
              <span className="text-xs text-neutral-600">Suggested Hashtags</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {seo.hashtagSuggestions.slice(0, 6).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
