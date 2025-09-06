import { useCallback, useEffect } from "react";

import { useEnhancedScriptAnalytics } from "@/hooks/use-script-analytics";
import { detectSocialUrl } from "@/lib/utils/lightweight-url-detector";

import { ERROR_MESSAGES } from "../constants";
import { TranscriptionService } from "../services/transcription-service";
import {
  mapContentActionsToQuickGenerators,
  mapContentActionsToTemplates,
  enhancePromptForGenerator,
  enhancePromptForTemplate,
  calculateWordCount,
  isScriptGenerationError,
} from "../utils";

import { useScriptSave } from "./useScriptSave";
import { useScriptState } from "./useScriptState";
import { useTemplateSelection } from "./useTemplateSelection";

interface UseScriptGenerationProps {
  initialPrompt?: string;
  onScriptComplete?: (script: string) => void;
  fromLibrary?: boolean;
  preselectedGenerator?: string;
  preselectedTemplate?: string;
}

/**
 * Formats hook content from structured data or parses from library format
 * Handles both structured hook objects and flat text format
 */
function formatHookContent(content: string, metadata: any): string {
  // First, check if we have structured hooks data in metadata (from hook_generations)
  if (metadata?.hooks && Array.isArray(metadata.hooks)) {
    try {
      // Format structured hooks data into a clean numbered list
      const formattedHooks = metadata.hooks.map((hook: any, index: number) => {
        return `${index + 1}. ${hook.text}`;
      });

      if (formattedHooks.length > 0) {
        console.log("📋 [formatHookContent] Formatted structured hooks:", formattedHooks.length);
        return formattedHooks.join("\n\n");
      }
    } catch (error) {
      console.warn("⚠️ [formatHookContent] Failed to format structured hooks:", error);
    }
  }

  // Check for items array from scripts collection (new structure)
  if (metadata?.items && Array.isArray(metadata.items)) {
    try {
      // Format items from scripts collection
      const formattedItems = metadata.items.map((item: any) => {
        // Handle both {number, text} and {text} formats
        const number = item.number || metadata.items.indexOf(item) + 1;
        return `${number}. ${item.text}`;
      });

      if (formattedItems.length > 0) {
        console.log("📝 [formatHookContent] Formatted structured items:", formattedItems.length);
        return formattedItems.join("\n\n");
      }
    } catch (error) {
      console.warn("⚠️ [formatHookContent] Failed to format structured items:", error);
    }
  }

  // Fallback: Parse flat text format if no structured data
  if (content) {
    try {
      // Split the content by lines and process each hook
      const lines = content.split("\n").filter((line) => line.trim());
      const parsedHooks: string[] = [];

      lines.forEach((line) => {
        // Match pattern: "1. Hook text (focus, rating/100)"
        const hookMatch = line.match(/^(\d+)\.\s*(.+?)\s*\([^)]+\)$/);
        if (hookMatch) {
          const [, number, hookText] = hookMatch;
          parsedHooks.push(`${number}. ${hookText.trim()}`);
        } else if (line.match(/^\d+\./)) {
          // Fallback for simpler numbered format
          parsedHooks.push(line.trim());
        }
      });

      // If we successfully parsed hooks, return them as a clean numbered list
      if (parsedHooks.length > 0) {
        console.log("🔍 [formatHookContent] Parsed text hooks:", parsedHooks.length);
        return parsedHooks.join("\n\n");
      }
    } catch (error) {
      console.warn("⚠️ [formatHookContent] Failed to parse hook content:", error);
    }
  }

  // Final fallback: return original content if all processing fails
  return content || "";
}

