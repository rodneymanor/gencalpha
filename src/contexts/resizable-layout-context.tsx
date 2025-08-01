"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

interface ResizableLayoutState {
  showWritingPanel: boolean;
  showNotesPanel: boolean;
  writingPanelSize: number; // percentage
  notesPanelSize: number; // percentage
  mainContentSize: number; // percentage
}

interface ResizableLayoutContextType {
  state: ResizableLayoutState;
  setState: Dispatch<SetStateAction<ResizableLayoutState>>;
  toggleWritingPanel: () => void;
  toggleNotesPanel: () => void;
  updatePanelSizes: (sizes: number[]) => void;
  resetLayout: () => void;
}

const ResizableLayoutContext = createContext<ResizableLayoutContextType | undefined>(undefined);

const DEFAULT_STATE: ResizableLayoutState = {
  showWritingPanel: false,
  showNotesPanel: false,
  writingPanelSize: 25,
  notesPanelSize: 25,
  mainContentSize: 50,
};

export function ResizableLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResizableLayoutState>(DEFAULT_STATE);

  const toggleWritingPanel = () => {
    setState((prev) => {
      const nextShowWriting = !prev.showWritingPanel;
      const main = nextShowWriting ? (prev.showNotesPanel ? 50 : 75) : prev.showNotesPanel ? 75 : 100;
      return { ...prev, showWritingPanel: nextShowWriting, mainContentSize: main };
    });
  };

  const toggleNotesPanel = () => {
    setState((prev) => {
      const nextShowNotes = !prev.showNotesPanel;
      const main = nextShowNotes ? (prev.showWritingPanel ? 50 : 75) : prev.showWritingPanel ? 75 : 100;
      return { ...prev, showNotesPanel: nextShowNotes, mainContentSize: main };
    });
  };

  const updatePanelSizes = (sizes: number[]) => {
    if (sizes.length !== 3) return; // expecting [writing, main, notes]
    const [writing, main, notes] = sizes;
    setState((prev) => ({
      ...prev,
      writingPanelSize: writing || prev.writingPanelSize,
      mainContentSize: main || prev.mainContentSize,
      notesPanelSize: notes || prev.notesPanelSize,
    }));
  };

  const resetLayout = () => setState(DEFAULT_STATE);

  return (
    <ResizableLayoutContext.Provider value={{ state, setState, toggleWritingPanel, toggleNotesPanel, updatePanelSizes, resetLayout }}>
      {children}
    </ResizableLayoutContext.Provider>
  );
}

export function useResizableLayout() {
  const context = useContext(ResizableLayoutContext);
  if (!context) throw new Error("useResizableLayout must be used within ResizableLayoutProvider");
  return context;
}
