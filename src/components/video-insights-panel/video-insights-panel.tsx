"use client";

import React, { useState } from "react";

import { useScriptCopy } from "@/hooks/use-script-copy";
import { useScriptDownload } from "@/hooks/use-script-download";
import { cn } from "@/lib/utils";
import {
  VideoInsightsPanelProps,
  VideoInsightsTabConfig,
  VideoInsights,
  VideoInsightsTabType,
} from "@/types/video-insights";

import {
  VideoInsightsHeader,
  VideoInsightsTabs,
  VideoPlayerView,
  TranscriptView,
  VideoComponentsView,
  MetadataView,
  SuggestionsView,
  AnalysisView,
} from "./video-insights-panel-components";

/**
 * VideoInsightsPanel - A comprehensive video insights display component with tabs,
 * copy functionality, video player, and analysis display following Clarity Design System
 */

// Helper function to get tab configuration
function getTabConfiguration(videoInsights: VideoInsights): VideoInsightsTabConfig[] {
  return [
    { key: "video", label: "Video", enabled: true },
    { key: "transcript", label: "Transcript", enabled: !!videoInsights.scriptData.fullScript },
    { key: "components", label: "Components", enabled: videoInsights.scriptData.components.length > 0 },
    { key: "metadata", label: "Metadata", enabled: true },
    {
      key: "suggestions",
      label: "Suggestions",
      enabled: videoInsights.suggestions.hooks.length + videoInsights.suggestions.content.length > 0,
    },
    { key: "analysis", label: "Analysis", enabled: true },
  ];
}

export function VideoInsightsPanel({
  videoInsights,
  isLoading = false,
  onCopy,
  onDownload,
  onClose,
  className,
  showDownload = true,
  showMetrics = true,
  customActions,
  onVideoPlay,
  onVideoPause,
}: VideoInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<VideoInsightsTabType>("video");
  const { copyText, copyStatus } = useScriptCopy();
  const { downloadScript, isDownloading } = useScriptDownload();

  const tabs = getTabConfiguration(videoInsights);

  const handleCopy = async (content: string, componentType?: string) => {
    const success = await copyText(content);
    if (success && onCopy) {
      onCopy(content, componentType);
    }
  };

  const handleDownload = () => {
    // For now, download the script data - could be enhanced to download full video insights
    downloadScript(videoInsights.scriptData);
    if (onDownload) {
      onDownload(videoInsights);
    }
  };

  const handleVideoPlay = () => {
    if (onVideoPlay) {
      onVideoPlay();
    }
  };

  const handleVideoPause = () => {
    if (onVideoPause) {
      onVideoPause();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Loading video insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <VideoInsightsHeader
        videoInsights={videoInsights}
        copyStatus={copyStatus}
        isDownloading={isDownloading}
        showDownload={showDownload}
        customActions={customActions}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <VideoInsightsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as VideoInsightsTabType)}
      />

      <VideoInsightsPanelContent
        activeTab={activeTab}
        videoInsights={videoInsights}
        showMetrics={showMetrics}
        onCopy={handleCopy}
        copyStatus={copyStatus}
        onVideoPlay={handleVideoPlay}
        onVideoPause={handleVideoPause}
      />
    </div>
  );
}

/**
 * Video Insights Panel Content Component
 */
interface VideoInsightsPanelContentProps {
  activeTab: VideoInsightsTabType;
  videoInsights: VideoInsights;
  showMetrics: boolean;
  onCopy: (content: string, type?: string) => void;
  copyStatus: string;
  onVideoPlay: () => void;
  onVideoPause: () => void;
}

function VideoInsightsPanelContent({
  activeTab,
  videoInsights,
  showMetrics,
  onCopy,
  copyStatus,
  onVideoPlay,
  onVideoPause,
}: VideoInsightsPanelContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === "video" && (
        <VideoPlayerView
          videoUrl={videoInsights.videoUrl}
          thumbnailUrl={videoInsights.thumbnailUrl}
          onPlay={onVideoPlay}
          onPause={onVideoPause}
        />
      )}

      {activeTab === "transcript" && (
        <TranscriptView script={videoInsights.scriptData.fullScript} onCopy={onCopy} copyStatus={copyStatus} />
      )}

      {activeTab === "components" && (
        <VideoComponentsView components={videoInsights.scriptData.components} onCopy={onCopy} />
      )}

      {activeTab === "metadata" && <MetadataView metadata={videoInsights.metadata} />}

      {activeTab === "suggestions" && (
        <SuggestionsView
          hooks={videoInsights.suggestions.hooks}
          content={videoInsights.suggestions.content}
          onCopy={onCopy}
        />
      )}

      {activeTab === "analysis" && (
        <AnalysisView
          readability={videoInsights.analysis.readability}
          engagement={videoInsights.analysis.engagement}
          seo={videoInsights.analysis.seo}
        />
      )}
    </div>
  );
}

export default VideoInsightsPanel;
