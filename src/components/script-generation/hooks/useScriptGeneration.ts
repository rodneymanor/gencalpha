import { useCallback } from "react";
import { useEnhancedScriptAnalytics } from "@/hooks/use-script-analytics";
import { detectSocialUrl } from "@/lib/utils/lightweight-url-detector";
import { TranscriptionService } from "../services/transcription-service";
import { 
  mapContentActionsToQuickGenerators, 
  mapContentActionsToTemplates,
  enhancePromptForGenerator,
  enhancePromptForTemplate,
  calculateWordCount,
  isScriptGenerationError
} from "../utils";
import { ERROR_MESSAGES } from "../constants";
import { useScriptState } from "./useScriptState";
import { useTemplateSelection } from "./useTemplateSelection";
import { useScriptSave } from "./useScriptSave";

interface UseScriptGenerationProps {
  initialPrompt?: string;
  onScriptComplete?: (script: string) => void;
}

export function useScriptGeneration({ 
  initialPrompt = "", 
  onScriptComplete 
}: UseScriptGenerationProps) {
  // State management
  const scriptState = useScriptState(initialPrompt);
  const templateSelection = useTemplateSelection();
  
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
  const handleSend = useCallback(async (value: string) => {
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
        url: urlDetection.url
      });
      
      const transcriptionService = new TranscriptionService();
      
      await transcriptionService.processVideoUrl(urlDetection.url, {
        onStart: () => {
          console.log("🎬 [useScriptGeneration] Transcription started");
          scriptState.setTranscriptionDebug(prev => ({
            ...prev,
            currentStep: "Video Processing",
            status: "Processing video URL and extracting content..."
          }));
        },
        onComplete: (result) => {
          if (result.success) {
            console.log("✅ [useScriptGeneration] Transcription completed:", result.script.substring(0, 200));
            scriptState.setTranscriptionDebug(prev => ({
              ...prev,
              currentStep: "Completed",
              status: "Transcription successful! Routing to editor...",
              transcript: result.rawTranscript,
              formattedScript: result.script
            }));
            
            // Small delay to show completion state in debug
            setTimeout(() => {
              scriptState.setGeneratedScript(result.script);
              scriptState.setFlowState("editing");
              onScriptComplete?.(result.script);
            }, 1000);
          } else {
            scriptState.setTranscriptionDebug(prev => ({
              ...prev,
              currentStep: "Error",
              status: "Transcription failed",
              error: result.error || "Unknown transcription error"
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
          scriptState.setTranscriptionDebug(prev => ({
            ...prev,
            currentStep: "Error",
            status: "Transcription service error",
            error: error
          }));
          scriptState.setLastError(error);
          
          // Delay before going back to input to show error
          setTimeout(() => {
            scriptState.setFlowState("input");
          }, 3000);
        },
        onFinally: () => {
          console.log("🔄 [useScriptGeneration] Transcription process completed");
        }
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
        quickGenerators
      );
    }

    if (templateSelection.selectedTemplate) {
      enhancedPrompt = enhancePromptForTemplate(
        enhancedPrompt, 
        templateSelection.selectedTemplate, 
        templates
      );
    }

    scriptState.setInputValue(enhancedPrompt);
    scriptState.setFlowState("generating");
  }, [
    templateSelection.selectedQuickGenerator, 
    templateSelection.selectedTemplate, 
    quickGenerators, 
    templates, 
    scriptState,
    onScriptComplete
  ]);

  const handleGenerationComplete = useCallback((script: string) => {
    // Check if this is a fallback script (indicates an error occurred)
    if (isScriptGenerationError(script)) {
      scriptState.setLastError(ERROR_MESSAGES.GENERATION_FALLBACK);
    } else {
      scriptState.setLastError(null);
    }

    scriptState.setGeneratedScript(script);
    scriptState.setFlowState("editing");
    onScriptComplete?.(script);
  }, [scriptState, onScriptComplete]);

  const handleBackToInput = useCallback(() => {
    scriptState.handleBackToInput();
    // Clear template/generator selections when starting fresh
    templateSelection.clearSelections();
  }, [scriptState, templateSelection]);

  // Enhanced Toolbar Handlers
  const handleToolbarAction = useCallback((action: string) => {
    console.log("Toolbar action:", action);
    scriptState.addRecentAction(action);
  }, [scriptState]);

  // AI Action Sidebar Handlers
  const handleActionTrigger = useCallback((action: string, prompt: string) => {
    console.log("Triggered action:", action, "with prompt:", prompt);
    scriptState.addRecentAction(action);
  }, [scriptState]);

  // Content Change Handler (for word count)
  const handleContentChange = useCallback((content: any) => {
    const count = calculateWordCount(content);
    scriptState.setWordCount(count);
  }, [scriptState]);

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
