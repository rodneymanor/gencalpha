"use client";

import { ReactNode } from "react";

import { Panel, PanelGroup } from "react-resizable-panels";

import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { cn } from "@/lib/utils";

import { NotesPanel } from "./notes-panel";
import { WritingPanel } from "./writing-panel";

interface ResizableDashboardWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResizableDashboardWrapper({ children, className }: ResizableDashboardWrapperProps) {
  const { state, updatePanelSizes } = useResizableLayout();
  const { showWritingPanel, showNotesPanel, writingPanelSize, mainContentSize, notesPanelSize } = state;

  // Helper functions to reduce complexity
  const mapSinglePanelSizes = (sizes: number[]) => {
    let writing = writingPanelSize;
    let main = mainContentSize;
    let notes = notesPanelSize;

    if (showWritingPanel) [main, writing] = sizes;
    else if (showNotesPanel) [main, notes] = sizes;

    return [writing, main, notes];
  };

  const mapDoublePanelSizes = (sizes: number[]) => {
    const [main, writing, notes] = sizes;
    return [writing, main, notes];
  };

  // Helper function to map panel sizes based on visible panels
  const mapPanelSizes = (sizes: number[], visiblePanels: string[]) => {
    if (visiblePanels.length === 1) return mapSinglePanelSizes(sizes);
    if (visiblePanels.length === 2) return mapDoublePanelSizes(sizes);

    return [writingPanelSize, mainContentSize, notesPanelSize];
  };

  // Handle layout size updates and map to context order [writing, main, notes]
  const handleLayout = (sizes: number[]) => {
    if (!showWritingPanel && !showNotesPanel) return;

    const visiblePanels = [];
    if (showWritingPanel) visiblePanels.push("writing");
    if (showNotesPanel) visiblePanels.push("notes");

    const mappedSizes = mapPanelSizes(sizes, visiblePanels);
    updatePanelSizes(mappedSizes);
  };

  // If no side panels, render children directly.
  if (!showWritingPanel && !showNotesPanel) {
    return <>{children}</>;
  }

  return (
    <PanelGroup direction="horizontal" className={cn("flex h-full w-full", className)} onLayout={handleLayout}>
      {/* Main content (always left-most) */}
      <Panel defaultSize={mainContentSize} minSize={40} order={1} className="h-full">
        {children}
      </Panel>

      {/* Optional Writing panel (right side) */}
      {showWritingPanel && (
        <Panel
          defaultSize={writingPanelSize}
          minSize={10}
          maxSize={30}
          order={2}
          className="h-full overflow-hidden border-l"
        >
          <WritingPanel />
        </Panel>
      )}

      {/* Optional Notes panel */}
      {showNotesPanel && (
        <Panel
          defaultSize={notesPanelSize}
          minSize={10}
          maxSize={30}
          order={3}
          className="h-full overflow-hidden border-l"
        >
          <NotesPanel />
        </Panel>
      )}
    </PanelGroup>
  );
}
