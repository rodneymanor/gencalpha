"use client";

import { useCallback, useState } from "react";

import { startAckWithLoader, finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import { sendToSlideout, sendScriptToSlideout } from "@/components/write-chat/utils";
import { 
  transcribeVideoUrl, 
  generateVideoIdeas, 
  generateVideoHooks 
} from "@/lib/video-actions";

export type InlineVideoAction = "transcribe" | "ideas" | "hooks";

// Helper function removed - now handled by transcription orchestrator

export function useInlineVideoActions(options: {
  setMessages: React.Dispatch<React.SetStateAction<Array<{ id: string; role: "user" | "assistant"; content: string }>>>;
  onAnswerReady?: () => void;
}) {
  const { setMessages, onAnswerReady } = options;
  const [activeAction, setActiveAction] = useState<InlineVideoAction | null>(null);

  const handleTranscribe = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      setActiveAction("transcribe");
      startAckWithLoader(setMessages, "I'll transcribe this video for you.");
      try {
        // Use the transcription orchestrator for complete workflow
        const result = await transcribeVideoUrl(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Transcription failed");
        }

        // Send script data to script panel slideout
        if (result.data.scriptData) {
          sendScriptToSlideout(result.data.scriptData, "Video Transcript");
        }

        finishAndRemoveLoader(setMessages);
        onAnswerReady?.();
      } catch (error) {
        finishAndRemoveLoader(setMessages);
        const errorMessage = error instanceof Error ? error.message : "Transcription failed";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
        ]);
      } finally {
        setActiveAction(null);
      }
    },
    [onAnswerReady, setMessages],
  );

  const handleIdeas = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      setActiveAction("ideas");
      startAckWithLoader(setMessages, "I'll help you create 10 content ideas.");
      try {
        // Use the ideas orchestrator for complete workflow
        const result = await generateVideoIdeas(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Ideas generation failed");
        }

        // Send ideas to slideout
        sendToSlideout(result.data.markdown);
        finishAndRemoveLoader(setMessages);
        onAnswerReady?.();
      } catch (error) {
        finishAndRemoveLoader(setMessages);
        const errorMessage = error instanceof Error ? error.message : "Ideas generation failed";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
        ]);
      } finally {
        setActiveAction(null);
      }
    },
    [onAnswerReady, setMessages],
  );

  const handleHooks = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      setActiveAction("hooks");
      startAckWithLoader(setMessages, "I'll help you write hooks.");
      try {
        // Use the hooks orchestrator for complete workflow
        const result = await generateVideoHooks(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Hooks generation failed");
        }

        // Send hooks to slideout
        sendToSlideout(result.data.markdown);
        finishAndRemoveLoader(setMessages);
        onAnswerReady?.();
      } catch (error) {
        finishAndRemoveLoader(setMessages);
        const errorMessage = error instanceof Error ? error.message : "Hooks generation failed";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
        ]);
      } finally {
        setActiveAction(null);
      }
    },
    [onAnswerReady, setMessages],
  );

  return {
    activeAction,
    handleTranscribe,
    handleIdeas,
    handleHooks,
  } as const;
}

export default useInlineVideoActions;
