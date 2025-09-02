/**
 * Video to Notion Panel Adapter
 * 
 * Transforms Video and VideoInsights data structures into formats compatible with NotionPanel
 */

import { Video } from "@/lib/collections";
import { VideoInsights } from "@/types/video-insights";
import { PageProperty } from "@/components/panels/notion/NotionPanelProperties";
import { TabData } from "@/components/panels/notion/NotionPanelTabs";
import { Copy, Play, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

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
    { label: 'Duration', value: formatDuration(videoInsights.metadata.duration) },
    { label: 'Platform', value: videoInsights.metadata.platform?.toUpperCase() },
    { label: 'Views', value: videoInsights.metadata.viewCount ? formatNumber(videoInsights.metadata.viewCount) : undefined },
    { label: 'Likes', value: videoInsights.metadata.likeCount ? formatNumber(videoInsights.metadata.likeCount) : undefined },
    { label: 'Comments', value: videoInsights.metadata.commentCount ? formatNumber(videoInsights.metadata.commentCount) : undefined },
    { label: 'Upload Date', value: videoInsights.metadata.uploadDate ? new Date(videoInsights.metadata.uploadDate).toLocaleDateString() : undefined },
    { label: 'Author', value: videoInsights.metadata.author?.name }
  ].filter(item => item.value);
  
  return (
    <div className="border border-neutral-200 rounded-[var(--radius-card)] bg-neutral-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-100 transition-colors"
      >
        <h4 className="text-sm font-medium text-neutral-900">Video Metadata</h4>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-200">
          <div className="space-y-3 pt-3">
            {metadataItems.map(item => (
              <div key={item.label} className="flex justify-between py-1">
                <span className="text-sm text-neutral-600">{item.label}</span>
                <span className="text-sm font-medium text-neutral-900">{item.value}</span>
              </div>
            ))}
            
            {videoInsights.metadata.tags && videoInsights.metadata.tags.length > 0 && (
              <div className="pt-2">
                <div className="text-sm text-neutral-600 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {videoInsights.metadata.tags.slice(0, 10).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
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
export function createVideoTabData(videoInsights: VideoInsights, callbacks: {
  onCopy?: (content: string, componentType?: string) => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}): TabData {
  const tabData: TabData = {};

  // Consolidated Video tab with all components
  const videoUrl = videoInsights.videoUrl;
    
  console.log('🎬 Video URL resolution:', {
    videoInsightsUrl: videoInsights.videoUrl,
    resolvedVideoUrl: videoUrl
  });
  
  tabData.video = (
    <div className="space-y-6">
      {/* Video Player Section */}
      {videoUrl ? (
        <>
          {/* Try iframe first (for Bunny.net URLs), fallback to video element */}
          {videoUrl.includes('bunny') || videoUrl.includes('iframe') ? (
            <div className="aspect-video bg-neutral-900 rounded-[var(--radius-card)] overflow-hidden">
              <iframe 
                src={videoUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoInsights.title || "Video content"}
              />
            </div>
          ) : (
            <div className="aspect-video bg-neutral-900 rounded-[var(--radius-card)] overflow-hidden">
              <video 
                src={videoUrl}
                className="w-full h-full object-cover"
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
        <div className="aspect-video bg-neutral-100 rounded-[var(--radius-card)] overflow-hidden relative group shadow-[var(--shadow-soft-drop)]">
          {videoInsights.thumbnailUrl && (
            <img 
              src={videoInsights.thumbnailUrl} 
              alt={videoInsights.title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 group-hover:bg-neutral-900/30 transition-all duration-150">
            <button 
              onClick={callbacks.onVideoPlay}
              className="w-16 h-16 rounded-pill bg-neutral-50/90 hover:bg-neutral-50 flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-[var(--shadow-soft-drop)]"
            >
              <Play className="w-6 h-6 text-neutral-900 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/* Video Stats - Compact horizontal layout */}
      <div className="flex items-center justify-center gap-1 mt-3 mb-2">
        {videoInsights.metadata.viewCount && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-all duration-150">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.viewCount)}</span>
          </div>
        )}
        
        {videoInsights.metadata.likeCount && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-all duration-150">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.likeCount)}</span>
          </div>
        )}
        
        {videoInsights.metadata.commentCount && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-all duration-150">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.commentCount)}</span>
          </div>
        )}
        
        {videoInsights.metadata.shareCount && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-all duration-150">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            <span className="font-medium">{formatNumber(videoInsights.metadata.shareCount)}</span>
          </div>
        )}
      </div>
      
      {/* Analysis Section */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-soft-drop)]">
        <h3 className="font-medium text-neutral-900 mb-4">Content Analysis</h3>
        
        {/* Engagement Metrics */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-neutral-800">Engagement Metrics</h4>
          <div className="space-y-3">
            {[
              { label: 'Hook Strength', value: videoInsights.analysis.engagement.hookStrength },
              { label: 'Retention Potential', value: videoInsights.analysis.engagement.retentionPotential },
              { label: 'CTA Strength', value: videoInsights.analysis.engagement.callToActionStrength }
            ].map(metric => (
              <div key={metric.label} className="flex items-center gap-3">
                <span className="text-sm text-neutral-600 w-32">{metric.label}</span>
                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 w-12 text-right">{metric.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Readability */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-neutral-800">Readability</h4>
          <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)] border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Score</span>
              <span className="text-lg font-semibold text-primary-700">{videoInsights.analysis.readability.score}/100</span>
            </div>
            <div className="text-xs text-neutral-600 mb-3">
              Grade Level: {videoInsights.analysis.readability.grade} • Complexity: {videoInsights.analysis.readability.complexity}
            </div>
            {videoInsights.analysis.readability.recommendations.length > 0 && (
              <div>
                <div className="text-xs text-neutral-600 mb-2">Recommendations:</div>
                <ul className="text-xs text-neutral-700 space-y-1">
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
            onClick={() => callbacks.onCopy?.(videoInsights.scriptData.fullScript, 'transcript')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 rounded-[var(--radius-button)] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
        <div className="prose prose-neutral max-w-none text-sm">
          <div className="whitespace-pre-wrap bg-neutral-50 rounded-[var(--radius-card)] p-4 border">
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
            <div key={component.id || index} className="p-4 bg-neutral-50 rounded-[var(--radius-card)] border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-primary-100 text-primary-700 text-xs font-medium flex items-center justify-center">
                      {component.icon || component.type?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{component.label}</span>
                  </div>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{component.content}</p>
                </div>
                <button
                  onClick={() => callbacks.onCopy?.(component.content, component.type)}
                  className="p-1.5 hover:bg-neutral-200 rounded-[var(--radius-button)] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-600" />
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
            <h4 className="text-sm font-medium mb-3 text-neutral-800">Hook Ideas</h4>
            <div className="space-y-3">
              {videoInsights.suggestions.hooks.map((hook) => (
                <div key={hook.id} className="p-3 bg-primary-50 border border-primary-200 rounded-[var(--radius-card)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary-900 mb-1">{hook.type} Hook</div>
                      <div className="text-sm text-primary-800 mb-2">{hook.content}</div>
                      <div className="text-xs text-primary-700">{hook.rationale}</div>
                    </div>
                    <button
                      onClick={() => callbacks.onCopy?.(hook.content, 'hook')}
                      className="p-1.5 hover:bg-primary-200 rounded-[var(--radius-button)] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-primary-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videoInsights.suggestions.content.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-neutral-800">Content Improvements</h4>
            <div className="space-y-3">
              {videoInsights.suggestions.content.map((suggestion) => (
                <div key={suggestion.id} className="p-3 bg-success-50 border border-success-200 rounded-[var(--radius-card)]">
                  <div className="text-sm font-medium text-success-900 mb-1">{suggestion.target} Improvement</div>
                  <div className="text-sm text-success-800 mb-2">{suggestion.suggestion}</div>
                  <div className="flex items-center gap-4 text-xs text-success-700">
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

  // Note: Analysis is now integrated into the Video tab

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
  } = {}
): VideoNotionData {
  console.log('🎨 videoToNotionData - Creating notion data with detailed analysis:', {
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
    fullVideoInsightsMetadata: videoInsights.metadata
  });
  
  // If video.metadata.author is missing but videoInsights has it, copy it over
  if (!video.metadata?.author && videoInsights.metadata?.author?.name) {
    console.log('🔄 videoToNotionData - Copying author from videoInsights to video metadata');
    if (!video.metadata) {
      video.metadata = {
        originalUrl: video.originalUrl,
        platform: video.platform,
        downloadedAt: new Date().toISOString()
      };
    }
    video.metadata.author = videoInsights.metadata.author.name;
  }
  
  return {
    title: video.title || videoInsights.title || 'Untitled Video',
    properties: createVideoProperties(video),
    tabData: createVideoTabData(videoInsights, callbacks),
    video: video, // This now has potentially enhanced metadata
    platform: video.platform,
    ...callbacks
  };
}

// Helper functions

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


