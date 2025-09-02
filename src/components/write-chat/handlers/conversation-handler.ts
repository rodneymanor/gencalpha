import { type ChatMessage } from "@/components/write-chat/types";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import { 
  createConversation, 
  saveMessage as saveMessageToDb, 
  generateTitle, 
  loadConversation 
} from "@/components/write-chat/services/chat-service";

export interface ConversationHandlerConfig {
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setConversationTitle: React.Dispatch<React.SetStateAction<string | null>>;
  setIsFirstResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onHeroExpansion: () => void;
}

export interface LoadedConversation {
  id: string;
  title: string | null;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  persona: string | null;
}

export function createConversationHandler(config: ConversationHandlerConfig) {
  const {
    setConversationId,
    setConversationTitle,
    setIsFirstResponse,
    setMessages,
    onHeroExpansion,
  } = config;

  // Ensure conversation exists and persist the user's message
  const ensureConversationAndSaveUserMessage = async (
    userInput: string,
    selectedPersona: PersonaOption | null,
    conversationId: string | null,
    initialPrompt?: string
  ): Promise<string | null> => {
    try {
      let convIdLocal = conversationId;
      if (!convIdLocal) {
        const createdId = await createConversation(selectedPersona?.name ?? "Default", initialPrompt ?? undefined);
        if (createdId) {
          convIdLocal = createdId;
          setConversationId(createdId);
        }
      }
      if (!convIdLocal) return null;
      await saveMessageToDb(convIdLocal, "user", userInput);
      return convIdLocal;
    } catch (error) {
      console.warn("⚠️ [ConversationHandler] Failed to ensure conversation or save user message:", error);
      return null;
    }
  };

  // Handle loading a saved conversation
  const handleLoadConversation = (conversation: LoadedConversation) => {
    // Set conversation state
    setConversationId(conversation.id);
    setConversationTitle(conversation.title);
    setIsFirstResponse(false); // Already has messages, so not first response

    // Load messages into chat
    const chatMessages: ChatMessage[] = conversation.messages.map((msg) => ({
      id: crypto.randomUUID(),
      role: msg.role,
      content: msg.content,
    }));
    setMessages(chatMessages);

    // Exit hero state if in it
    onHeroExpansion();

    console.log(
      "✅ [ConversationHandler] Loaded conversation:",
      conversation.id,
      "with",
      conversation.messages.length,
      "messages",
    );
  };

  // Load conversation by ID
  const loadConversationById = async (conversationId: string): Promise<void> => {
    try {
      const conversation = await loadConversation(conversationId);
      if (conversation) {
        handleLoadConversation({
          id: conversation.id,
          title: conversation.title,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: conversation.persona,
        });
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  // Generate conversation title
  const generateConversationTitle = async (
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    isFirstResponse: boolean,
    currentTitle: string | null
  ): Promise<string | null> => {
    if (!isFirstResponse || currentTitle) return null;

    const messagesForTitle = [
      { role: "user" as const, content: userMessage },
      { role: "assistant" as const, content: assistantMessage },
    ];

    try {
      const generatedTitle = await generateTitle(conversationId, messagesForTitle);
      if (generatedTitle) {
        setConversationTitle(generatedTitle);
        setIsFirstResponse(false);
        console.log("✅ [ConversationHandler] Generated title:", generatedTitle);
        return generatedTitle;
      }
    } catch (error) {
      console.warn("⚠️ [ConversationHandler] Failed to generate title:", error);
    }
    
    return null;
  };

  // Save message to database
  const saveMessage = async (
    conversationId: string | null,
    role: "user" | "assistant",
    content: string
  ): Promise<void> => {
    if (!conversationId) {
      console.warn("⚠️ [ConversationHandler] No conversation ID available for saving message");
      return;
    }

    try {
      await saveMessageToDb(conversationId, role, content);
      console.log(`✅ [ConversationHandler] Saved ${role} message to database`);
    } catch (error) {
      console.warn(`⚠️ [ConversationHandler] Failed to save ${role} message:`, error);
    }
  };

  return {
    ensureConversationAndSaveUserMessage,
    handleLoadConversation,
    loadConversationById,
    generateConversationTitle,
    saveMessage,
  };
}
