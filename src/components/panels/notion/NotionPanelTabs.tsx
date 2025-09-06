"use client";

import React, { useState, useRef, useEffect } from "react";

import { Video, FileText, Box, Database, Lightbulb, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

export type TabType = "video" | "transcript" | "components" | "metadata" | "suggestions" | "analysis";

export interface TabData {
  video?: React.ReactNode;
  transcript?: React.ReactNode;
  components?: React.ReactNode;
  metadata?: React.ReactNode;
  suggestions?: React.ReactNode;
  analysis?: React.ReactNode;
}

export interface CustomTabLabels {
  video?: string;
  transcript?: string;
  components?: string;
  metadata?: string;
  suggestions?: string;
  analysis?: string;
}

interface NotionPanelTabsProps {
  tabData?: TabData;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  defaultContent?: React.ReactNode;
  customLabels?: CustomTabLabels;
}

const TAB_CONFIG = {
  video: { label: "Video", icon: Video },
  transcript: { label: "Transcript", icon: FileText },
  components: { label: "Components", icon: Box },
  metadata: { label: "Metadata", icon: Database },
  suggestions: { label: "Suggestions", icon: Lightbulb },
  analysis: { label: "Analysis", icon: BarChart3 },
};

export default function NotionPanelTabs({
  tabData,
  activeTab,
  onTabChange,
  defaultContent,
  customLabels,
}: NotionPanelTabsProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine which tabs to show based on available data
  const availableTabs = React.useMemo(() => {
    const tabs: { id: TabType; label: string; icon: React.ComponentType<any>; content?: React.ReactNode }[] = [];

    Object.entries(TAB_CONFIG).forEach(([key, config]) => {
      const tabKey = key as TabType;
      if (tabData?.[tabKey]) {
        tabs.push({
          id: tabKey,
          label: customLabels?.[tabKey] || config.label,
          icon: config.icon,
          content: tabData[tabKey],
        });
      }
    });

    // If no tabs have data, show default content
    if (tabs.length === 0 && defaultContent) {
      tabs.push({
        id: "video",
        label: "Content",
        icon: FileText,
        content: defaultContent,
      });
    }

    return tabs;
  }, [tabData, defaultContent, customLabels]);

  // Check scroll position and update arrow visibility
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll to position
  const scrollTo = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  // Check scroll on mount and resize
  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [availableTabs]);

  // Get current tab content
  const currentContent = availableTabs.find((tab) => tab.id === activeTab)?.content;

  if (availableTabs.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="text-sm text-neutral-400">No content available.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab Navigation with Arrow Controls */}
      <div className="group relative flex-shrink-0">
        {/* Left Arrow */}
        <button
          onClick={() => scrollTo("left")}
          className={`absolute top-1/2 left-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[var(--shadow-soft-drop)] transition-all duration-200 ${
            showLeftArrow
              ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-neutral-50"
              : "pointer-events-none opacity-0"
          } `}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scrollTo("right")}
          className={`absolute top-1/2 right-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[var(--shadow-soft-drop)] transition-all duration-200 ${
            showRightArrow
              ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-neutral-50"
              : "pointer-events-none opacity-0"
          } `}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        </button>

        {/* Fade edges */}
        <div
          className={`pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-neutral-50 to-transparent transition-opacity duration-200 ${showLeftArrow ? "opacity-100" : "opacity-0"} `}
        />
        <div
          className={`pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-gradient-to-l from-neutral-50 to-transparent transition-opacity duration-200 ${showRightArrow ? "opacity-100" : "opacity-0"} `}
        />

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="scrollbar-none overflow-x-auto scroll-smooth px-4 pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex min-w-max gap-1">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    activeTab === tab.id
                      ? "border border-neutral-300 bg-neutral-200 text-neutral-900"
                      : "border border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-900"
                  } `}
                >
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? "text-neutral-700" : "text-neutral-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {currentContent ?? <div className="text-sm text-neutral-400">No content available for this tab.</div>}
      </div>
    </div>
  );
}
