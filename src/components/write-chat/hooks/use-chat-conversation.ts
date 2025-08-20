"use client";

import { useCallback, useRef, useState } from "react";

import { ACK_LOADING, ACK_BEFORE_SLIDE_MS, SLIDE_DURATION_MS } from "@/components/write-chat/constants";
import { createConversation, saveMessage, chatbotReply } from "@/components/write-chat/services/chat-service";
import type { ChatMessage } from "@/components/write-chat/types";
import { delay } from "@/components/write-chat/utils";

export function useChatConversation(options: {
  initialPersona: string | null;
  initialPrompt?: string | null;
  onAssistantAnswerAppended?: () => void;
}) {
  const { initialPersona, initialPrompt, onAssistantAnswerAppended } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const ensureConversation = useCallback(
    async (persona: string) => {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(persona, initialPrompt ?? undefined);
        if (convId) setConversationId(convId);
      }
      return convId;
    },
    [conversationId, initialPrompt],
  );

  const appendUserWithAck = useCallback((text: string) => {
    const userMessageId = crypto.randomUUID();
    const ackMessageId = crypto.randomUUID();
    const ackLoadingId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: text },
      { id: ackMessageId, role: "assistant", content: "I'll help you with that." },
      { id: ackLoadingId, role: "assistant", content: ACK_LOADING },
    ]);
    return { userMessageId, ackLoadingId };
  }, []);

  const replaceAckWithAssistant = useCallback(
    async (assistantText: string, ackLoadingId: string) => {
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
        return [...filtered, { id: crypto.randomUUID(), role: "assistant", content: assistantText }];
      });
      onAssistantAnswerAppended?.();
    },
    [onAssistantAnswerAppended],
  );

  const sendChatbot = useCallback(
    async (args: { text: string; persona: string | null }) => {
      const { text, persona } = args;
      const { ackLoadingId } = appendUserWithAck(text);
      try {
        const reply = await chatbotReply(
          text,
          persona,
          messages.map((m) => ({ role: m.role, content: m.content })),
        );
        await replaceAckWithAssistant(reply, ackLoadingId);
        const convId = conversationId;
        if (convId) await saveMessage(convId, "assistant", reply);
      } catch (err: unknown) {
        await delay(ACK_BEFORE_SLIDE_MS);
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
          return [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to get response"}`,
            },
          ];
        });
      }
    },
    [appendUserWithAck, messages, replaceAckWithAssistant, conversationId],
  );

  return {
    messages,
    setMessages,
    conversationId,
    setConversationId,
    ensureConversation,
    appendUserWithAck,
    replaceAckWithAssistant,
    sendChatbot,
    mountedRef,
  } as const;
}

export default useChatConversation;
