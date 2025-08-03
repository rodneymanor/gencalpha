"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useMemo } from "react";

interface ResizableLayoutState {
  showWritingPanel: boolean;
  showNotesPanel: boolean;
  showChatbotPanel: boolean;
  writingPanelSize: number; // percentage
  notesPanelSize: number; // percentage
  chatbotPanelSize: number; // percentage
  mainContentSize: number; // percentage
  chatbotInitialPrompt?: string;
  chatbotInitialPersona?: string;
}

interface ResizableLayoutContextType {
  state: ResizableLayoutState;
  setState: Dispatch<SetStateAction<ResizableLayoutState>>;
  toggleWritingPanel: () => void;
  toggleNotesPanel: () => void;
  toggleChatbotPanel: (initialPrompt?: string, initialPersona?: string) => void;
  updatePanelSizes: (sizes: number[]) => void;
  resetLayout: () => void;
}

const ResizableLayoutContext = createContext<ResizableLayoutContextType | undefined>(undefined);

const DEFAULT_STATE: ResizableLayoutState = {
  showWritingPanel: false,
  showNotesPanel: false,
  showChatbotPanel: false,
  writingPanelSize: 25,
  notesPanelSize: 25,
  chatbotPanelSize: 25,
  mainContentSize: 50,
};

export function ResizableLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResizableLayoutState>(DEFAULT_STATE);

  const toggleWritingPanel = () => {
    setState((prev) => {
      const nextShowWriting = !prev.showWritingPanel;
      const activePanels = [nextShowWriting, prev.showNotesPanel, prev.showChatbotPanel].filter(Boolean).length;
      const main = activePanels === 0 ? 100 : activePanels === 1 ? 75 : 50;
      return { ...prev, showWritingPanel: nextShowWriting, mainContentSize: main };
    });
  };

  const toggleNotesPanel = () => {
    setState((prev) => {
      const nextShowNotes = !prev.showNotesPanel;
      const activePanels = [prev.showWritingPanel, nextShowNotes, prev.showChatbotPanel].filter(Boolean).length;
      const main = activePanels === 0 ? 100 : activePanels === 1 ? 75 : 50;
      return { ...prev, showNotesPanel: nextShowNotes, mainContentSize: main };
    });
  };

  const toggleChatbotPanel = (initialPrompt?: string, initialPersona?: string) => {
    setState((prev) => {
      const nextShowChatbot = !prev.showChatbotPanel;
      const activePanels = [prev.showWritingPanel, prev.showNotesPanel, nextShowChatbot].filter(Boolean).length;
      const main = activePanels === 0 ? 100 : activePanels === 1 ? 75 : 50;
      return {
        ...prev,
        showChatbotPanel: nextShowChatbot,
        mainContentSize: main,
        chatbotInitialPrompt: nextShowChatbot ? initialPrompt : undefined,
        chatbotInitialPersona: nextShowChatbot ? initialPersona : undefined,
      };
    });
  };

  const updatePanelSizes = (sizes: number[]) => {
    if (sizes.length < 3) return; // expecting [writing, main, notes, chatbot] or fewer
    const [writing, main, notes, chatbot] = sizes;
    setState((prev) => ({
      ...prev,
      writingPanelSize: writing || prev.writingPanelSize,
      mainContentSize: main || prev.mainContentSize,
      notesPanelSize: notes || prev.notesPanelSize,
      chatbotPanelSize: chatbot || prev.chatbotPanelSize,
    }));
  };

  const resetLayout = () => setState(DEFAULT_STATE);

  const contextValue = useMemo(() => ({
    state,
    setState,
    toggleWritingPanel,
    toggleNotesPanel,
    toggleChatbotPanel,
    updatePanelSizes,
    resetLayout
  }), [state]);

  return (
    <ResizableLayoutContext.Provider value={contextValue}>
      {children}
    </ResizableLayoutContext.Provider>
  );
}

export function useResizableLayout() {
  const context = useContext(ResizableLayoutContext);
  if (!context) throw new Error("useResizableLayout must be used within ResizableLayoutProvider");
  return context;
}
