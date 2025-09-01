'use client';

import React, { useState, useRef, useEffect } from 'react';
import NotionPanelHeader from './NotionPanelHeader';
import NotionPanelProperties, { type PageProperty } from './NotionPanelProperties';
import NotionPanelTabs, { type TabType, type TabData } from './NotionPanelTabs';
import NotionPanelResize from './NotionPanelResize';

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
  title = 'New page',
  onTitleChange,
  properties = [
    { id: '1', type: 'status', name: 'Generation', value: { label: 'Script Ready', color: 'success' }, icon: 'burst' }
  ],
  onPropertyChange,
  showPageControls = true,
  children,
  editorContent,
  tabData,
  defaultTab = 'video',
  width,
  onWidthChange,
  minWidth = 400,
  maxWidth = 900
}: NotionPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartWidth, minWidth, maxWidth, onWidthChange]);

  return (
    <div 
      ref={panelRef} 
      className="flex flex-col h-full bg-neutral-50 relative" 
      style={{ width: width ? `${width}px` : undefined }}
    >
      {/* Resize Handle */}
      <NotionPanelResize 
        isDragging={isDragging}
        onMouseDown={handleResizeMouseDown}
      />

      {/* Header Section */}
      <NotionPanelHeader
        title={title}
        onTitleChange={onTitleChange}
        showPageControls={showPageControls}
        onClose={onClose}
      />

      {/* Properties Section */}
      <NotionPanelProperties
        properties={properties}
        onPropertyChange={onPropertyChange}
      />

      {/* Tabs Section */}
      <NotionPanelTabs
        tabData={tabData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        defaultContent={editorContent ?? children}
      />
    </div>
  );
}

// Re-export types for convenience
export type { PageProperty } from './NotionPanelProperties';
export type { TabType, TabData } from './NotionPanelTabs';