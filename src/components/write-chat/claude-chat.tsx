/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";
//
import { useEffect, useRef, useState, useCallback } from "react";

//
// icons moved to presentational components

import { type AssistantType } from "@/components/chatbot/persona-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ACK_BEFORE_SLIDE_MS, SLIDE_DURATION_MS, ACK_LOADING } from "@/components/write-chat/constants";
import { useInlineVideoActions } from "@/components/write-chat/hooks/use-inline-video-actions";
import { useVoiceRecorder } from "@/components/write-chat/hooks/use-voice-recorder";
import { MessageList } from "@/components/write-chat/messages/message-list";
import { FixedChatInput } from "@/components/write-chat/presentation/fixed-chat-input";
import { HeroSection } from "@/components/write-chat/presentation/hero-section";
import { useSmoothMessageManager } from "@/components/write-chat/smooth-message-manager";
import { type ChatMessage } from "@/components/write-chat/types";
import { sendToSlideout, sendScriptToSlideout, delay } from "@/components/write-chat/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";
import { useLightweightUrlDetection } from "@/hooks/use-lightweight-url-detection";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { buildAuthHeaders } from "@/lib/http/auth-headers";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";
import { ScriptData, ScriptComponent } from "@/types/script-panel";

// Helper function to convert GeneratedScript to ScriptData format
function convertToScriptData(script: { hook: string; bridge: string; goldenNugget: string; wta: string }, originalIdea: string): ScriptData {
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
  const totalWords = processedComponents.reduce((sum, comp) => sum + (comp.wordCount || 0), 0);
  const totalDuration = processedComponents.reduce((sum, comp) => sum + (comp.estimatedDuration || 0), 0);

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
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  onAnswerReady,
  onHeroStateChange,
  initialPrompt,
  initialAssistant,
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
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  // URL detection & validation
  const { detection, isProcessing: isUrlProcessing } = useLightweightUrlDetection(inputValue);

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

  const { activeAction, handleTranscribe, handleIdeas, handleHooks } = useInlineVideoActions({
    setMessages,
    onAnswerReady,
  });

  // Voice recording
  const { isRecording, toggle: toggleRecording } = useVoiceRecorder({ onTranscription: setInputValue });
  const [showListening, setShowListening] = useState(true);

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

    // URL detection happens automatically via useLightweightUrlDetection hook

    // 1) Push user message immediately
    const userMessageId = crypto.randomUUID();
    // 2) Push acknowledgement message immediately below user message
    const ackMessageId = crypto.randomUUID();
    const ackLoadingId = crypto.randomUUID();
    const ackText = createAcknowledgementFor(trimmed);
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: trimmed },
      { id: ackMessageId, role: "assistant", content: ackText },
      // 2.1) Small loading indicator placeholder shown during analysis phase
      { id: ackLoadingId, role: "assistant", content: ACK_LOADING },
    ]);
    setInputValue("");
    setIsHeroState(false);
    onSend?.(trimmed, selectedAssistant ?? "MiniBuddy");
    // Persist user message
    (async () => {
      try {
        const headers = await buildAuthHeaders();
        let convId: string | null = conversationId;
        if (!convId) {
          const res = await fetch("/api/chat/conversations", {
            method: "POST",
            headers,
            body: JSON.stringify({ assistant: selectedAssistant ?? "MiniBuddy", initialPrompt: initialPrompt ?? null }),
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
        await fetch(`/api/chat/conversations/${convId}/messages`, {
          method: "POST",
          headers,
          body: JSON.stringify({ role: "user", content: trimmed }),
        });
      } catch (e) {
        console.warn("⚠️ [ClaudeChat] Failed to persist user message:", e);
      }
    })();

    // Helper: route structured content to slideout BlockNote editor

    // If no assistant selected, treat the input as a script idea and run Speed Write
    if (!selectedAssistant) {
      try {
        const res = await generateScript(trimmed, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const scriptData = convertToScriptData(res.script, trimmed);
          sendScriptToSlideout(scriptData, "Generated Script");
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          // Remove loader only; do not append structured answer to chat
          setMessages((prev): ChatMessage[] => prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING));
        } else {
          // Keep error in chat; do not open slideout
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] => {
            const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
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
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
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
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("/script ") || lower.includes("generate script")) {
      const idea = trimmed.replace(/^\s*\/script\s+/i, "").replace(/^(generate script\s*:?)\s*/i, "");

      try {
        const res = await generateScript(idea, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const scriptData = convertToScriptData(res.script, idea);
          sendScriptToSlideout(scriptData, "Generated Script");
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] => prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING));
          return;
        }
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
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
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
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
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
        const next: ChatMessage[] = [
          ...filtered,
          { id: crypto.randomUUID(), role: "assistant", content: assistantText },
        ];
        return next;
      });
      // Persist assistant message (best-effort)
      (async () => {
        try {
          const headers = await buildAuthHeaders();
          const convId = conversationId;
          if (!convId) {
            console.warn("⚠️ [ClaudeChat] No conversation id available; skipping assistant message persistence");
            return;
          }
          await fetch(`/api/chat/conversations/${convId}/messages`, {
            method: "POST",
            headers,
            body: JSON.stringify({ role: "assistant", content: assistantText }),
          });
        } catch (e) {
          console.warn("⚠️ [ClaudeChat] Failed to persist assistant message:", e);
        }
      })();
    } catch (err: unknown) {
      // Stage timing on error as well
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
  };

  // Helpers for inline actions are imported

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
          {/* Messages Area with bottom padding for sticky input */}
          <ScrollArea className="messages-list flex-1 px-4 pb-24" ref={messagesContainerRef}>
            <MessageList
              messages={messages}
              resolvedName={resolvedName ?? null}
              videoPanel={null}
              activeAction={activeAction}
              onTranscribe={() => handleTranscribe(null)}
              onIdeas={() => handleIdeas(null)}
              onHooks={() => handleHooks(null)}
              messagesEndRef={messagesEndRef}
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
