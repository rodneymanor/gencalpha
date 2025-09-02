import { type ChatMessage } from "@/components/write-chat/types";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import { ACK_LOADING, ACK_BEFORE_SLIDE_MS, SLIDE_DURATION_MS } from "@/components/write-chat/constants";
import { generateTitle, saveMessage as saveMessageToDb } from "@/components/write-chat/services/chat-service";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { sendScriptToSlideout, delay } from "@/components/write-chat/utils";
import { type ScriptData, type ScriptComponent } from "@/types/script-panel";

export interface ScriptActionHandlerConfig {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  conversationId: string | null;
  selectedPersona: PersonaOption | null;
  isFirstResponse: boolean;
  setIsFirstResponse: React.Dispatch<React.SetStateAction<boolean>>;
  conversationTitle: string | null;
  setConversationTitle: React.Dispatch<React.SetStateAction<string | null>>;
  onAnswerReady?: () => void;
}

// Helper function to convert GeneratedScript to ScriptData format
function convertToScriptData(
  script: { hook: string; bridge: string; goldenNugget: string; wta: string },
  originalIdea: string,
): ScriptData {
  // Create full script text
  const fullScript = `Hook: ${script.hook}

Bridge: ${script.bridge}

Golden Nugget: ${script.goldenNugget}

Call to Action: ${script.wta}`;

  // Create script components
  const components: ScriptComponent[] = [
    {
      id: "hook-generated",
      type: "hook",
      label: "Hook",
      content: script.hook,
      icon: "H",
    },
    {
      id: "bridge-generated",
      type: "bridge",
      label: "Bridge",
      content: script.bridge,
      icon: "B",
    },
    {
      id: "nugget-generated",
      type: "nugget",
      label: "Golden Nugget",
      content: script.goldenNugget,
      icon: "G",
    },
    {
      id: "cta-generated",
      type: "cta",
      label: "Call to Action",
      content: script.wta,
      icon: "C",
    },
  ];

  // Process components to add metrics
  const processedComponents = processScriptComponents(components);

  // Calculate total metrics
  const totalWords = processedComponents.reduce((sum, comp) => sum + (comp.wordCount ?? 0), 0);
  const totalDuration = processedComponents.reduce((sum, comp) => sum + (comp.estimatedDuration ?? 0), 0);

  return {
    id: `generated-script-${Date.now()}`,
    title: "Generated Script",
    fullScript,
    components: processedComponents,
    metrics: {
      totalWords,
      totalDuration,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["generated", "script"],
    metadata: {
      originalIdea: originalIdea,
      platform: "general",
      genre: "generated",
    },
  };
}

export function createScriptActionHandler(config: ScriptActionHandlerConfig) {
  const {
    setMessages,
    conversationId,
    selectedPersona,
    isFirstResponse,
    setIsFirstResponse,
    conversationTitle,
    setConversationTitle,
    onAnswerReady,
  } = config;

  const { generateScript } = useScriptGeneration();

  // Helper function to generate title after script generation
  const generateTitleForScript = async (
    userInput: string, 
    scriptHook: string, 
    convIdOverride?: string
  ) => {
    const convIdLocal = convIdOverride ?? conversationId;
    if (!convIdLocal || !isFirstResponse || conversationTitle) return;

    const scriptResponse = `Generated a script with Hook: ${scriptHook.substring(0, 50)}...`;
    const messagesForTitle = [
      { role: "user" as const, content: userInput },
      { role: "assistant" as const, content: scriptResponse },
    ];

    try {
      const generatedTitle = await generateTitle(convIdLocal, messagesForTitle);
      if (generatedTitle) {
        setConversationTitle(generatedTitle);
        setIsFirstResponse(false);
        console.log("✅ [ScriptActionHandler] Generated title for script:", generatedTitle);
      }
    } catch (error) {
      console.warn("Failed to generate title:", error);
    }
  };

  // Helper function to add and persist script indicator message
  const addScriptIndicatorMessage = async (conversationId: string | null) => {
    const scriptIndicatorMessage =
      "✨ Generated a script with Hook, Bridge, Golden Nugget, and Call to Action. The script has been opened in the editor panel for you to review and edit.";

    // Add message to UI
    setMessages((prev): ChatMessage[] => {
      const filtered = prev.filter((m) => m.content !== ACK_LOADING);
      return [
        ...filtered,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: scriptIndicatorMessage,
        },
      ];
    });

    // Persist to database
    if (conversationId) {
      try {
        await saveMessageToDb(conversationId, "assistant", scriptIndicatorMessage);
      } catch (e) {
        console.warn("⚠️ [ScriptActionHandler] Failed to persist script indicator message:", e);
      }
    }
  };

  return async function handleScriptGeneration(
    userInput: string,
    ensuredConvId: string | null
  ): Promise<void> {
    try {
      // Get the persona data if selected
      const personaData = selectedPersona;
      const res = await generateScript(userInput, "60", personaData);
      
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (res.success && res.script) {
        const scriptData = convertToScriptData(res.script, userInput);
        sendScriptToSlideout(scriptData, "Generated Script");
        onAnswerReady?.();

        // Generate title for the conversation after successful script generation
        await generateTitleForScript(userInput, res.script.hook, ensuredConvId ?? undefined);

        await delay(SLIDE_DURATION_MS);
        await addScriptIndicatorMessage(ensuredConvId);
      } else {
        // Keep error in chat; do not open slideout
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.content !== ACK_LOADING);
          const next: ChatMessage[] = [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${res.error ?? "Failed to generate script"}`,
            },
          ];
          return next;
        });
      }
    } catch (err: unknown) {
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.content !== ACK_LOADING);
        const next: ChatMessage[] = [
          ...filtered,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to generate script"}`,
          },
        ];
        return next;
      });
    }
  };
}