export function useScriptGeneration({
  initialPrompt = "",
  onScriptComplete,
  fromLibrary = false,
  preselectedGenerator,
  preselectedTemplate,
}: UseScriptGenerationProps) {
  // State management
  const scriptState = useScriptState(initialPrompt);
  const templateSelection = useTemplateSelection(preselectedGenerator, preselectedTemplate);

  // Load library content when coming from library
  useEffect(() => {
    if (fromLibrary) {
      try {
        const libraryContent = localStorage.getItem("libraryContent");
        if (libraryContent) {
          const content = JSON.parse(libraryContent);
          console.log("📚 [useScriptGeneration] Loading library content:", content);

          // Process content to restore proper formatting for hooks and ideas
          let processedContent = content.content ?? "";
          if (content.category === "hooks" || content.category === "idea") {
            processedContent = formatHookContent(processedContent, content.metadata);
            console.log(`📝 [useScriptGeneration] Processed ${content.category} content for proper display`);
          }

          // Set the script content and title
          scriptState.setGeneratedScript(processedContent);
          scriptState.setScriptTitle(content.title ?? "Library Content");

          console.log("🔍 [useScriptGeneration] After setting content:", {
            processedContentLength: processedContent.length,
            processedContentPreview: processedContent.substring(0, 200),
            category: content.category,
            hasMetadataItems: !!content.metadata?.items,
            itemsCount: content.metadata?.items?.length,
          });

          // Set the appropriate quick generator based on category or metadata
          if (content.category === "hooks") {
            templateSelection.handleQuickGeneratorSelect("generate-hooks");
            console.log("🎣 [useScriptGeneration] Set generator to generate-hooks for hook content");
          } else if (content.category === "idea") {
            templateSelection.handleQuickGeneratorSelect("content-ideas");
            console.log("💡 [useScriptGeneration] Set generator to content-ideas for idea content");
          } else if (content.category === "script") {
            // Check if this script was generated from hooks by looking at tags or content patterns
            const isHookScript =
              content.metadata?.scriptContent?.includes("## 10 Hooks") ||
              (content.metadata?.scriptContent?.includes("1.") &&
                content.metadata?.scriptContent?.includes("2.") &&
                content.title?.toLowerCase().includes("hook"));

            if (isHookScript) {
              templateSelection.handleQuickGeneratorSelect("generate-hooks");
              console.log(
                "🎣 [useScriptGeneration] Detected hook-generated script, setting generator to generate-hooks",
              );
            }
          }

          // Go directly to editing mode for all library content
          scriptState.setFlowState("editing");

          // Clear the localStorage after loading
          localStorage.removeItem("libraryContent");
        }
      } catch (error) {
        console.error("❌ [useScriptGeneration] Failed to load library content:", error);
      }
    }
  }, [fromLibrary, scriptState, templateSelection]);

  // Script analytics
  const scriptAnalysis = useEnhancedScriptAnalytics(scriptState.generatedScript);

  // Script saving
  const { isSaving, handleSaveScript } = useScriptSave({
    generatedScript: scriptState.generatedScript,
    scriptTitle: scriptState.scriptTitle,
    savedScriptId: scriptState.savedScriptId,
    selectedPersona: scriptState.selectedPersona,
    selectedTemplate: templateSelection.selectedTemplate,
    selectedQuickGenerator: templateSelection.selectedQuickGenerator,
    inputValue: scriptState.inputValue,
    onSaveSuccess: (scriptId: string, title: string) => {
      scriptState.setSavedScriptId(scriptId);
      scriptState.setScriptTitle(title);
    },
  });

  // Data transformations
  const quickGenerators = mapContentActionsToQuickGenerators();
  const templates = mapContentActionsToTemplates();

  // Event handlers
  const handleSend = useCallback(
    async (value: string) => {
      if (!value.trim()) return;

      const trimmedValue = value.trim();

      // Check if input is a social media URL
      const urlDetection = detectSocialUrl(trimmedValue);
      if (urlDetection.isValid && urlDetection.url) {
        // Route to transcription flow
        scriptState.setInputValue(trimmedValue);
        scriptState.setFlowState("transcribing");

        // Initialize debug state
        scriptState.setTranscriptionDebug({
          currentStep: "URL Detection",
          status: "Initializing transcription...",
          url: urlDetection.url,
        });

        const transcriptionService = new TranscriptionService();

        await transcriptionService.processVideoUrl(urlDetection.url, {
          onStart: () => {
            console.log("🎬 [useScriptGeneration] Transcription started");
            scriptState.setTranscriptionDebug((prev) => ({
              ...prev,
              currentStep: "Video Processing",
              status: "Processing video URL and extracting content...",
            }));
          },
          onComplete: (result) => {
            if (result.success) {
              console.log("✅ [useScriptGeneration] Transcription completed:", result.script.substring(0, 200));
              scriptState.setTranscriptionDebug((prev) => ({
                ...prev,
                currentStep: "Completed",
                status: "Transcription successful! Routing to editor...",
                transcript: result.rawTranscript,
                formattedScript: result.script,
              }));

              // Small delay to show completion state in debug
              setTimeout(() => {
                scriptState.setGeneratedScript(result.script);
                scriptState.setFlowState("editing");
                onScriptComplete?.(result.script);
              }, 1000);
            } else {
              scriptState.setTranscriptionDebug((prev) => ({
                ...prev,
                currentStep: "Error",
                status: "Transcription failed",
                error: result.error || "Unknown transcription error",
              }));
              scriptState.setLastError(result.error || "Transcription failed. Please try again.");

              // Delay before going back to input to show error
              setTimeout(() => {
                scriptState.setFlowState("input");
              }, 3000);
            }
          },
          onError: (error) => {
            console.error("❌ [useScriptGeneration] Transcription error:", error);
            scriptState.setTranscriptionDebug((prev) => ({
              ...prev,
              currentStep: "Error",
              status: "Transcription service error",
              error: error,
            }));
            scriptState.setLastError(error);

            // Delay before going back to input to show error
            setTimeout(() => {
              scriptState.setFlowState("input");
            }, 3000);
          },
          onFinally: () => {
            console.log("🔄 [useScriptGeneration] Transcription process completed");
          },
        });
        return;
      }

      // Regular script generation flow
      let enhancedPrompt = trimmedValue;

      // Enhance prompt based on template/generator selection
      if (templateSelection.selectedQuickGenerator) {
        enhancedPrompt = enhancePromptForGenerator(
          enhancedPrompt,
          templateSelection.selectedQuickGenerator,
          quickGenerators,
        );
      }

      if (templateSelection.selectedTemplate) {
        enhancedPrompt = enhancePromptForTemplate(enhancedPrompt, templateSelection.selectedTemplate, templates);
      }

      scriptState.setInputValue(enhancedPrompt);
      scriptState.setFlowState("generating");
    },
    [
      templateSelection.selectedQuickGenerator,
      templateSelection.selectedTemplate,
      quickGenerators,
      templates,
      scriptState,
      onScriptComplete,
    ],
  );

  const handleGenerationComplete = useCallback(
    (script: string) => {
      // Check if this is a fallback script (indicates an error occurred)
      if (isScriptGenerationError(script)) {
        scriptState.setLastError(ERROR_MESSAGES.GENERATION_FALLBACK);
      } else {
        scriptState.setLastError(null);
      }

      scriptState.setGeneratedScript(script);
      scriptState.setFlowState("editing");
      onScriptComplete?.(script);
    },
    [scriptState, onScriptComplete],
  );

  const handleBackToInput = useCallback(() => {
    scriptState.handleBackToInput();
    // Clear template/generator selections when starting fresh
    templateSelection.clearSelections();
  }, [scriptState, templateSelection]);

  // Enhanced Toolbar Handlers
  const handleToolbarAction = useCallback(
    (action: string) => {
      console.log("Toolbar action:", action);
      scriptState.addRecentAction(action);
    },
    [scriptState],
  );

  // AI Action Sidebar Handlers
  const handleActionTrigger = useCallback(
    (action: string, prompt: string) => {
      console.log("Triggered action:", action, "with prompt:", prompt);
      scriptState.addRecentAction(action);
    },
    [scriptState],
  );

  // Content Change Handler (for word count)
  const handleContentChange = useCallback(
    (content: any) => {
      const count = calculateWordCount(content);
      scriptState.setWordCount(count);
    },
    [scriptState],
  );

  const handleCreateCustomTemplate = useCallback(() => {
    // Focus the input - this could be extended with a modal
    // For now, just ensure input is ready
    console.log("Create custom template requested");
  }, []);

  return {
    // State
    ...scriptState,
    ...templateSelection,
    scriptAnalysis,
    isSaving,

    // Data
    quickGenerators,
    templates,

    // Handlers
    handleSend,
    handleGenerationComplete,
    handleBackToInput,
    handleSaveScript,
    handleToolbarAction,
    handleActionTrigger,
    handleContentChange,
    handleCreateCustomTemplate,
  };
}
