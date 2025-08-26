/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";
//
import { useEffect, useRef, useState, useCallback } from "react";

//
// icons moved to presentational components


import { ScrollArea } from "@/components/ui/scroll-area";
import { ACK_BEFORE_SLIDE_MS, SLIDE_DURATION_MS, ACK_LOADING } from "@/components/write-chat/constants";
import { useInlineVideoActions } from "@/components/write-chat/hooks/use-inline-video-actions";
import { useVideoActionState, type VideoAction } from "@/components/write-chat/hooks/use-video-action-state";
import { useVoiceRecorder } from "@/components/write-chat/hooks/use-voice-recorder";
import { MessageList } from "@/components/write-chat/messages/message-list";
import { type AssistantType } from "@/components/write-chat/persona-selector";
import { FixedChatInput } from "@/components/write-chat/presentation/fixed-chat-input";
import { HeroSection } from "@/components/write-chat/presentation/hero-section";
import {
  generateTitle,
  createConversation,
  saveMessage as saveMessageToDb,
  loadConversation,
} from "@/components/write-chat/services/chat-service";
import { useSmoothMessageManager } from "@/components/write-chat/smooth-message-manager";
import { type ChatMessage } from "@/components/write-chat/types";
import { sendScriptToSlideout, delay } from "@/components/write-chat/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";
import { useLightweightUrlDetection, type LightweightDetectionResult } from "@/hooks/use-lightweight-url-detection";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { buildAuthHeaders } from "@/lib/http/auth-headers";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";
import { detectSocialUrl } from "@/lib/utils/lightweight-url-detector";
import { type DetectionResult } from "@/lib/utils/social-link-detector";
import { ScriptData, ScriptComponent } from "@/types/script-panel";

