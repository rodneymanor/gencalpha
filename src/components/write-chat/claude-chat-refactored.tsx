"use client";

import { useEffect, useRef, useCallback, useState } from "react";

import { ACK_LOADING } from "@/components/write-chat/constants";
import { createActionSystemHandler } from "@/components/write-chat/handlers/action-system-handler";
import { createConversationHandler } from "@/components/write-chat/handlers/conversation-handler";
import { createScriptActionHandler } from "@/components/write-chat/handlers/script-action-handler";
import { createVideoActionHandler } from "@/components/write-chat/handlers/video-action-handler";
import { useActionSelectionState } from "@/components/write-chat/hooks/use-action-selection-state";
import { useChatState } from "@/components/write-chat/hooks/use-chat-state";
import { useConversationState } from "@/components/write-chat/hooks/use-conversation-state";
import { useIdeaModeState } from "@/components/write-chat/hooks/use-idea-mode-state";
import { useVideoActionState } from "@/components/write-chat/hooks/use-video-action-state";
import { type VideoAction } from "@/components/write-chat/hooks/use-video-action-state";
import { useVideoState } from "@/components/write-chat/hooks/use-video-state";
import { useVoiceRecorder } from "@/components/write-chat/hooks/use-voice-recorder";
import { type PersonaOption, type ActionType } from "@/components/write-chat/persona-selector";
import { HeroSection } from "@/components/write-chat/presentation/hero-section";
import { useSmoothMessageManager } from "@/components/write-chat/smooth-message-manager";
import { ChatContainer } from "@/components/write-chat/ui/chat-container";
import { TransitionWrapper } from "@/components/write-chat/ui/transition-wrapper";
import { useAuth } from "@/contexts/auth-context";
import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";
import { useLightweightUrlDetection } from "@/hooks/use-lightweight-url-detection";
import { detectSocialUrl } from "@/lib/utils/lightweight-url-detector";

// Custom state hooks

// Action handlers

// UI Components

// Types and constants

