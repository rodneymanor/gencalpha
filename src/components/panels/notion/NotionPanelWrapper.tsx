"use client";

import React, { useState } from "react";

import { ChevronsRight, Maximize, Minimize, Copy, Download } from "lucide-react";

import NotionPanel from "./NotionPanel";
import { NotionPanelProps } from "./types";

interface NotionPanelWrapperProps extends NotionPanelProps {
  // Additional wrapper-specific props
  showHeaderControls?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  footer?: React.ReactNode;
}

/**
 * NotionPanelWrapper - Full-featured panel with slide-out behavior and header controls
 * Use this component when you need the complete panel experience with:
 * - Slide-out animation
 * - Header with close/maximize buttons
 * - Copy/download actions
 */
export default function NotionPanelWrapper({
  // Panel props
  title = "",
  onTitleChange,
  properties = [],
  onPropertyChange,
  showPageControls = true,
  isOpen: controlledIsOpen,
  isFullScreen: controlledIsFullScreen,
  onClose,
  onToggleFullScreen,
  children,
  editorContent,
  tabData,
  defaultTab = "video",
  width: controlledWidth,
  onWidthChange,
  minWidth = 400,
  maxWidth = 900,
  isNewIdea = false,
  placeholder = "Enter text or type / for commands",

  // Wrapper props
  showHeaderControls = true,
  onCopy,
  onDownload,
  footer,

  ...restProps
}: NotionPanelWrapperProps) {
  // Internal state (can be controlled or uncontrolled)
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [internalIsFullScreen, setInternalIsFullScreen] = useState(false);
  const [internalWidth, setInternalWidth] = useState(600);

  // Use controlled props if provided, otherwise use internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const isFullScreen = controlledIsFullScreen ?? internalIsFullScreen;
  const panelWidth = controlledWidth ?? internalWidth;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleToggleFullScreen = () => {
    if (onToggleFullScreen) {
      onToggleFullScreen();
    } else {
      setInternalIsFullScreen(!internalIsFullScreen);
    }
  };

  const handleWidthChange = (newWidth: number) => {
    if (onWidthChange) {
      onWidthChange(newWidth);
    } else {
      setInternalWidth(newWidth);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-300 ${isOpen ? "visible" : "invisible delay-300"} `}
      style={{
        width: isFullScreen ? "100vw" : `${panelWidth}px`,
        zIndex: 1000,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Panel Content with slide animation */}
      <div
        className={`h-full transform bg-white shadow-[var(--shadow-soft-drop)] transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"} `}
        style={{
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Panel Header */}
        {showHeaderControls && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                <ChevronsRight className="h-4 w-4 text-neutral-600" />
              </button>
              <button
                onClick={handleToggleFullScreen}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                {isFullScreen ? (
                  <Minimize className="h-4 w-4 text-neutral-600" />
                ) : (
                  <Maximize className="h-4 w-4 text-neutral-600" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Copy and Download buttons */}
              {(onCopy || onDownload) && (
                <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                  {onCopy && (
                    <button
                      onClick={onCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </button>
                  )}
                  {onCopy && onDownload && <div className="h-5 w-px bg-neutral-200" />}
                  {onDownload && (
                    <button
                      onClick={onDownload}
                      className="px-2 py-1.5 text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NotionPanel Component */}
        <div className={showHeaderControls ? "h-[calc(100%-57px)] overflow-hidden" : "h-full overflow-hidden"}>
          <NotionPanel
            title={title}
            onTitleChange={onTitleChange}
            properties={properties}
            onPropertyChange={onPropertyChange}
            showPageControls={showPageControls}
            width={isFullScreen ? undefined : panelWidth}
            onWidthChange={isFullScreen ? undefined : handleWidthChange}
            minWidth={minWidth}
            maxWidth={maxWidth}
            isOpen={isOpen}
            isNewIdea={isNewIdea}
            placeholder={placeholder}
            tabData={tabData}
            defaultTab={defaultTab}
            footer={footer}
            customTabLabels={restProps.customTabLabels}
            {...restProps}
          >
            {children}
          </NotionPanel>
        </div>
      </div>
    </div>
  );
}
