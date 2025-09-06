"use client";

import React, { useState, useRef, useEffect } from "react";

import {
  Smile,
  Image,
  Layout,
  Link,
  Zap,
  GripVertical,
  Video,
  FileText,
  Box,
  Database,
  Lightbulb,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PageProperty {
  id: string;
  type: "url" | "status" | "text" | "select" | "date";
  name: string;
  value?: string | { label: string; color: string };
  icon?: string;
}

type TabType = "video" | "transcript" | "components" | "metadata" | "suggestions" | "analysis";

interface TabData {
  video?: React.ReactNode;
  transcript?: React.ReactNode;
  components?: React.ReactNode;
  metadata?: React.ReactNode;
  suggestions?: React.ReactNode;
  analysis?: React.ReactNode;
}

interface NotionPanelProps {
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
}

export default function NotionPanel({
  title = "New page",
  onTitleChange,
  properties = [
    { id: "1", type: "status", name: "Generation", value: { label: "Script Ready", color: "success" }, icon: "burst" },
  ],
  onPropertyChange,
  showPageControls = true,
  children,
  editorContent,
  tabData,
  defaultTab = "video",
  width,
  onWidthChange,
  minWidth = 400,
  maxWidth = 900,
}: NotionPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [showControls, setShowControls] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Determine which tabs to show based on available data
  const availableTabs = React.useMemo(() => {
    const tabs: { id: TabType; label: string; icon: React.ReactNode; content?: React.ReactNode }[] = [];

    if (tabData?.video)
      tabs.push({ id: "video", label: "Video", icon: <Video className="h-4 w-4" />, content: tabData.video });
    if (tabData?.transcript)
      tabs.push({
        id: "transcript",
        label: "Transcript",
        icon: <FileText className="h-4 w-4" />,
        content: tabData.transcript,
      });
    if (tabData?.components)
      tabs.push({
        id: "components",
        label: "Components",
        icon: <Box className="h-4 w-4" />,
        content: tabData.components,
      });
    if (tabData?.metadata)
      tabs.push({
        id: "metadata",
        label: "Metadata",
        icon: <Database className="h-4 w-4" />,
        content: tabData.metadata,
      });
    if (tabData?.suggestions)
      tabs.push({
        id: "suggestions",
        label: "Suggestions",
        icon: <Lightbulb className="h-4 w-4" />,
        content: tabData.suggestions,
      });
    if (tabData?.analysis)
      tabs.push({
        id: "analysis",
        label: "Analysis",
        icon: <BarChart3 className="h-4 w-4" />,
        content: tabData.analysis,
      });

    // If no tabs have data, show editor content or children
    if (tabs.length === 0 && (editorContent || children)) {
      tabs.push({
        id: "video",
        label: "Content",
        icon: <FileText className="h-4 w-4" />,
        content: editorContent ?? children,
      });
    }

    return tabs;
  }, [tabData, editorContent, children]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && localTitle !== title) {
      onTitleChange(localTitle);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-success-100 text-success-900 border-success-200",
      warning: "bg-warning-100 text-warning-900 border-warning-200",
      error: "bg-destructive-100 text-destructive-900 border-destructive-200",
      default: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };
    return colors[status] || colors.default;
  };

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
      className="relative flex h-full flex-col bg-neutral-50"
      style={{ width: width ? `${width}px` : undefined }}
    >
      {/* Resize Handle */}
      <div
        className={`hover:bg-primary-400 absolute top-0 bottom-0 left-0 z-30 w-1 cursor-col-resize bg-transparent transition-colors duration-150 ${isDragging ? "bg-primary-500" : ""} `}
        onMouseDown={handleResizeMouseDown}
      >
        {/* Visual indicator on hover */}
        <div
          className={`absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 opacity-0 transition-opacity duration-150 hover:opacity-100 ${isDragging ? "bg-primary-500 opacity-100" : ""} `}
        />
      </div>
      {/* Page Controls */}
      {showPageControls && (
        <div
          className="px-2 py-1"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div
            className={`flex flex-wrap gap-1 text-sm text-neutral-400 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0"} `}
          >
            <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-600">
              <Smile className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-xs">Add icon</span>
            </button>
            <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-600">
              <Image className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-xs">Add cover</span>
            </button>
            <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-600">
              <Layout className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-xs">Customize layout</span>
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onFocus={() => setIsEditingTitle(true)}
          placeholder="New page"
          className={`w-full border-none bg-transparent text-3xl font-bold text-neutral-900 placeholder-neutral-300 transition-all duration-150 outline-none ${isEditingTitle ? "opacity-100" : "opacity-90"} `}
        />
      </div>

      {/* Properties */}
      {properties.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {properties.map((property) => (
              <div key={property.id} className="group flex items-center gap-2">
                <div className="flex w-40 items-center gap-1 text-neutral-500">
                  <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <GripVertical className="h-3 w-3 cursor-grab" />
                  </div>
                  <div className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-button)] px-2 py-1 hover:bg-neutral-100">
                    {property.icon === "link" && <Link className="h-3.5 w-3.5" />}
                    {property.icon === "burst" && <Zap className="h-3.5 w-3.5" />}
                    <span className="text-sm">{property.name}</span>
                  </div>
                </div>
                <div className="flex-1">
                  {property.type === "status" && property.value && typeof property.value === "object" && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${getStatusColor(property.value.color)} `}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          property.value.color === "success"
                            ? "bg-success-600"
                            : property.value.color === "warning"
                              ? "bg-warning-600"
                              : property.value.color === "error"
                                ? "bg-destructive-600"
                                : "bg-neutral-600"
                        }`}
                      />
                      {property.value.label}
                    </div>
                  )}
                  {property.type === "url" && (
                    <input
                      type="text"
                      placeholder="Empty"
                      className="w-full rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm placeholder-neutral-300 transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                      onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                    />
                  )}
                  {property.type === "text" && (
                    <input
                      type="text"
                      placeholder="Empty"
                      className="w-full rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm placeholder-neutral-300 transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                      onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation with Arrow Controls */}
      {availableTabs.length > 0 && (
        <div className="group relative border-b border-neutral-200">
          {/* Left Arrow */}
          <button
            onClick={() => scrollTo("left")}
            className={`absolute top-1/2 left-2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[var(--shadow-soft-drop)] transition-all duration-200 ${
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
            className={`absolute top-1/2 right-2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[var(--shadow-soft-drop)] transition-all duration-200 ${
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
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    activeTab === tab.id
                      ? "border border-neutral-300 bg-neutral-200 text-neutral-900"
                      : "border border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-900"
                  } `}
                >
                  <span className={activeTab === tab.id ? "text-neutral-700" : "text-neutral-500"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {availableTabs.find((tab) => tab.id === activeTab)?.content ?? (
          <div className="text-sm text-neutral-400">No content available for this tab.</div>
        )}
      </div>
    </div>
  );
}
