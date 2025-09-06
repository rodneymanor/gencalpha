import { ACK_LOADING, ACK_BEFORE_SLIDE_MS, SLIDE_DURATION_MS } from "@/components/write-chat/constants";
import { CONTENT_ACTIONS } from "@/components/write-chat/persona-selector";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import { generateTitle, saveMessage as saveMessageToDb } from "@/components/write-chat/services/chat-service";
import { type ChatMessage } from "@/components/write-chat/types";
import { delay } from "@/components/write-chat/utils";
import { buildAuthHeaders } from "@/lib/http/auth-headers";

export interface ActionSystemHandlerConfig {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  conversationId: string | null;
  selectedPersona: PersonaOption | null;
  messages: ChatMessage[];
  isFirstResponse: boolean;
  setIsFirstResponse: React.Dispatch<React.SetStateAction<boolean>>;
  conversationTitle: string | null;
  setConversationTitle: React.Dispatch<React.SetStateAction<string | null>>;
  onSend?: (message: string, persona: PersonaOption | null) => void;
}

export function createActionSystemHandler(config: ActionSystemHandlerConfig) {
  const {
    setMessages,
    conversationId,
    selectedPersona,
    messages,
    isFirstResponse,
    setIsFirstResponse,
    conversationTitle,
    setConversationTitle,
    onSend,
  } = config;

  return async function handleActionTrigger(selectedActionKey: string, userInput: string): Promise<void> {
    const actionData = CONTENT_ACTIONS.find((a) => a.key === selectedActionKey);
    if (!actionData) {
      console.warn("⚠️ [ActionSystemHandler] Action not found:", selectedActionKey);
      return;
    }

    const enhancedPrompt = `${actionData.prompt}\n\nTopic/Idea: ${userInput}`;

    // Process as enhanced prompt
    const userMessageId = crypto.randomUUID();
    const ackMessageId = crypto.randomUUID();
    const ackText = `I'll ${actionData.label.toLowerCase()} for "${userInput}".`;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: userInput },
      { id: ackMessageId, role: "assistant", content: ackText },
      { id: crypto.randomUUID(), role: "assistant", content: ACK_LOADING },
    ]);

    onSend?.(enhancedPrompt, selectedPersona);

    // Process the enhanced prompt through the chatbot API
    try {
      const authHeaders = await buildAuthHeaders();
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          message: enhancedPrompt,
          assistant: selectedPersona?.name ?? "Default",
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.response ?? "I'm sorry, I didn't receive a proper response.";

      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);

      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.content !== ACK_LOADING);
        const next: ChatMessage[] = [
          ...filtered,
          { id: crypto.randomUUID(), role: "assistant", content: assistantText },
        ];
        return next;
      });

      // Persist assistant message and generate title on first response
      try {
        const convId = conversationId;
        if (!convId) {
          console.warn("⚠️ [ActionSystemHandler] No conversation id available; skipping assistant message persistence");
          return;
        }

        await saveMessageToDb(convId, "assistant", assistantText);

        if (isFirstResponse && !conversationTitle) {
          const messagesForTitle = [
            { role: "user" as const, content: userInput },
            { role: "assistant" as const, content: assistantText },
          ];
          const generatedTitle = await generateTitle(convId, messagesForTitle);
          if (generatedTitle) {
            setConversationTitle(generatedTitle);
            setIsFirstResponse(false);
            console.log("✅ [ActionSystemHandler] Generated title:", generatedTitle);
          }
        }
      } catch (e) {
        console.warn("⚠️ [ActionSystemHandler] Failed to persist assistant message or generate title:", e);
      }
    } catch (err: unknown) {
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);

      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.content !== ACK_LOADING);
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
  };
}
