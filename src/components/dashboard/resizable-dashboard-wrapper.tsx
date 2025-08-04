"use client";

import { ReactNode } from "react";

import { Panel, PanelGroup } from "react-resizable-panels";

import { ChatbotPanel } from "@/components/chatbot/chatbot-panel";
import type { PersonaType } from "@/components/chatbot/persona-selector";
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
  const {
    showWritingPanel,
    showNotesPanel,
    showChatbotPanel,
    writingPanelSize,
    mainContentSize,
    notesPanelSize,
    chatbotPanelSize,
    chatbotInitialPrompt,
    chatbotInitialPersona,
  } = state;

  // Helper functions to reduce complexity
  const mapSinglePanelSizes = (sizes: number[]) => {
    let writing = writingPanelSize;
    let main = mainContentSize;
    let notes = notesPanelSize;
    let chatbot = chatbotPanelSize;

    if (showWritingPanel) [main, writing] = sizes;
    else if (showNotesPanel) [main, notes] = sizes;
    else if (showChatbotPanel) [main, chatbot] = sizes;

    return [writing, main, notes, chatbot];
  };

  const mapDoublePanelSizes = (sizes: number[]) => {
    let writing = writingPanelSize;
    let main = mainContentSize;
    let notes = notesPanelSize;
    let chatbot = chatbotPanelSize;

    if (showWritingPanel && showNotesPanel) [main, writing, notes] = sizes;
    else if (showWritingPanel && showChatbotPanel) [main, writing, chatbot] = sizes;
    else if (showNotesPanel && showChatbotPanel) [main, notes, chatbot] = sizes;

    return [writing, main, notes, chatbot];
  };

  const mapTriplePanelSizes = (sizes: number[]) => {
    const [main, writing, notes, chatbot] = sizes;
    return [writing, main, notes, chatbot];
  };

  // Helper function to map panel sizes based on visible panels
  const mapPanelSizes = (sizes: number[], visiblePanels: string[]) => {
    if (visiblePanels.length === 1) return mapSinglePanelSizes(sizes);
    if (visiblePanels.length === 2) return mapDoublePanelSizes(sizes);
    if (visiblePanels.length === 3) return mapTriplePanelSizes(sizes);

    return [writingPanelSize, mainContentSize, notesPanelSize, chatbotPanelSize];
  };

  // Handle layout size updates and map to context order [writing, main, notes, chatbot]
  const handleLayout = (sizes: number[]) => {
    if (!showWritingPanel && !showNotesPanel && !showChatbotPanel) return;

    const visiblePanels = [];
    if (showWritingPanel) visiblePanels.push("writing");
    if (showNotesPanel) visiblePanels.push("notes");
    if (showChatbotPanel) visiblePanels.push("chatbot");

    const mappedSizes = mapPanelSizes(sizes, visiblePanels);
    updatePanelSizes(mappedSizes);
  };

  // If no side panels, render children directly.
  if (!showWritingPanel && !showNotesPanel && !showChatbotPanel) {
    return <>{children}</>;
  }

  return (
    <PanelGroup direction="horizontal" className={cn("flex h-full w-full", className)} onLayout={handleLayout}>
      {/* Main content (always left-most) */}
      <Panel defaultSize={mainContentSize} minSize={40} order={1} className="h-full overflow-y-auto">
        {children}
      </Panel>

      {/* Optional Writing panel (right side) */}
      {showWritingPanel && (
        <Panel defaultSize={writingPanelSize} minSize={10} maxSize={30} order={2} className="border-l">
          <WritingPanel />
        </Panel>
      )}

      {/* Optional Notes panel */}
      {showNotesPanel && (
        <Panel defaultSize={notesPanelSize} minSize={10} maxSize={30} order={3} className="border-l">
          <NotesPanel />
        </Panel>
      )}

      {/* Optional Chatbot panel (outermost right) */}
      {showChatbotPanel && (
        <Panel defaultSize={chatbotPanelSize} minSize={10} maxSize={30} order={4} className="border-l">
          <ChatbotPanel initialPrompt={chatbotInitialPrompt} initialPersona={chatbotInitialPersona as PersonaType} />
        </Panel>
      )}
    </PanelGroup>
  );
}
