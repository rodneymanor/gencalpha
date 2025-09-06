"use client";

import React, { useState, useRef, useEffect } from "react";

import NotionPanelHeader from "./NotionPanelHeader";
import NotionPanelProperties, { type PageProperty } from "./NotionPanelProperties";
import NotionPanelResize from "./NotionPanelResize";
import NotionPanelTabs, { type TabType, type TabData, type CustomTabLabels } from "./NotionPanelTabs";

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
  isNewIdea?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
  customTabLabels?: CustomTabLabels;
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
  isOpen = true,
  isNewIdea = false,
  placeholder = "Enter text or type / for commands",
  footer,
  customTabLabels,
}: NotionPanelProps & { isOpen?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
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
      className={`relative flex h-full transform flex-col bg-neutral-50 transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"} `}
      style={{
        width: width ? `${width}px` : undefined,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize Handle */}
      <NotionPanelResize isDragging={isDragging} onMouseDown={handleResizeMouseDown} />

      {/* Header Section */}
      <NotionPanelHeader
        title={title}
        onTitleChange={onTitleChange}
        showPageControls={showPageControls && isHovered}
        isVisible={isOpen}
      />

      {/* Properties Section - Hidden in new idea mode */}
      {!isNewIdea && (
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
          <NotionPanelTabs
            tabData={tabData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            defaultContent={editorContent ?? children}
            customLabels={customTabLabels}
          />
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
export type { TabType, TabData, CustomTabLabels } from "./NotionPanelTabs";
