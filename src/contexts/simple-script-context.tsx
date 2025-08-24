"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

import { ClientScriptService, type ScriptGenerationRequest } from "@/lib/services/client-script-service";
import { useConversationStore } from "@/lib/script-generation/conversation-store";
import type { ScriptIteration } from "@/lib/script-generation/conversation-types";

export interface ScriptComponent {
  id: string;
  type: "hook" | "bridge" | "nugget" | "wta" | "full-script";
  title: string;
  content: string;
  metadata?: {
    originalIdea?: string;
    generatedAt: string;
    approach?: "speed-write" | "educational" | "viral";
    estimatedDuration?: string;
  };
}

interface SimpleScriptContextType {
  isPanelOpen: boolean;
  editorContent: string;
  isGenerating: boolean;
  generationProgress: string;
  scriptComponents: ScriptComponent[];
  currentSessionId: string | null;

  openPanel: () => void;
  closePanel: () => void;
  setEditorContent: (content: string) => void;
  insertContentToEditor: (content: string) => void;
  generateScriptFromIdea: (request: ScriptGenerationRequest) => Promise<void>;
  startInteractiveSession: (idea: string, initialScript?: ScriptIteration) => string;
}

const SimpleScriptContext = createContext<SimpleScriptContextType | undefined>(undefined);

export function SimpleScriptProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [scriptComponents, setScriptComponents] = useState<ScriptComponent[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const { startNewConversation, updateScript } = useConversationStore();

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const insertContentToEditor = useCallback((content: string) => {
    setEditorContent((prev) => prev + (prev.length > 0 ? "\n\n" : "") + content);
  }, []);

  const startInteractiveSession = useCallback((idea: string, initialScript?: ScriptIteration) => {
    // Create a new conversation session
    const sessionId = startNewConversation(idea, initialScript);
    setCurrentSessionId(sessionId);
    
    // If initial script provided, update editor
    if (initialScript) {
      setEditorContent(initialScript.content);
    }
    
    return sessionId;
  }, [startNewConversation]);

  const generateScriptFromIdea = useCallback(async (request: ScriptGenerationRequest) => {
    setIsGenerating(true);
    setGenerationProgress("Generating script...");

    try {
      const response = await ClientScriptService.generateSpeedWrite(request);

      if (response.success) {
        const newComponents: ScriptComponent[] = [];
        let primaryScript: ScriptIteration | undefined;

        if (response.optionA) {
          const wordCount = response.optionA.content.split(/\s+/).length;
          
          // Create ScriptIteration for conversation
          primaryScript = {
            version: 1,
            content: response.optionA.content,
            elements: {
              hook: response.optionA.hook || '',
              bridge: response.optionA.bridge || '',
              goldenNugget: response.optionA.goldenNugget || '',
              wta: response.optionA.wta || ''
            },
            metadata: {
              tone: response.optionA.approach === 'viral' ? 'energetic' : 
                    response.optionA.approach === 'educational' ? 'educational' : 'casual',
              duration: response.optionA.estimatedDuration || '0:00',
              wordCount,
              lastModified: new Date(),
              changeLog: ['Initial script generated']
            }
          };
          
          newComponents.push({
            id: `option-a-${Date.now()}`,
            type: "full-script",
            title: `${response.optionA.title} (Option A)`,
            content: response.optionA.content,
            metadata: {
              originalIdea: request.idea,
              generatedAt: new Date().toISOString(),
              approach: response.optionA.approach,
              estimatedDuration: response.optionA.estimatedDuration,
            },
          });
        }

        if (response.optionB) {
          newComponents.push({
            id: `option-b-${Date.now()}`,
            type: "full-script",
            title: `${response.optionB.title} (Option B)`,
            content: response.optionB.content,
            metadata: {
              originalIdea: request.idea,
              generatedAt: new Date().toISOString(),
              approach: response.optionB.approach,
              estimatedDuration: response.optionB.estimatedDuration,
            },
          });
        }

        setScriptComponents((prev) => [...prev, ...newComponents]);
        setGenerationProgress("Scripts generated successfully!");
        
        // Start interactive session with the primary script
        if (primaryScript) {
          const sessionId = startInteractiveSession(request.idea, primaryScript);
          console.log('Started interactive session:', sessionId);
        }
      } else {
        throw new Error(response.error ?? "Failed to generate script");
      }
    } catch (error) {
      console.error("Script generation failed:", error);
      setGenerationProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(""), 3000);
    }
  }, [startInteractiveSession]);

  const contextValue = useMemo(
    () => ({
      isPanelOpen,
      editorContent,
      isGenerating,
      generationProgress,
      scriptComponents,
      currentSessionId,
      openPanel,
      closePanel,
      setEditorContent,
      insertContentToEditor,
      generateScriptFromIdea,
      startInteractiveSession,
    }),
    [
      isPanelOpen,
      editorContent,
      isGenerating,
      generationProgress,
      scriptComponents,
      currentSessionId,
      openPanel,
      closePanel,
      setEditorContent,
      insertContentToEditor,
      generateScriptFromIdea,
      startInteractiveSession,
    ],
  );

  return <SimpleScriptContext.Provider value={contextValue}>{children}</SimpleScriptContext.Provider>;
}

export function useSimpleScript() {
  const context = useContext(SimpleScriptContext);
  if (context === undefined) {
    throw new Error("useSimpleScript must be used within a SimpleScriptProvider");
  }
  return context;
}

// Alias for compatibility
export const useEnhancedScriptPanel = useSimpleScript;
