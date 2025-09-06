"use client";

import React, { useState } from "react";

import NotionPanelProperties from "@/components/panels/notion/NotionPanelProperties";
import NotionPanelTabs, { type TabType, type TabData } from "@/components/panels/notion/NotionPanelTabs";
import VideoNotionPanelHeader from "@/components/panels/notion/VideoNotionPanelHeader";
import { Video } from "@/lib/collections";
import { VideoNotionData } from "@/lib/video-to-notion-adapter";
import { VideoInsights } from "@/types/video-insights";

interface VideoModalNotionPanelProps {
  video: Video;
  videoInsights: VideoInsights;
  notionData: VideoNotionData;
}

export function VideoModalNotionPanel({ video, videoInsights, notionData }: VideoModalNotionPanelProps) {
  // Start with analysis tab as default since it contains engagement metrics and readability
  const availableTabs = Object.keys(notionData.tabData).filter((tab) => tab !== "video") as TabType[];
  const defaultTab = availableTabs.includes("analysis")
    ? "analysis"
    : availableTabs.includes("transcript")
      ? "transcript"
      : availableTabs[0] || "analysis";

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Create tab data without the video tab
  const modalTabData: TabData = {
    analysis: notionData.tabData.analysis,
    transcript: notionData.tabData.transcript,
    components: notionData.tabData.components,
    metadata: notionData.tabData.metadata,
    suggestions: notionData.tabData.suggestions,
  };

  // Filter out any undefined tabs
  const filteredTabData: TabData = Object.fromEntries(
    Object.entries(modalTabData).filter(([_, content]) => content !== undefined),
  ) as TabData;

  return (
    <div className="flex h-full w-full flex-col bg-neutral-50">
      {/* Header Section */}
      <VideoNotionPanelHeader
        title={notionData.title}
        isVisible={true}
        video={video}
        platform={notionData.platform}
        showPageControls={false} // No close button since modal handles this
      />

      {/* Properties Section - Only show if there are properties */}
      {notionData.properties && notionData.properties.length > 0 && (
        <div className="border-b border-neutral-200">
          <NotionPanelProperties
            properties={notionData.properties}
            onPropertyChange={() => {}} // Read-only for modal
          />
        </div>
      )}

      {/* Content Area - Tabs without Video tab */}
      <div className="flex min-h-0 flex-1 flex-col">
        {Object.keys(filteredTabData).length > 0 ? (
          <NotionPanelTabs
            tabData={filteredTabData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            customLabels={{
              analysis: "Analysis",
              transcript: "Transcript",
              components: "Components",
              metadata: "Metadata",
              suggestions: "Suggestions",
            }}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-medium text-neutral-900">No content available</h3>
              <p className="text-sm text-neutral-600">This video doesn't have additional insights to display.</p>
            </div>
          </div>
        )}
      </div>

      {/* Optional Video Stats Footer */}
      {videoInsights.metadata && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div className="flex items-center gap-4">
              {videoInsights.metadata.duration && <span>Duration: {Math.round(videoInsights.metadata.duration)}s</span>}
              {videoInsights.metadata.viewCount && (
                <span>Views: {videoInsights.metadata.viewCount.toLocaleString()}</span>
              )}
            </div>
            <div className="text-xs">{video.addedAt && new Date(video.addedAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
