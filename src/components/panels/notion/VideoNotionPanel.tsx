"use client";

import React, { useState, useRef, useEffect } from "react";

import { Video } from "@/lib/collections";

import NotionPanelProperties, { type PageProperty } from "./NotionPanelProperties";
import NotionPanelTabs, { type TabType, type TabData, type CustomTabLabels } from "./NotionPanelTabs";
import VideoNotionPanelHeader from "./VideoNotionPanelHeader";

interface VideoNotionPanelProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  properties?: PageProperty[];
  onPropertyChange?: (id: string, value: string | { label: string; color: string }) => void;
  showPageControls?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  editorContent?: React.ReactNode;
  tabData?: TabData;
  defaultTab?: TabType;
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  isNewIdea?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
  customTabLabels?: CustomTabLabels;
  video: Video;
  platform?: string;
}

export default function VideoNotionPanel({
  title = "New page",
  onTitleChange,
  properties = [],
  onPropertyChange,
  showPageControls = true,
  onClose,
  children,
  editorContent,
  tabData,
  defaultTab = "video",
  width,
  onWidthChange,
  minWidth = 400,
  maxWidth = 900,
  isOpen = true,
  isNewIdea = false,
  placeholder = "Enter text or type / for commands",
  footer,
  customTabLabels,
  video,
  platform,
}: VideoNotionPanelProps & { isOpen?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Debug: Log video prop
  React.useEffect(() => {
    console.log("VideoNotionPanel - Received video prop:", {
      hasVideo: !!video,
      videoId: video?.id,
      videoTitle: video?.title,
      hasMetadata: !!video?.metadata,
      author: video?.metadata?.author,
      fullVideo: video,
    });
  }, [video]);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle resize drag
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(width ?? panelRef.current?.offsetWidth ?? 600);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = dragStartX - e.clientX;
      const newWidth = Math.min(Math.max(dragStartWidth + deltaX, minWidth), maxWidth);

      if (onWidthChange) {
        onWidthChange(newWidth);
      } else if (panelRef.current) {
        panelRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartWidth, minWidth, maxWidth, onWidthChange]);

  return (
    <div
      ref={panelRef}
      className={`relative flex h-full transform flex-col overflow-y-auto border-l border-neutral-200 bg-neutral-50 transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"} `}
      style={{
        width: width ? `${width}px` : undefined,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize Handle - Disabled */}
      {/* <NotionPanelResize
        isDragging={isDragging}
        onMouseDown={handleResizeMouseDown}
      /> */}

      {/* Video Header Section */}
      <VideoNotionPanelHeader
        title={title}
        onTitleChange={onTitleChange}
        showPageControls={showPageControls && isHovered}
        isVisible={isOpen}
        video={video}
        platform={platform}
        onClose={onClose}
      />

      {/* Properties Section - Hidden in new idea mode */}
      {!isNewIdea && properties && properties.length > 0 && (
        <div
          className={`transform transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} `}
          style={{
            transitionDelay: isOpen ? "150ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <NotionPanelProperties properties={properties} onPropertyChange={onPropertyChange} />
        </div>
      )}

      {/* Content Area */}
      {isNewIdea ? (
        /* New Idea Mode - Editor Only */
        <div
          className={`flex-1 transform px-8 py-6 transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} `}
          style={{
            transitionDelay: isOpen ? "200ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {children ? children : <div className="text-base text-neutral-400">{placeholder}</div>}
        </div>
      ) : (
        /* Regular Mode - Tabs Section */
        <div
          className={`flex min-h-0 flex-1 transform flex-col transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} `}
          style={{
            transitionDelay: isOpen ? "200ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Script Action Buttons - Only visible on hover */}
          <div className={`px-4 py-1 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <div className="flex flex-wrap gap-1">
              <button className="flex items-center gap-1.5 rounded-[var(--radius-button)] border-0 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                <span>Rewrite</span>
              </button>
              <button className="flex items-center gap-1.5 rounded-[var(--radius-button)] border-0 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Write Hooks</span>
              </button>
              <button className="flex items-center gap-1.5 rounded-[var(--radius-button)] border-0 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H1l8-8 8 8h-8l8 8-8-8z" />
                </svg>
                <span>Content Ideas</span>
              </button>
            </div>
          </div>

          {/* Padding above tabs */}
          <div className="pt-4">
            <NotionPanelTabs
              tabData={tabData}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              defaultContent={editorContent ?? children}
              customLabels={customTabLabels}
            />
          </div>
        </div>
      )}

      {/* Footer Section */}
      {footer && (
        <div
          className={`flex-shrink-0 transform border-t border-neutral-200 bg-neutral-50 px-6 py-4 transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} `}
          style={{
            transitionDelay: isOpen ? "250ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { PageProperty } from "./NotionPanelProperties";
