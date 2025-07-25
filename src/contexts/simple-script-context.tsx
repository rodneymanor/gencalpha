"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

import { ClientScriptService, type ScriptGenerationRequest } from "@/lib/services/client-script-service";

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

  openPanel: () => void;
  closePanel: () => void;
  setEditorContent: (content: string) => void;
  insertContentToEditor: (content: string) => void;
  generateScriptFromIdea: (request: ScriptGenerationRequest) => Promise<void>;
}

const SimpleScriptContext = createContext<SimpleScriptContextType | undefined>(undefined);

export function SimpleScriptProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [scriptComponents, setScriptComponents] = useState<ScriptComponent[]>([]);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const insertContentToEditor = useCallback((content: string) => {
    setEditorContent((prev) => prev + (prev.length > 0 ? "\n\n" : "") + content);
  }, []);

  const generateScriptFromIdea = useCallback(async (request: ScriptGenerationRequest) => {
    setIsGenerating(true);
    setGenerationProgress("Generating script...");

    try {
      const response = await ClientScriptService.generateSpeedWrite(request);

      if (response.success) {
        const newComponents: ScriptComponent[] = [];

        if (response.optionA) {
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
  }, []);

  const contextValue = useMemo(
    () => ({
      isPanelOpen,
      editorContent,
      isGenerating,
      generationProgress,
      scriptComponents,
      openPanel,
      closePanel,
      setEditorContent,
      insertContentToEditor,
      generateScriptFromIdea,
    }),
    [
      isPanelOpen,
      editorContent,
      isGenerating,
      generationProgress,
      scriptComponents,
      openPanel,
      closePanel,
      setEditorContent,
      insertContentToEditor,
      generateScriptFromIdea,
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
