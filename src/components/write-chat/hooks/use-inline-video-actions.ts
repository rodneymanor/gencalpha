"use client";

import { useCallback } from "react";

import { finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import { sendToSlideout, sendScriptToSlideout } from "@/components/write-chat/utils";
import { transcribeVideoUrl, generateVideoIdeas, generateVideoHooks } from "@/lib/video-actions";

export type InlineVideoAction = "transcribe" | "ideas" | "hooks";

// Helper function removed - now handled by transcription orchestrator

export function useInlineVideoActions(options: {
  setMessages: React.Dispatch<React.SetStateAction<Array<{ id: string; role: "user" | "assistant"; content: string }>>>;
  onAnswerReady?: () => void;
}) {
  const { setMessages, onAnswerReady } = options;

  const handleTranscribe = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      // Message handling is now done by the parent component
      try {
        // Use the transcription orchestrator for complete workflow
        const result = await transcribeVideoUrl(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Transcription failed");
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
        // Action completion is now handled by the parent state machine
      }
    },
    [onAnswerReady, setMessages],
  );

  const handleIdeas = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      // Message and state handling is now done by the parent component
      try {
        // Use the ideas orchestrator for complete workflow
        const result = await generateVideoIdeas(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Ideas generation failed");
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
        // Action completion is now handled by the parent state machine
      }
    },
    [onAnswerReady, setMessages],
  );

  const handleHooks = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      // Message and state handling is now done by the parent component
      try {
        // Use the hooks orchestrator for complete workflow
        const result = await generateVideoHooks(videoPanel.url);

        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Hooks generation failed");
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
        // Action completion is now handled by the parent state machine
      }
    },
    [onAnswerReady, setMessages],
  );

  return {
    handleTranscribe,
    handleIdeas,
    handleHooks,
  } as const;
}

export default useInlineVideoActions;
