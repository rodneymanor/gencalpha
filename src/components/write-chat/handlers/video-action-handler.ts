import { ACK_LOADING } from "@/components/write-chat/constants";
import { useInlineVideoActions } from "@/components/write-chat/hooks/use-inline-video-actions";
import { type VideoAction } from "@/components/write-chat/hooks/use-video-action-state";
import { type VideoUrl } from "@/components/write-chat/hooks/use-video-state";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import {
  createConversation,
  saveMessage as saveMessageToDb,
  generateTitle,
} from "@/components/write-chat/services/chat-service";
import { type ChatMessage } from "@/components/write-chat/types";

export interface VideoActionHandlerConfig {
  videoActionState: any; // Replace with proper type from use-video-action-state
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  conversationId: string | null;
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPersona: PersonaOption | null;
  initialPrompt?: string;
  isFirstResponse: boolean;
  setIsFirstResponse: React.Dispatch<React.SetStateAction<boolean>>;
  conversationTitle: string | null;
  setConversationTitle: React.Dispatch<React.SetStateAction<string | null>>;
  onAnswerReady?: () => void;
}

export function createVideoActionHandler(config: VideoActionHandlerConfig) {
  const {
    videoActionState,
    setMessages,
    conversationId,
    setConversationId,
    selectedPersona,
    initialPrompt,
    isFirstResponse,
    setIsFirstResponse,
    conversationTitle,
    setConversationTitle,
    onAnswerReady,
  } = config;

  const { handleTranscribe, handleIdeas, handleHooks } = useInlineVideoActions({
    setMessages,
    onAnswerReady,
  });

  return async function handleVideoAction(action: VideoAction, pendingVideoUrl: VideoUrl | null): Promise<void> {
    console.log("🎯 [handleVideoAction] Called with action:", action);

    if (!pendingVideoUrl) {
      console.log("❌ [handleVideoAction] No pending video URL");
      return;
    }

    // Try to request the action using atomic state management
    const requestId = videoActionState.actions.requestAction(action);
    console.log("📝 [handleVideoAction] Request ID:", requestId);

    if (!requestId) {
      // Request was rejected (debounced or already processing)
      console.log("🚫 [handleVideoAction] Request rejected by state machine");
      return;
    }

    // Start processing the action
    console.log("▶️ [handleVideoAction] Starting processing for action:", action);
    videoActionState.actions.startProcessing(action);

    // Remove the video-actions message and replace with selected action processing
    const actionText =
      action === "transcribe"
        ? "I'll transcribe this video for you."
        : action === "ideas"
          ? "I'll create content ideas from this video."
          : "I'll generate hooks from this video.";

    setMessages((prev) => {
      // Filter out the video-actions message and add loading message
      const filtered = prev.filter((m) => m.content !== "<video-actions>");
      return [
        ...filtered,
        { id: crypto.randomUUID(), role: "assistant", content: actionText },
        { id: crypto.randomUUID(), role: "assistant", content: ACK_LOADING },
      ];
    });

    const videoPanel = {
      url: pendingVideoUrl.url,
      platform: pendingVideoUrl.platform,
    };

    // Execute the action and handle completion with database persistence
    try {
      console.log("🚀 [executeAction] Starting execution for:", action);

      // Ensure conversation exists and save the assistant's action message
      let convId = conversationId;
      if (!convId) {
        try {
          convId = await createConversation(selectedPersona?.name ?? "Default", initialPrompt ?? undefined);
          if (convId) {
            setConversationId(convId);
            console.log("✅ [executeAction] Created conversation:", convId);
          }
        } catch (error) {
          console.warn("⚠️ [executeAction] Failed to create conversation:", error);
        }
      }

      // Save the assistant's action acknowledgment message
      if (convId) {
        try {
          await saveMessageToDb(convId, "assistant", actionText);
          console.log("✅ [executeAction] Saved action message to database");
        } catch (error) {
          console.warn("⚠️ [executeAction] Failed to save action message:", error);
        }
      }

      let resultContent: string | null = null;

      switch (action) {
        case "transcribe":
          console.log("📝 [executeAction] Calling handleTranscribe");
          await handleTranscribe(videoPanel);
          resultContent = "✨ Video transcription completed and opened in the editor panel.";
          console.log("✅ [executeAction] handleTranscribe completed");
          break;
        case "ideas":
          await handleIdeas(videoPanel);
          resultContent = "✨ Content ideas generated and opened in the editor panel.";
          break;
        case "hooks":
          await handleHooks(videoPanel);
          resultContent = "✨ Video hooks generated and opened in the editor panel.";
          break;
      }

      // Save the result message to the database
      if (convId && resultContent) {
        try {
          await saveMessageToDb(convId, "assistant", resultContent);
          console.log("✅ [executeAction] Saved result message to database");

          // Generate title if this is the first response
          if (isFirstResponse && !conversationTitle) {
            const messagesForTitle = [
              { role: "user" as const, content: videoPanel.url },
              { role: "assistant" as const, content: resultContent },
            ];
            const generatedTitle = await generateTitle(convId, messagesForTitle);
            if (generatedTitle) {
              setConversationTitle(generatedTitle);
              setIsFirstResponse(false);
              console.log("✅ [executeAction] Generated title:", generatedTitle);
            }
          }
        } catch (error) {
          console.warn("⚠️ [executeAction] Failed to save result or generate title:", error);
        }
      }
    } catch (error) {
      console.error("❌ [executeAction] Error:", error);
      const errorMessage = `Error: ${error instanceof Error ? error.message : "Action failed"}`;

      // Save error message to database
      if (conversationId) {
        try {
          await saveMessageToDb(conversationId, "assistant", errorMessage);
        } catch (saveError) {
          console.warn("⚠️ [executeAction] Failed to save error message:", saveError);
        }
      }
    } finally {
      // Always complete the action, even if it fails
      console.log("🏁 [executeAction] Completing action in state machine");
      videoActionState.actions.completeAction();
    }
  };
}
