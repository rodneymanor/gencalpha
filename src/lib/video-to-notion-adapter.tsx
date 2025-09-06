/**
 * Video to Notion Panel Adapter
 *
 * Transforms Video and VideoInsights data structures into formats compatible with NotionPanel
 */

import React, { useState } from "react";

import { Copy, Play, ChevronDown, ChevronUp } from "lucide-react";

import { PageProperty } from "@/components/panels/notion/NotionPanelProperties";
import { TabData } from "@/components/panels/notion/NotionPanelTabs";
import { Video } from "@/lib/collections";
import { VideoInsights } from "@/types/video-insights";

export interface VideoNotionData {
  title: string;
  properties: PageProperty[];
  tabData: TabData;
  video: Video;
  platform?: string;
  onCopy?: (content: string, componentType?: string) => void;
  onDownload?: () => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}

// Note: ScriptActionButtons component moved to VideoNotionPanel level

/**
 * Expandable Video Metadata Component
 */
const ExpandableVideoMetadata = ({ videoInsights }: { videoInsights: VideoInsights }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const metadataItems = [
    { label: "Duration", value: formatDuration(videoInsights.metadata.duration) },
    { label: "Platform", value: videoInsights.metadata.platform?.toUpperCase() },
    {
      label: "Views",
      value: videoInsights.metadata.viewCount ? formatNumber(videoInsights.metadata.viewCount) : undefined,
    },
    {
      label: "Likes",
      value: videoInsights.metadata.likeCount ? formatNumber(videoInsights.metadata.likeCount) : undefined,
    },
    {
      label: "Comments",
      value: videoInsights.metadata.commentCount ? formatNumber(videoInsights.metadata.commentCount) : undefined,
    },
    {
      label: "Upload Date",
      value: videoInsights.metadata.uploadDate
        ? new Date(videoInsights.metadata.uploadDate).toLocaleDateString()
        : undefined,
    },
    { label: "Author", value: videoInsights.metadata.author?.name },
  ].filter((item) => item.value);

  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-neutral-100"
      >
        <h4 className="text-sm font-medium text-neutral-900">Video Metadata</h4>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-600" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 px-4 pb-4">
          <div className="space-y-3 pt-3">
            {metadataItems.map((item) => (
              <div key={item.label} className="flex justify-between py-1">
                <span className="text-sm text-neutral-600">{item.label}</span>
                <span className="text-sm font-medium text-neutral-900">{item.value}</span>
              </div>
            ))}

            {videoInsights.metadata.tags && videoInsights.metadata.tags.length > 0 && (
              <div className="pt-2">
                <div className="mb-2 text-sm text-neutral-600">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {videoInsights.metadata.tags.slice(0, 10).map((tag, index) => (
                    <span key={index} className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Transform a Video object into NotionPanel-compatible properties
 * Note: Properties are now integrated into the Video tab as expandable metadata,
 * so we return an empty array to avoid duplicate display above tabs
 */
export function createVideoProperties(video: Video): PageProperty[] {
  // Return empty array since all metadata is now in the expandable section within Video tab
  return [];
}

/**
 * Transform VideoInsights into NotionPanel-compatible tab data
 */
export function createVideoTabData(
  videoInsights: VideoInsights,
  callbacks: {
    onCopy?: (content: string, componentType?: string) => void;
    onVideoPlay?: () => void;
    onVideoPause?: () => void;
  },
): TabData {
  const tabData: TabData = {};

  // Consolidated Video tab with all components
  const videoUrl = videoInsights.videoUrl;

  console.log("🎬 Video URL resolution:", {
    videoInsightsUrl: videoInsights.videoUrl,
    resolvedVideoUrl: videoUrl,
  });

  tabData.video = (
    <div className="space-y-6">
      {/* Video Player Section */}
      {videoUrl ? (
        <>
          {/* Try iframe first (for Bunny.net URLs), fallback to video element */}
          {videoUrl.includes("bunny") || videoUrl.includes("iframe") ? (
            <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] bg-neutral-900">
              <iframe
                src={videoUrl}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoInsights.title || "Video content"}
              />
            </div>
          ) : (
            <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] bg-neutral-900">
              <video
                src={videoUrl}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
                poster={videoInsights.thumbnailUrl}
                onPlay={callbacks.onVideoPlay}
                onPause={callbacks.onVideoPause}
              >
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </>
      ) : (
        // Fallback to thumbnail with play button if no video URL available
        <div className="group relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-neutral-100 shadow-[var(--shadow-soft-drop)]">
          {videoInsights.thumbnailUrl && (
            <img
              src={videoInsights.thumbnailUrl}
              alt={videoInsights.title || "Video thumbnail"}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 transition-all duration-150 group-hover:bg-neutral-900/30">
            <button
              onClick={callbacks.onVideoPlay}
              className="rounded-pill flex h-16 w-16 items-center justify-center bg-neutral-50/90 shadow-[var(--shadow-soft-drop)] transition-all duration-150 hover:scale-110 hover:bg-neutral-50"
            >
              <Play className="ml-1 h-6 w-6 text-neutral-900" />
            </button>
          </div>
        </div>
      )}

      {/* Video Stats - Compact horizontal layout */}
      <div className="mt-3 mb-2 flex items-center justify-center gap-1">
        {videoInsights.metadata.viewCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.viewCount)}</span>
          </div>
        )}

        {videoInsights.metadata.likeCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.likeCount)}</span>
          </div>
        )}

        {videoInsights.metadata.commentCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.commentCount)}</span>
          </div>
        )}

        {videoInsights.metadata.shareCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.shareCount)}</span>
          </div>
        )}
      </div>

      {/* Analysis Section */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-soft-drop)]">
        <h3 className="mb-4 font-medium text-neutral-900">Content Analysis</h3>

        {/* Engagement Metrics */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-neutral-800">Engagement Metrics</h4>
          <div className="space-y-3">
            {[
              { label: "Hook Strength", value: videoInsights.analysis.engagement.hookStrength },
              { label: "Retention Potential", value: videoInsights.analysis.engagement.retentionPotential },
              { label: "CTA Strength", value: videoInsights.analysis.engagement.callToActionStrength },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-3">
                <span className="w-32 text-sm text-neutral-600">{metric.label}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-neutral-900">{metric.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Readability */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-neutral-800">Readability</h4>
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Score</span>
              <span className="text-primary-700 text-lg font-semibold">
                {videoInsights.analysis.readability.score}/100
              </span>
            </div>
            <div className="mb-3 text-xs text-neutral-600">
              Grade Level: {videoInsights.analysis.readability.grade} • Complexity:{" "}
              {videoInsights.analysis.readability.complexity}
            </div>
            {videoInsights.analysis.readability.recommendations.length > 0 && (
              <div>
                <div className="mb-2 text-xs text-neutral-600">Recommendations:</div>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {videoInsights.analysis.readability.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Video Metadata */}
      <ExpandableVideoMetadata videoInsights={videoInsights} />
    </div>
  );

  // Transcript tab with action buttons
  if (videoInsights.scriptData.fullScript) {
    tabData.transcript = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-neutral-900">Full Transcript</h3>
          <button
            onClick={() => callbacks.onCopy?.(videoInsights.scriptData.fullScript, "transcript")}
            className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-200"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <div className="prose prose-neutral max-w-none text-sm">
          <div className="rounded-[var(--radius-card)] border bg-neutral-50 p-4 whitespace-pre-wrap">
            {videoInsights.scriptData.fullScript}
          </div>
        </div>
      </div>
    );
  }

  // Components tab with action buttons
  if (videoInsights.scriptData.components && videoInsights.scriptData.components.length > 0) {
    tabData.components = (
      <div className="space-y-4">
        <h3 className="font-medium text-neutral-900">Script Components</h3>
        <div className="space-y-3">
          {videoInsights.scriptData.components.map((component, index) => (
            <div key={component.id || index} className="rounded-[var(--radius-card)] border bg-neutral-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-primary-100 text-primary-700 flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
                      {component.icon || component.type?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{component.label}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-neutral-600">{component.content}</p>
                </div>
                <button
                  onClick={() => callbacks.onCopy?.(component.content, component.type)}
                  className="rounded-[var(--radius-button)] p-1.5 transition-colors hover:bg-neutral-200"
                >
                  <Copy className="h-3.5 w-3.5 text-neutral-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Note: Metadata is now integrated into the Video tab as an expandable section

  // Suggestions tab
  if (videoInsights.suggestions.hooks.length > 0 || videoInsights.suggestions.content.length > 0) {
    tabData.suggestions = (
      <div className="space-y-4">
        <h3 className="font-medium text-neutral-900">AI Suggestions</h3>

        {videoInsights.suggestions.hooks.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-neutral-800">Hook Ideas</h4>
            <div className="space-y-3">
              {videoInsights.suggestions.hooks.map((hook) => (
                <div key={hook.id} className="bg-primary-50 border-primary-200 rounded-[var(--radius-card)] border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-primary-900 mb-1 text-sm font-medium">{hook.type} Hook</div>
                      <div className="text-primary-800 mb-2 text-sm">{hook.content}</div>
                      <div className="text-primary-700 text-xs">{hook.rationale}</div>
                    </div>
                    <button
                      onClick={() => callbacks.onCopy?.(hook.content, "hook")}
                      className="hover:bg-primary-200 rounded-[var(--radius-button)] p-1.5 transition-colors"
                    >
                      <Copy className="text-primary-700 h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videoInsights.suggestions.content.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-neutral-800">Content Improvements</h4>
            <div className="space-y-3">
              {videoInsights.suggestions.content.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-success-50 border-success-200 rounded-[var(--radius-card)] border p-3"
                >
                  <div className="text-success-900 mb-1 text-sm font-medium">{suggestion.target} Improvement</div>
                  <div className="text-success-800 mb-2 text-sm">{suggestion.suggestion}</div>
                  <div className="text-success-700 flex items-center gap-4 text-xs">
                    <span>Impact: {suggestion.impact}</span>
                    <span>Effort: {suggestion.effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Analysis tab - Extract the analysis content from the video tab for modal use
  tabData.analysis = (
    <div className="space-y-6">
      {/* Video Stats - Compact horizontal layout */}
      <div className="flex items-center justify-center gap-1">
        {videoInsights.metadata.viewCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.viewCount)}</span>
          </div>
        )}

        {videoInsights.metadata.likeCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.likeCount)}</span>
          </div>
        )}

        {videoInsights.metadata.commentCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.commentCount)}</span>
          </div>
        )}

        {videoInsights.metadata.shareCount && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-1.5 text-xs text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.shareCount)}</span>
          </div>
        )}
      </div>

      {/* Content Analysis Section */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-soft-drop)]">
        <h3 className="mb-4 font-medium text-neutral-900">Content Analysis</h3>

        {/* Engagement Metrics */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-neutral-800">Engagement Metrics</h4>
          <div className="space-y-3">
            {[
              { label: "Hook Strength", value: videoInsights.analysis.engagement.hookStrength },
              { label: "Retention Potential", value: videoInsights.analysis.engagement.retentionPotential },
              { label: "CTA Strength", value: videoInsights.analysis.engagement.callToActionStrength },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-3">
                <span className="w-32 text-sm text-neutral-600">{metric.label}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-neutral-900">{metric.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Readability */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-neutral-800">Readability</h4>
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Score</span>
              <span className="text-primary-700 text-lg font-semibold">
                {videoInsights.analysis.readability.score}/100
              </span>
            </div>
            <div className="mb-3 text-xs text-neutral-600">
              Grade Level: {videoInsights.analysis.readability.grade} • Complexity:{" "}
              {videoInsights.analysis.readability.complexity}
            </div>
            {videoInsights.analysis.readability.recommendations.length > 0 && (
              <div>
                <div className="mb-2 text-xs text-neutral-600">Recommendations:</div>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {videoInsights.analysis.readability.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Video Metadata */}
      <ExpandableVideoMetadata videoInsights={videoInsights} />

      {/* Additional Analysis Sections */}
      {videoInsights.analysis.seo && (
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-soft-drop)]">
          <h3 className="mb-4 font-medium text-neutral-900">SEO Analysis</h3>

          {/* Title Optimization */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-neutral-800">Title Optimization</h4>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Score</span>
              <span className="text-sm font-medium text-neutral-900">
                {videoInsights.analysis.seo.titleOptimization.score}/100
              </span>
            </div>
            {videoInsights.analysis.seo.titleOptimization.suggestions.length > 0 && (
              <ul className="space-y-1 text-xs text-neutral-700">
                {videoInsights.analysis.seo.titleOptimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description Optimization */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-neutral-800">Description Optimization</h4>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Score</span>
              <span className="text-sm font-medium text-neutral-900">
                {videoInsights.analysis.seo.descriptionOptimization.score}/100
              </span>
            </div>
            {videoInsights.analysis.seo.descriptionOptimization.suggestions.length > 0 && (
              <ul className="space-y-1 text-xs text-neutral-700">
                {videoInsights.analysis.seo.descriptionOptimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Keyword Density */}
          {videoInsights.analysis.seo.keywordDensity.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-neutral-800">Top Keywords</h4>
              <div className="grid grid-cols-2 gap-2">
                {videoInsights.analysis.seo.keywordDensity.slice(0, 6).map((keyword, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-neutral-600">{keyword.word}</span>
                    <span className="font-medium text-neutral-900">{keyword.density}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Suggestions */}
          {videoInsights.analysis.seo.hashtagSuggestions.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-800">Suggested Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {videoInsights.analysis.seo.hashtagSuggestions.slice(0, 8).map((hashtag, index) => (
                  <span key={index} className="bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs">
                    #{hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return tabData;
}

/**
 * Transform a complete Video into NotionPanel data
 */
export function videoToNotionData(
  video: Video,
  videoInsights: VideoInsights,
  callbacks: {
    onCopy?: (content: string, componentType?: string) => void;
    onDownload?: () => void;
    onVideoPlay?: () => void;
    onVideoPause?: () => void;
  } = {},
): VideoNotionData {
  console.log("🎨 videoToNotionData - Creating notion data with detailed analysis:", {
    videoId: video.id,
    videoTitle: video.title,
    hasMetadata: !!video.metadata,
    metadataAuthor: video.metadata?.author,
    metadataKeys: video.metadata ? Object.keys(video.metadata) : [],
    platform: video.platform,
    originalUrl: video.originalUrl,
    directUrl: video.directUrl,
    // Check if videoInsights has author info that video is missing
    videoInsightsAuthor: videoInsights.metadata?.author?.name,
    // Full metadata for debugging
    fullVideoMetadata: video.metadata,
    fullVideoInsightsMetadata: videoInsights.metadata,
  });

  // If video.metadata.author is missing but videoInsights has it, copy it over
  if (!video.metadata?.author && videoInsights.metadata?.author?.name) {
    console.log("🔄 videoToNotionData - Copying author from videoInsights to video metadata");
    if (!video.metadata) {
      video.metadata = {
        originalUrl: video.originalUrl,
        platform: video.platform,
        downloadedAt: new Date().toISOString(),
      };
    }
    video.metadata.author = videoInsights.metadata.author.name;
  }

  return {
    title: video.title || videoInsights.title || "Untitled Video",
    properties: createVideoProperties(video),
    tabData: createVideoTabData(videoInsights, callbacks),
    video: video, // This now has potentially enhanced metadata
    platform: video.platform,
    ...callbacks,
  };
}

// Helper functions

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
