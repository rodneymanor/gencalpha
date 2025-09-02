import { useState, useCallback } from "react";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";

export interface UseIdeaModeStateReturn {
  // Idea mode state
  isIdeaMode: boolean;
  setIsIdeaMode: React.Dispatch<React.SetStateAction<boolean>>;
  ideaSaveMessage: string | null;
  setIdeaSaveMessage: React.Dispatch<React.SetStateAction<string | null>>;
  ideas: Note[];
  setIdeas: React.Dispatch<React.SetStateAction<Note[]>>;
  ideasOpen: boolean;
  setIdeasOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Helper methods
  saveIdea: (content: string) => Promise<void>;
  clearSaveMessage: () => void;
  loadIdeas: () => Promise<void>;
}

export function useIdeaModeState(): UseIdeaModeStateReturn {
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  
  const saveIdea = useCallback(async (content: string): Promise<void> => {
    try {
      const firstLine = content.split("\n")[0]?.trim() ?? "Untitled";
      const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine || "Untitled";
      
      await clientNotesService.createNote({
        title,
        content,
        type: "idea_inbox",
        source: "manual",
        starred: false,
      });
      
      setIdeaSaveMessage("Saved to Idea Inbox");
      setTimeout(() => setIdeaSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save idea:", error);
      setIdeaSaveMessage("Failed to save idea");
      setTimeout(() => setIdeaSaveMessage(null), 4000);
    }
  }, []);
  
  const clearSaveMessage = useCallback(() => {
    setIdeaSaveMessage(null);
  }, []);
  
  const loadIdeas = useCallback(async (): Promise<void> => {
    try {
      const res = await clientNotesService.getIdeaInboxNotes();
      setIdeas(res.notes ?? []);
    } catch (error) {
      console.error("Failed to load ideas:", error);
    }
  }, []);
  
  return {
    // State
    isIdeaMode,
    setIsIdeaMode,
    ideaSaveMessage,
    setIdeaSaveMessage,
    ideas,
    setIdeas,
    ideasOpen,
    setIdeasOpen,
    
    // Methods
    saveIdea,
    clearSaveMessage,
    loadIdeas,
  };
}
