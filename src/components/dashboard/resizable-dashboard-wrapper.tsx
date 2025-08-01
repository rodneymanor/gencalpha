"use client";

import { ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { NotesPanel } from "./notes-panel";
import { WritingPanel } from "./writing-panel";
import { cn } from "@/lib/utils";

interface ResizableDashboardWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResizableDashboardWrapper({ children, className }: ResizableDashboardWrapperProps) {
  const { state, updatePanelSizes } = useResizableLayout();
  const { showWritingPanel, showNotesPanel, writingPanelSize, mainContentSize, notesPanelSize } = state;

  // Handle layout size updates and map to context order [writing, main, notes]
  const handleLayout = (sizes: number[]) => {
    if (!showWritingPanel && !showNotesPanel) return;

    let writing = writingPanelSize;
    let main = mainContentSize;
    let notes = notesPanelSize;

    if (showWritingPanel && showNotesPanel) {
      // Panel order: main, writing, notes
      [main, writing, notes] = sizes;
    } else if (showWritingPanel) {
      // Panel order: main, writing
      [main, writing] = sizes;
    } else if (showNotesPanel) {
      // Panel order: main, notes
      [main, notes] = sizes;
    }

    updatePanelSizes([writing, main, notes]);
  };

  // If no side panels, render children directly.
  if (!showWritingPanel && !showNotesPanel) {
    return <>{children}</>;
  }

  return (
    <PanelGroup slideOut direction="horizontal" className={cn("flex w-full", className)} onLayout={handleLayout}>
      {/* Main content (always left-most) */}
      <Panel defaultSize={mainContentSize} minSize={40} order={1} className="overflow-y-auto">
        {children}
      </Panel>

      {/* Optional Writing panel (right side) */}
      {showWritingPanel && (
        <>
          <PanelResizeHandle className="w-2 cursor-col-resize bg-border transition-colors hover:bg-primary/30" />
          <Panel defaultSize={writingPanelSize} minSize={10} maxSize={30} order={2} className="border-l">
            <WritingPanel />
          </Panel>
        </>
      )}

      {/* Optional Notes panel (outermost right) */}
      {showNotesPanel && (
        <>
          <PanelResizeHandle className="w-2 cursor-col-resize bg-border transition-colors hover:bg-primary/30" />
          <Panel defaultSize={notesPanelSize} minSize={10} maxSize={30} order={3} className="border-l">
            <NotesPanel />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
