"use client";

import { ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { NotesPanel } from "./notes-panel";
import { WritingPanel } from "./writing-panel";
import { ChatbotPanel } from "@/components/chatbot/chatbot-panel";
import { cn } from "@/lib/utils";

interface ResizableDashboardWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResizableDashboardWrapper({ children, className }: ResizableDashboardWrapperProps) {
  const { state, updatePanelSizes } = useResizableLayout();
  const { showWritingPanel, showNotesPanel, showChatbotPanel, writingPanelSize, mainContentSize, notesPanelSize, chatbotPanelSize, chatbotInitialPrompt, chatbotInitialPersona } = state;

  // Helper function to map panel sizes based on visible panels
  const mapPanelSizes = (sizes: number[], visiblePanels: string[]) => {
    let writing = writingPanelSize;
    let main = mainContentSize;
    let notes = notesPanelSize;
    let chatbot = chatbotPanelSize;

    if (visiblePanels.length === 1) {
      if (showWritingPanel) [main, writing] = sizes;
      else if (showNotesPanel) [main, notes] = sizes;
      else if (showChatbotPanel) [main, chatbot] = sizes;
    } else if (visiblePanels.length === 2) {
      if (showWritingPanel && showNotesPanel) [main, writing, notes] = sizes;
      else if (showWritingPanel && showChatbotPanel) [main, writing, chatbot] = sizes;
      else if (showNotesPanel && showChatbotPanel) [main, notes, chatbot] = sizes;
    } else if (visiblePanels.length === 3) {
      [main, writing, notes, chatbot] = sizes;
    }

    return [writing, main, notes, chatbot];
  };

  // Handle layout size updates and map to context order [writing, main, notes, chatbot]
  const handleLayout = (sizes: number[]) => {
    if (!showWritingPanel && !showNotesPanel && !showChatbotPanel) return;

    const visiblePanels = [];
    if (showWritingPanel) visiblePanels.push('writing');
    if (showNotesPanel) visiblePanels.push('notes');
    if (showChatbotPanel) visiblePanels.push('chatbot');

    const mappedSizes = mapPanelSizes(sizes, visiblePanels);
    updatePanelSizes(mappedSizes);
  };

  // If no side panels, render children directly.
  if (!showWritingPanel && !showNotesPanel && !showChatbotPanel) {
    return <>{children}</>;
  }

  return (
    <PanelGroup direction="horizontal" className={cn("flex w-full", className)} onLayout={handleLayout}>
      {/* Main content (always left-most) */}
      <Panel defaultSize={mainContentSize} minSize={40} order={1} className="overflow-y-auto">
        {children}
      </Panel>

      {/* Optional Writing panel (right side) */}
      {showWritingPanel && (
        <>
          <Panel defaultSize={writingPanelSize} minSize={10} maxSize={30} order={2} className="border-l">
            <WritingPanel />
          </Panel>
        </>
      )}

      {/* Optional Notes panel */}
      {showNotesPanel && (
        <>
          <Panel defaultSize={notesPanelSize} minSize={10} maxSize={30} order={3} className="border-l">
            <NotesPanel />
          </Panel>
        </>
      )}

      {/* Optional Chatbot panel (outermost right) */}
      {showChatbotPanel && (
        <>
          <Panel defaultSize={chatbotPanelSize} minSize={10} maxSize={30} order={4} className="border-l">
            <ChatbotPanel
              initialPrompt={chatbotInitialPrompt}
              initialPersona={chatbotInitialPersona as any}
            />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