// Helper function to convert LightweightDetectionResult to legacy DetectionResult format
function convertDetectionResult(lightweight: any): any {
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

type ClaudeChatProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string, persona: PersonaOption | null) => void;
  onAnswerReady?: () => void;
  onHeroStateChange?: (isHero: boolean) => void;
  initialPrompt?: string;
  initialPersona?: PersonaOption;
  conversationIdToLoad?: string | null;
  useActionSystem?: boolean;
  onActionTrigger?: (action: ActionType, prompt: string) => void;
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  onAnswerReady,
  onHeroStateChange,
  initialPrompt,
  initialPersona,
  conversationIdToLoad,
  useActionSystem = true,
  onActionTrigger,
}: ClaudeChatProps) {
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  const { user, userProfile } = useAuth();
  const videoActionState = useVideoActionState();
  const mountedRef = useRef(true);

  // Custom state hooks
  const chatState = useChatState(initialPersona);
  const conversationState = useConversationState();
  const actionSelectionState = useActionSelectionState();
  const ideaModeState = useIdeaModeState();
  const videoState = useVideoState();

  // URL detection & validation
  const { detection, isProcessing: isUrlProcessing } = useLightweightUrlDetection(chatState.inputValue);
  const linkDetection = convertDetectionResult(detection);
  const hasValidVideoUrl = detection.isValid && (detection.platform === "instagram" || detection.platform === "tiktok");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const heroInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Enhanced smooth message manager
  const smoothMessageManager = useSmoothMessageManager(mountedRef, {
    staggerDelay: 50,
    animationDuration: 300,
    scrollBehavior: "smooth",
    enableIntersectionObserver: true,
  });

  // Voice recording
  const { isRecording, toggle: toggleRecording } = useVoiceRecorder({
    onTranscription: chatState.setInputValue,
  });
  const [showListening, setShowListening] = useState(true);

  // Handle hero to chat expansion
  const handleHeroExpansion = useCallback(() => {
    if (!chatState.isHeroState || chatState.isTransitioning) return;
    chatState.setIsTransitioning(true);
    chatState.setIsHeroState(false);
    setTimeout(() => {
      chatState.setIsTransitioning(false);
    }, 400);
  }, [chatState]);

  // Create action handlers
  const conversationHandler = createConversationHandler({
    setConversationId: conversationState.setConversationId,
    setConversationTitle: conversationState.setConversationTitle,
    setIsFirstResponse: conversationState.setIsFirstResponse,
    setMessages: chatState.setMessages,
    onHeroExpansion: handleHeroExpansion,
  });

  const scriptActionHandler = createScriptActionHandler({
    setMessages: chatState.setMessages,
    conversationId: conversationState.conversationId,
    selectedPersona: chatState.selectedPersona,
    isFirstResponse: conversationState.isFirstResponse,
    setIsFirstResponse: conversationState.setIsFirstResponse,
    conversationTitle: conversationState.conversationTitle,
    setConversationTitle: conversationState.setConversationTitle,
    onAnswerReady,
  });

  const actionSystemHandler = createActionSystemHandler({
    setMessages: chatState.setMessages,
    conversationId: conversationState.conversationId,
    selectedPersona: chatState.selectedPersona,
    messages: chatState.messages,
    isFirstResponse: conversationState.isFirstResponse,
    setIsFirstResponse: conversationState.setIsFirstResponse,
    conversationTitle: conversationState.conversationTitle,
    setConversationTitle: conversationState.setConversationTitle,
    onSend,
  });

  const videoActionHandler = createVideoActionHandler({
    videoActionState,
    setMessages: chatState.setMessages,
    conversationId: conversationState.conversationId,
    setConversationId: conversationState.setConversationId,
    selectedPersona: chatState.selectedPersona,
    initialPrompt,
    isFirstResponse: conversationState.isFirstResponse,
    setIsFirstResponse: conversationState.setIsFirstResponse,
    conversationTitle: conversationState.conversationTitle,
    setConversationTitle: conversationState.setConversationTitle,
    onAnswerReady,
  });

  // Action trigger handler
  const handleActionTrigger = useCallback(
    (action: ActionType, prompt: string) => {
      console.log(`🎯 Action triggered: ${action} with prompt: ${prompt}`);

      if (onActionTrigger) {
        onActionTrigger(action, prompt);
      }

      const userInput = chatState.inputValue.trim();
      const enhancedPrompt = userInput ? `${prompt}\n\nTopic/Idea: ${userInput}` : prompt;

      actionSelectionState.clearAllSelections();
      handleSend(enhancedPrompt);
    },
    [onActionTrigger, chatState.inputValue, actionSelectionState],
  );

  // Main send handler
  const handleSend = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Handle idea mode
    if (chatState.isHeroState && ideaModeState.isIdeaMode) {
      await ideaModeState.saveIdea(trimmed);
      chatState.clearInput();
      return;
    }

    // Handle action system
    const selectedActionKey = actionSelectionState.getSelectedActionKey();
    if (selectedActionKey && chatState.isHeroState) {
      await actionSystemHandler(selectedActionKey, trimmed);
      chatState.clearInput();
      chatState.setIsHeroState(false);
      return;
    }

    // Trigger hero expansion if needed
    if (chatState.isHeroState) {
      handleHeroExpansion();
    }

    // Check for video URL
    const currentDetection = detectSocialUrl(trimmed);
    const isVideoUrlSubmission =
      currentDetection.isValid && (currentDetection.platform === "instagram" || currentDetection.platform === "tiktok");

    // Add user message
    const userMessageId = crypto.randomUUID();

    if (isVideoUrlSubmission) {
      // Handle video URL submission
      videoState.setPendingVideo(currentDetection.url!, currentDetection.platform!);

      const ackMessageId = crypto.randomUUID();
      const videoActionsId = crypto.randomUUID();
      const ackMessage = "I found a video! What would you like me to do with it?";

      chatState.setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content: trimmed },
        { id: ackMessageId, role: "assistant", content: ackMessage },
        { id: videoActionsId, role: "assistant", content: "<video-actions>" },
      ]);
    } else {
      // Regular message flow
      const ackMessage = "I'll help you with that."; // Simplified for now
      chatState.setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content: trimmed },
        { id: crypto.randomUUID(), role: "assistant", content: ackMessage },
        { id: crypto.randomUUID(), role: "assistant", content: ACK_LOADING },
      ]);

      // Generate script (simplified - always use script flow)
      const ensuredConvId = await conversationState.ensureConversation(
        chatState.selectedPersona?.name ?? "Default",
        initialPrompt,
      );
      await conversationState.saveUserMessage(trimmed);
      await scriptActionHandler(trimmed, ensuredConvId);
    }

    chatState.clearInput();
    chatState.setIsHeroState(false);
    onSend?.(trimmed, chatState.selectedPersona);
  };

  // Handle video action
  const handleVideoAction = useCallback(
    async (action: VideoAction) => {
      await videoActionHandler(action, videoState.pendingVideoUrl);
      videoState.clearPendingVideo();
    },
    [videoActionHandler, videoState],
  );

  // Effects
  useEffect(() => {
    mountedRef.current = true;
    ideaModeState.loadIdeas();
    return () => {
      mountedRef.current = false;
    };
  }, [ideaModeState]);

  useEffect(() => {
    if (initialPrompt) chatState.setInputValue(initialPrompt);
  }, [initialPrompt, chatState]);

  useEffect(() => {
    if (conversationIdToLoad) {
      conversationHandler.loadConversationById(conversationIdToLoad);
    }
  }, [conversationIdToLoad, conversationHandler]);

  useEffect(() => {
    if (onHeroStateChange) {
      onHeroStateChange(chatState.isHeroState);
    }
  }, [chatState.isHeroState, onHeroStateChange]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      smoothMessageManager.setContainer(messagesContainerRef.current);
    }
  }, [smoothMessageManager]);

  useEffect(() => {
    smoothMessageManager.scrollToBottom();
  }, [chatState.messages, smoothMessageManager]);

  // Auto-resize textarea
  useEffect(() => {
    const textareaEl = chatState.isHeroState ? heroInputRef.current : textareaRef.current;
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
    }
  }, [chatState.inputValue, chatState.isHeroState]);

  // Voice recording visual feedback
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

  const resolvedName = userProfile?.displayName ?? user?.displayName ?? null;

  return (
    <TransitionWrapper
      isHeroState={chatState.isHeroState}
      isTransitioning={chatState.isTransitioning}
      setIsHeroState={chatState.setIsHeroState}
      setIsTransitioning={chatState.setIsTransitioning}
      className={className}
    >
      {/* Hero Content */}
      <div className={`hero-content ${!chatState.isHeroState ? "hero-hidden" : ""}`}>
        <HeroSection
          resolvedName={resolvedName}
          inputValue={chatState.inputValue}
          setInputValue={chatState.setInputValue}
          placeholder={isRecording ? (showListening ? "listening..." : "") : placeholder}
          isRecording={isRecording}
          showListening={showListening}
          isUrlProcessing={isUrlProcessing}
          linkDetection={linkDetection}
          hasValidVideoUrl={hasValidVideoUrl}
          handleSend={handleSend}
          heroInputRef={heroInputRef}
          selectedPersona={chatState.selectedPersona}
          onPersonaSelect={chatState.setSelectedPersona}
          isIdeaMode={ideaModeState.isIdeaMode}
          setIsIdeaMode={ideaModeState.setIsIdeaMode}
          ideaSaveMessage={ideaModeState.ideaSaveMessage}
          ideas={ideaModeState.ideas}
          ideasOpen={ideaModeState.ideasOpen}
          setIdeasOpen={ideaModeState.setIdeasOpen}
          isIdeaInboxEnabled={isIdeaInboxEnabled}
          onVoiceClick={toggleRecording}
          onActionTrigger={handleActionTrigger}
          useActionSystem={useActionSystem}
          selectedAction={actionSelectionState.selectedAction}
          setSelectedAction={actionSelectionState.setSelectedAction}
          selectedQuickGenerator={actionSelectionState.selectedQuickGenerator}
          setSelectedQuickGenerator={actionSelectionState.setSelectedQuickGenerator}
          selectedTemplate={actionSelectionState.selectedTemplate}
          setSelectedTemplate={actionSelectionState.setSelectedTemplate}
        />
      </div>

      {/* Chat Messages Area */}
      {!chatState.isHeroState && (
        <ChatContainer
          messages={chatState.messages}
          inputValue={chatState.inputValue}
          setInputValue={chatState.setInputValue}
          selectedPersona={chatState.selectedPersona}
          onPersonaSelect={chatState.setSelectedPersona}
          conversationTitle={conversationState.conversationTitle}
          resolvedName={resolvedName}
          activeAction={videoActionState.state.activeAction}
          isProcessingVideoAction={videoActionState.isProcessing}
          onVideoAction={handleVideoAction}
          onSubmit={() => handleSend(chatState.inputValue)}
          onActionTrigger={handleActionTrigger}
          messagesEndRef={messagesEndRef}
          textareaRef={textareaRef}
          messagesContainerRef={messagesContainerRef}
        />
      )}
    </TransitionWrapper>
  );
}

export default ClaudeChat;
