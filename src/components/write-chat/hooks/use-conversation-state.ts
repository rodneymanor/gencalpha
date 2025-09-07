import { useState, useCallback } from "react";

import { createConversation, saveMessage as saveMessageToDb } from "@/components/write-chat/services/chat-service";

export interface UseConversationStateReturn {
  // Conversation state
  conversationId: string | null;
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  conversationTitle: string | null;
  setConversationTitle: React.Dispatch<React.SetStateAction<string | null>>;
  isFirstResponse: boolean;
  setIsFirstResponse: React.Dispatch<React.SetStateAction<boolean>>;

  // Helper methods
  ensureConversation: (assistantName: string, initialPrompt?: string) => Promise<string | null>;
  saveUserMessage: (message: string) => Promise<void>;
  saveAssistantMessage: (message: string) => Promise<void>;
}

export function useConversationState(): UseConversationStateReturn {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(true);

  const ensureConversation = useCallback(
    async (assistantName: string, initialPrompt?: string): Promise<string | null> => {
      try {
        let convId = conversationId;
        if (!convId) {
          const createdId = await createConversation(assistantName, initialPrompt);
          if (createdId) {
            convId = createdId;
            setConversationId(createdId);
          }
        }
        return convId;
      } catch (error) {
        console.warn("⚠️ [useConversationState] Failed to ensure conversation:", error);
        return null;
      }
    },
    [conversationId],
  );

  const saveUserMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!conversationId) {
        console.warn("⚠️ [useConversationState] No conversation ID available for saving user message");
        return;
      }

      try {
        await saveMessageToDb(conversationId, "user", message);
      } catch (error) {
        console.warn("⚠️ [useConversationState] Failed to save user message:", error);
      }
    },
    [conversationId],
  );

  const saveAssistantMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!conversationId) {
        console.warn("⚠️ [useConversationState] No conversation ID available for saving assistant message");
        return;
      }

      try {
        await saveMessageToDb(conversationId, "assistant", message);
      } catch (error) {
        console.warn("⚠️ [useConversationState] Failed to save assistant message:", error);
      }
    },
    [conversationId],
  );

  return {
    // State
    conversationId,
    setConversationId,
    conversationTitle,
    setConversationTitle,
    isFirstResponse,
    setIsFirstResponse,

    // Methods
    ensureConversation,
    saveUserMessage,
    saveAssistantMessage,
  };
}