// Helper function to convert LightweightDetectionResult to legacy DetectionResult format
function convertDetectionResult(lightweight: LightweightDetectionResult): DetectionResult | null {
  if (!lightweight.isValid || !lightweight.platform || !lightweight.url) {
    return null;
  }

  const extracted: { username?: string; postId?: string; contentType?: string } = {};

  if (lightweight.platform === "instagram") {
    if (lightweight.contentType === "reel") {
      extracted.contentType = "reel";
    } else if (lightweight.contentType === "post") {
      extracted.contentType = "post";
    } else if (lightweight.contentType === "profile") {
      extracted.contentType = "profile";
    }

    // Extract post ID from Instagram URL
    const postMatch = lightweight.url.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (postMatch) {
      extracted.postId = postMatch[1];
    }

    // Extract username from profile URLs
    const profileMatch = lightweight.url.match(/instagram\.com\/([A-Za-z0-9_.-]+)\/?$/);
    if (profileMatch && lightweight.contentType === "profile") {
      extracted.username = profileMatch[1];
    }
  } else if (lightweight.platform === "tiktok") {
    if (lightweight.contentType === "video") {
      extracted.contentType = "video";
    } else if (lightweight.contentType === "profile") {
      extracted.contentType = "profile";
    }

    // Extract username and video ID from TikTok URL
    const videoMatch = lightweight.url.match(/@([A-Za-z0-9_.]+)\/video\/(\d+)/);
    if (videoMatch) {
      extracted.username = videoMatch[1];
      extracted.postId = videoMatch[2];
    }

    // Extract username from profile URLs
    const profileMatch = lightweight.url.match(/@([A-Za-z0-9_.]+)\/?$/);
    if (profileMatch) {
      extracted.username = profileMatch[1];
    }
  }

  return {
    type: lightweight.platform,
    url: lightweight.url,
    extracted,
  };
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

// primitives moved to a separate file to reduce linter max-lines and improve reuse
type ClaudeChatProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string, assistant: AssistantType) => void;
  onAnswerReady?: () => void;
  onHeroStateChange?: (isHero: boolean) => void;
  initialPrompt?: string;
  initialAssistant?: AssistantType;
  conversationIdToLoad?: string | null;
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  onAnswerReady,
  onHeroStateChange,
  initialPrompt,
  initialAssistant,
  conversationIdToLoad,
}: ClaudeChatProps) {
  // Chat renders conversational text; structured results (scripts, analysis, hooks) are sent to the
  // BlockNote slideout via a global event. The slideout listens for `write:editor-set-content` and
  // replaces its content, opening automatically. This keeps the chat thread clean while preserving
  // a rich, editable surface for AI deliverables.
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  const [isHeroState, setIsHeroState] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Processing UI is represented via ACK_LOADING messages
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType | null>(initialAssistant ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(true);
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<{ url: string; platform: "instagram" | "tiktok" } | null>(
    null,
  );
  // Replace old state management with atomic video action state
  const videoActionState = useVideoActionState();
  const mountedRef = useRef(true);
  // URL detection & validation
  const { detection, isProcessing: isUrlProcessing } = useLightweightUrlDetection(inputValue);

  // Convert lightweight detection to legacy format for HeroSection compatibility
  const linkDetection = convertDetectionResult(detection);
  const hasValidVideoUrl = detection.isValid && (detection.platform === "instagram" || detection.platform === "tiktok");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const heroInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { user, userProfile } = useAuth();
  const { generateScript } = useScriptGeneration();

  // Enhanced smooth message manager
  const smoothMessageManager = useSmoothMessageManager(mountedRef, {
    staggerDelay: 50,
    animationDuration: 300,
    scrollBehavior: "smooth",
    enableIntersectionObserver: true,
  });

  const { handleTranscribe, handleIdeas, handleHooks } = useInlineVideoActions({
    setMessages,
    onAnswerReady,
  });

  // Add transition state for FLIP animation
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle hero to chat expansion with transform
  const handleHeroExpansion = useCallback(() => {
    if (!isHeroState || isTransitioning) return;
    setIsTransitioning(true);
    setIsHeroState(false);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Match CSS transition duration
  }, [isHeroState, isTransitioning]);


  // Handle loading a saved conversation
  const handleLoadChat = useCallback(
    (conversation: {
      id: string;
      title: string | null;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      persona: string | null;
    }) => {
      // Set conversation state
      setConversationId(conversation.id);
      setConversationTitle(conversation.title);
      setIsFirstResponse(false); // Already has messages, so not first response

      // Set assistant if available
      if (conversation.persona) {
        setSelectedAssistant(conversation.persona as AssistantType);
      }

      // Load messages into chat
      const chatMessages: ChatMessage[] = conversation.messages.map((msg) => ({
        id: crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
      }));
      setMessages(chatMessages);

      // Exit hero state if in it
      if (isHeroState) {
        handleHeroExpansion();
      }

      console.log(
        "✅ [ClaudeChat] Loaded conversation:",
        conversation.id,
        "with",
        conversation.messages.length,
        "messages",
      );
    },
    [isHeroState, handleHeroExpansion],
  );

  // Handler to bridge video action selector to inline video actions with atomic state management
  const handleVideoAction = useCallback(
    (action: VideoAction) => {
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

      // Clear the pending video URL since we're processing it now
      setPendingVideoUrl(null);

      // Execute the action and handle completion with database persistence
      const executeAction = async () => {
        console.log("🚀 [executeAction] Starting execution for:", action);
        
        // Ensure conversation exists and save the assistant's action message
        let convId = conversationId;
        if (!convId) {
          try {
            convId = await createConversation(selectedAssistant ?? "MiniBuddy", initialPrompt ?? undefined);
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

        try {
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
          if (convId) {
            try {
              await saveMessageToDb(convId, "assistant", errorMessage);
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

      // Execute asynchronously but don't block
      executeAction();
    },
    [pendingVideoUrl, videoActionState.actions, handleTranscribe, handleIdeas, handleHooks, setMessages, 
     conversationId, selectedAssistant, initialPrompt, isFirstResponse, conversationTitle],
  );

  // Voice recording
  const { isRecording, toggle: toggleRecording } = useVoiceRecorder({ onTranscription: setInputValue });
  const [showListening, setShowListening] = useState(true);

  // Ensure a conversation exists and persist the user's message before proceeding
  const ensureConversationAndSaveUserMessage = async (userInput: string): Promise<string | null> => {
    try {
      let convIdLocal = conversationId;
      if (!convIdLocal) {
        const createdId = await createConversation(selectedAssistant ?? "MiniBuddy", initialPrompt ?? undefined);
        if (createdId) {
          convIdLocal = createdId;
          setConversationId(createdId);
        }
      }
      if (!convIdLocal) return null;
      await saveMessageToDb(convIdLocal, "user", userInput);
      return convIdLocal;
    } catch (error) {
      console.warn("⚠️ [ClaudeChat] Failed to ensure conversation or save user message:", error);
      return null;
    }
  };

  // Helper function to generate title after script generation
  const generateTitleForScript = async (userInput: string, scriptHook: string, convIdOverride?: string) => {
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
        console.log("✅ [ClaudeChat] Generated title for script:", generatedTitle);
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
        console.warn("⚠️ [ClaudeChat] Failed to persist script indicator message:", e);
      }
    }
  };

  // Enhanced smooth scrolling with message manager
  useEffect(() => {
    if (messagesContainerRef.current) {
      smoothMessageManager.setContainer(messagesContainerRef.current);
    }
  }, [smoothMessageManager]);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    // Use the smooth message manager for intelligent scrolling
    smoothMessageManager.scrollToBottom();
  }, [messages, smoothMessageManager]);

  // Prefetch ideas on mount to keep the menu snappy
  useEffect(() => {
    mountedRef.current = true;
    clientNotesService
      .getIdeaInboxNotes()
      .then((res) => {
        // Set immediately; in-flight cleanup will prevent later updates
        setIdeas(res.notes ?? []);
      })
      .catch(() => void 0);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize from props
  useEffect(() => {
    if (initialPrompt) setInputValue(initialPrompt);
    setSelectedAssistant(initialAssistant ?? null);
  }, [initialPrompt, initialAssistant]);

  // Load conversation if ID provided
  useEffect(() => {
    if (conversationIdToLoad) {
      const loadChat = async () => {
        try {
          const conversation = await loadConversation(conversationIdToLoad);
          if (conversation) {
            handleLoadChat({
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
      loadChat();
    }
  }, [conversationIdToLoad, handleLoadChat]);

  // Notify parent when hero state changes
  useEffect(() => {
    if (onHeroStateChange) {
      onHeroStateChange(isHeroState);
    }
  }, [isHeroState, onHeroStateChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textareaEl = isHeroState ? heroInputRef.current : textareaRef.current;
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
    }
  }, [inputValue, isHeroState]);

  // Blinking "listening" label when recording
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording) {
      interval = setInterval(() => setShowListening((prev) => !prev), 800);
    } else {
      setShowListening(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // hasValidVideoUrl provided by useUrlDetection

  // Assistants list no longer needed here; AssistantSelector renders from internal source
  const resolvedName = userProfile?.displayName ?? user?.displayName ?? null;

  const handleSend = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Trigger hero expansion if in hero state
    if (isHeroState) {
      handleHeroExpansion();
    }

    // Helper: create a short acknowledgement message describing the task.
    // This gives immediate feedback and sets expectations while we "think".
    const createAcknowledgementFor = (text: string): string => {
      const lower = text.toLowerCase();

      // 1) Script intent has top priority (even if the text also mentions "ideas")
      const hasScriptIntent =
        /\bwrite\s+(?:a\s+)?script\b/i.test(lower) ||
        /\bscript\b/i.test(lower) ||
        /^\s*\/script\b/i.test(lower) ||
        /generate\s+script/i.test(lower);
      if (hasScriptIntent) {
        // Try to extract the topic from common patterns
        // Safe regex for topic extraction

        const topicAboutMatch = /\b(?:about|on)\s+([^.!?\n\r]{3,})/i.exec(text);
        const topicFromAbout = topicAboutMatch ? topicAboutMatch[1].trim() : undefined;
        const topic = topicFromAbout
          ? topicFromAbout.split(/\s+/).slice(0, 10).join(" ")
          : text
              .replace(/^\s*\/script\s+/i, "")

              .replace(/^(generate\s+script\s*:?)\s*/i, "")
              .replace(/\bwrite\s+(a\s+)?script\b/i, "")
              .replace(/\bscript\b/i, "")
              .trim()
              .split(/\s+/)
              .slice(0, 10)
              .join(" ");
        const safeTopic = topic || "your idea";
        return `I'll help you write a script about ${safeTopic}.`;
      }

      // 2) Hooks
      if (/(^|\s)#?hooks?\b/.test(lower)) {
        return "I'll help you write 20 hooks.";
      }

      // 3) Analysis
      if (/analys(is|e)|\breport\b/.test(lower)) {
        return "I'll help you generate an analysis report.";
      }

      // 4) Ideas (lowest priority among the above)
      if (/\bideas?\b/.test(lower)) {
        return "I'll help you create 10 content ideas.";
      }

      return "I'll help you with that.";
    };

    // Timing utilities and constants imported from helpers

    // URL detection happens automatically via useLightweightUrlDetection hook

    // Idea Inbox submission from hero input when Idea Mode is active
    if (isHeroState && isIdeaMode) {
      try {
        const firstLine = trimmed.split("\n")[0]?.trim() ?? "Untitled";
        const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine || "Untitled";
        await clientNotesService.createNote({
          title,
          content: trimmed,
          type: "idea_inbox",
          source: "manual",
          starred: false,
        });
        setIdeaSaveMessage("Saved to Idea Inbox");
        setTimeout(() => setIdeaSaveMessage(null), 3000);
        setInputValue("");
        return; // do not transition to chat state
      } catch {
        setIdeaSaveMessage("Failed to save idea");
        setTimeout(() => setIdeaSaveMessage(null), 4000);
        return;
      }
    }

    // Check if this is a video URL submission that needs action selection
    const currentDetection = detectSocialUrl(trimmed);
    const isVideoUrlSubmission =
      currentDetection.isValid && (currentDetection.platform === "instagram" || currentDetection.platform === "tiktok");

    // 1) Push user message immediately
    const userMessageId = crypto.randomUUID();

    if (isVideoUrlSubmission) {
      // Store the video URL for later use when action is selected
      setPendingVideoUrl({
        url: currentDetection.url!,
        platform: currentDetection.platform!,
      });

      // For video URLs, add acknowledgment and show action cards instead of processing immediately
      const ackMessageId = crypto.randomUUID();
      const videoActionsId = crypto.randomUUID();
      const ackMessage = "I found a video! What would you like me to do with it?";
      
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content: trimmed },
        { id: ackMessageId, role: "assistant", content: ackMessage },
        { id: videoActionsId, role: "assistant", content: "<video-actions>" },
      ]);
      
      // Save the video URL submission to the database
      (async () => {
        try {
          // Ensure conversation exists
          let convId = conversationId;
          if (!convId) {
            convId = await createConversation(selectedAssistant ?? "MiniBuddy", initialPrompt ?? undefined);
            if (convId) {
              setConversationId(convId);
              console.log("✅ [handleSend] Created conversation for video URL:", convId);
            }
          }
          
          if (convId) {
            // Save user message (video URL)
            await saveMessageToDb(convId, "user", trimmed);
            // Save assistant acknowledgment
            await saveMessageToDb(convId, "assistant", ackMessage);
            console.log("✅ [handleSend] Saved video URL submission to database");
            
            // Generate title if this is the first response
            if (isFirstResponse && !conversationTitle) {
              const messagesForTitle = [
                { role: "user" as const, content: trimmed },
                { role: "assistant" as const, content: ackMessage },
              ];
              const generatedTitle = await generateTitle(convId, messagesForTitle);
              if (generatedTitle) {
                setConversationTitle(generatedTitle);
                setIsFirstResponse(false);
                console.log("✅ [handleSend] Generated title for video URL:", generatedTitle);
              }
            }
          }
        } catch (error) {
          console.warn("⚠️ [handleSend] Failed to save video URL submission:", error);
        }
      })();
    } else {
      // Regular flow for non-video content
      const ackMessageId = crypto.randomUUID();
      const ackText = createAcknowledgementFor(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content: trimmed },
        { id: ackMessageId, role: "assistant", content: ackText },
        // 2.1) Small loading indicator placeholder shown during analysis phase
        { id: crypto.randomUUID(), role: "assistant", content: ACK_LOADING },
      ]);
    }
    setInputValue("");
    setIsHeroState(false);
    onSend?.(trimmed, selectedAssistant ?? "MiniBuddy");

    // If this is a video URL submission, stop here and wait for user to select an action
    if (isVideoUrlSubmission) {
      return;
    }
    // Determine if this input will trigger the script flow
    const lower = trimmed.toLowerCase();
    const isScriptCommand = lower.startsWith("/script ") || lower.includes("generate script");
    const shouldUseScriptFlow = !selectedAssistant || isScriptCommand;

    // Persist user message only for non-script flows; script flows handle it synchronously
    if (!shouldUseScriptFlow) {
      (async () => {
        try {
          const headers = await buildAuthHeaders();
          let convId: string | null = conversationId;
          if (!convId) {
            const res = await fetch("/api/chat/conversations", {
              method: "POST",
              headers,
              body: JSON.stringify({
                assistant: selectedAssistant ?? "MiniBuddy",
                initialPrompt: initialPrompt ?? null,
              }),
            });
            if (res.ok) {
              const json = (await res.json()) as { success: boolean; conversationId?: string };
              if (json.success && json.conversationId) {
                convId = json.conversationId;
                setConversationId(json.conversationId);
              }
            }
          }
          if (!convId) {
            console.warn("⚠️ [ClaudeChat] No conversation id available; skipping message persistence");
            return;
          }
          await saveMessageToDb(convId, "user", trimmed);
        } catch (e) {
          console.warn("⚠️ [ClaudeChat] Failed to persist user message:", e);
        }
      })();
    }

    // Helper: route structured content to slideout BlockNote editor

    // If no assistant selected, treat the input as a script idea and run Speed Write
    if (!selectedAssistant) {
      try {
        const ensuredConvId = await ensureConversationAndSaveUserMessage(trimmed);
        const res = await generateScript(trimmed, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const scriptData = convertToScriptData(res.script, trimmed);
          sendScriptToSlideout(scriptData, "Generated Script");
          onAnswerReady?.();

          // Generate title for the conversation after successful script generation
          await generateTitleForScript(trimmed, res.script.hook, ensuredConvId ?? undefined);

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
      return;
    }

    // Script command detection
    if (isScriptCommand) {
      const idea = trimmed.replace(/^\s*\/script\s+/i, "").replace(/^(generate script\s*:?)\s*/i, "");

      try {
        const ensuredConvId = await ensureConversationAndSaveUserMessage(trimmed);
        const res = await generateScript(idea, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const scriptData = convertToScriptData(res.script, idea);
          sendScriptToSlideout(scriptData, "Generated Script");
          onAnswerReady?.();

          // Generate title for the conversation after successful script generation
          await generateTitleForScript(trimmed, res.script.hook, ensuredConvId ?? undefined);

          await delay(SLIDE_DURATION_MS);
          await addScriptIndicatorMessage(ensuredConvId);
          return;
        }
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
        return;
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
        return;
      }
    }

    try {
      const authHeaders = await buildAuthHeaders();
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          message: trimmed,
          assistant: selectedAssistant,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `HTTP error ${response.status}`);
      }
      const data = await response.json();
      const assistantText = data.response ?? "I'm sorry, I didn't receive a proper response.";
      // Stage timing: ack -> (1.5s) -> slideout -> (slide duration) -> show answer
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
      (async () => {
        try {
          const convId = conversationId;
          if (!convId) {
            console.warn("⚠️ [ClaudeChat] No conversation id available; skipping assistant message persistence");
            return;
          }

          // Save assistant message
          await saveMessageToDb(convId, "assistant", assistantText);

          // Generate title on first AI response
          if (isFirstResponse && !conversationTitle) {
            const messagesForTitle = [
              { role: "user" as const, content: trimmed },
              { role: "assistant" as const, content: assistantText },
            ];
            const generatedTitle = await generateTitle(convId, messagesForTitle);
            if (generatedTitle) {
              setConversationTitle(generatedTitle);
              setIsFirstResponse(false);
              console.log("✅ [ClaudeChat] Generated title:", generatedTitle);
            }
          }
        } catch (e) {
          console.warn("⚠️ [ClaudeChat] Failed to persist assistant message or generate title:", e);
        }
      })();
    } catch (err: unknown) {
      // Stage timing on error as well
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

  // Helpers for inline actions are imported

  return (
    <div
      className={`claude-chat-container ${isHeroState ? "hero-state" : "expanded"} ${
        isTransitioning ? "transitioning" : ""
      } ${className}`}
    >
      {/* Hero Content - always rendered but positioned */}
      <div className={`hero-content ${!isHeroState ? "hero-hidden" : ""}`}>
        <HeroSection
          resolvedName={resolvedName}
          inputValue={inputValue}
          setInputValue={setInputValue}
          placeholder={isRecording ? (showListening ? "listening..." : "") : placeholder}
          isRecording={isRecording}
          showListening={showListening}
          isUrlProcessing={isUrlProcessing}
          linkDetection={linkDetection}
          hasValidVideoUrl={hasValidVideoUrl}
          handleSend={handleSend}
          heroInputRef={heroInputRef}
          selectedAssistant={selectedAssistant}
          setSelectedAssistant={setSelectedAssistant}
          isIdeaMode={isIdeaMode}
          setIsIdeaMode={setIsIdeaMode}
          ideaSaveMessage={ideaSaveMessage}
          ideas={ideas}
          ideasOpen={ideasOpen}
          setIdeasOpen={setIdeasOpen}
          isIdeaInboxEnabled={isIdeaInboxEnabled}
          onVoiceClick={toggleRecording}
        />
      </div>

      {/* Chat Messages Area - always rendered but positioned */}
      <div className="chat-messages-area">
        <div className="messages-container relative flex h-screen flex-col transition-all duration-300">
          {/* Chat Header - shown when not in hero state */}
          {!isHeroState && (
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="flex flex-col">
                <h2 className="text-sm font-medium text-neutral-900">{conversationTitle ?? "New Chat"}</h2>
                {conversationTitle && <p className="text-xs text-neutral-600">{messages.length} messages</p>}
              </div>
            </div>
          )}
          {/* Messages Area with bottom padding for sticky input */}
          <ScrollArea className="messages-list flex-1 px-4 pb-24" ref={messagesContainerRef}>
            <MessageList
              messages={messages}
              resolvedName={resolvedName ?? null}
              videoPanel={null}
              activeAction={videoActionState.state.activeAction}
              onVideoAction={handleVideoAction}
              messagesEndRef={messagesEndRef}
              isProcessingVideoAction={videoActionState.isProcessing}
            />
          </ScrollArea>

          {/* Minimal Fixed Chat Input */}
          <FixedChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={() => handleSend(inputValue)}
            textareaRef={textareaRef}
          />
        </div>
      </div>
      {/* Inline actions replace the modal; no modal rendering here */}
    </div>
  );
}

export default ClaudeChat;
