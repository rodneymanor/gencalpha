/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";
//
import { useEffect, useRef, useState, useCallback } from "react";

//
// icons moved to presentational components

import { type PersonaType } from "@/components/chatbot/persona-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ACK_BEFORE_SLIDE_MS,
  SLIDE_DURATION_MS,
  ACK_LOADING,
  VIDEO_ACTIONS,
  EMULATE_INPUT,
} from "@/components/write-chat/constants";
import { useInlineVideoActions } from "@/components/write-chat/hooks/use-inline-video-actions";
import { useUrlDetection } from "@/components/write-chat/hooks/use-url-detection";
import { useVoiceRecorder } from "@/components/write-chat/hooks/use-voice-recorder";
import { MessageList } from "@/components/write-chat/messages/message-list";
import { FixedChatInput } from "@/components/write-chat/presentation/fixed-chat-input";
import { HeroSection } from "@/components/write-chat/presentation/hero-section";
import { useSmoothMessageManager } from "@/components/write-chat/smooth-message-manager";
import { type ChatMessage } from "@/components/write-chat/types";
import { sendToSlideout, delay } from "@/components/write-chat/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { buildAuthHeaders } from "@/lib/http/auth-headers";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";

// primitives moved to a separate file to reduce linter max-lines and improve reuse
type ClaudeChatProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string, persona: PersonaType) => void;
  onAnswerReady?: () => void;
  onHeroStateChange?: (isHero: boolean) => void;
  initialPrompt?: string;
  initialPersona?: PersonaType;
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  onAnswerReady,
  onHeroStateChange,
  initialPrompt,
  initialPersona,
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
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(initialPersona ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  // URL detection & validation
  const { linkDetection, urlCandidate, urlSupported, isUrlProcessing, hasValidVideoUrl, detectManually } =
    useUrlDetection(inputValue);
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

  // Inline video action selection state
  const [videoPanel, setVideoPanel] = useState<{ url: string; platform: "instagram" | "tiktok" } | null>(null);
  const {
    activeAction,
    awaitingEmulateInput,
    emulateIdea,
    setEmulateIdea,
    handleTranscribe,
    handleAnalyze,
    handleEmulateStart,
    handleEmulateSubmit,
    handleIdeas,
    handleHooks,
  } = useInlineVideoActions({ setMessages, onAnswerReady });

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
    setSelectedPersona(initialPersona ?? null);
  }, [initialPrompt, initialPersona]);

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

  // Personas list no longer needed here; PersonaSelector renders from internal source
  const resolvedName = userProfile?.displayName ?? user?.displayName;

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
      const hasScriptIntent = Boolean(
        lower.match(/\bwrite\s+(?:a\s+)?script\b/i) ??
          lower.match(/\bscript\b/i) ??
          lower.match(/^\s*\/script\b/i) ??
          lower.match(/generate\s+script/i),
      );
      if (hasScriptIntent) {
        // Try to extract the topic from common patterns
        const topicAboutMatch = text.match(/\b(?:about|on)\s+([^.!?\n\r]{3,})/i);
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
        const safeTopic = topic ?? "your idea";
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

    // If a valid social video URL is present, transition to chat and show inline action options
    if (hasValidVideoUrl && urlCandidate && urlSupported) {
      setIsHeroState(false);
      // Append the user message for context
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed },
        { id: crypto.randomUUID(), role: "assistant", content: "Choose an action to process this video:" },
        { id: crypto.randomUUID(), role: "assistant", content: VIDEO_ACTIONS },
      ]);
      setVideoPanel({ url: urlCandidate, platform: urlSupported });
      setInputValue("");
      return;
    }

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

    // URL detection (for potential future embed/preview behavior)
    detectManually(trimmed);

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
    onSend?.(trimmed, selectedPersona ?? "MiniBuddy");
    // Persist user message
    (async () => {
      try {
        const headers = await buildAuthHeaders();
        let convId: string | null = conversationId;
        if (!convId) {
          const res = await fetch("/api/chat/conversations", {
            method: "POST",
            headers,
            body: JSON.stringify({ persona: selectedPersona ?? "MiniBuddy", initialPrompt: initialPrompt ?? null }),
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

    // If no persona selected, treat the input as a script idea and run Speed Write
    if (!selectedPersona) {
      try {
        const res = await generateScript(trimmed, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
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
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
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
          persona: selectedPersona,
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

  // Inline emulate prompt message injection
  const handleInlineEmulateStart = () => {
    handleEmulateStart();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: EMULATE_INPUT }]);
  };

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
          linkDetection={linkDetection}
          hasValidVideoUrl={hasValidVideoUrl}
          handleSend={handleSend}
          heroInputRef={heroInputRef}
                  selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
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
              videoPanel={videoPanel}
              activeAction={activeAction}
              awaitingEmulateInput={awaitingEmulateInput}
              emulateIdea={emulateIdea}
              onEmulateIdeaChange={setEmulateIdea}
              onTranscribe={() => handleTranscribe(videoPanel)}
              onAnalyze={() => handleAnalyze(videoPanel)}
              onEmulateStart={handleInlineEmulateStart}
              onEmulateSubmit={() => handleEmulateSubmit(videoPanel)}
              onIdeas={() => handleIdeas(videoPanel)}
              onHooks={() => handleHooks(videoPanel)}
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
