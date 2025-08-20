"use client";

import { useCallback, useState } from "react";

import { startAckWithLoader, finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import { generateHooks, generateIdeas, transcribeVideo } from "@/components/write-chat/services/video-service";
import { sendToSlideout } from "@/components/write-chat/utils";
import { ensureResolved } from "@/lib/video/ensure-resolved";

export type InlineVideoAction = "transcribe" | "ideas" | "hooks";

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
        const { url, platform } = await ensureResolved(videoPanel);
        const transcript = await transcribeVideo({ url, platform });
        const markdown = `# Transcript\n\n${transcript}`;
        sendToSlideout(markdown);
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
        const { url, platform } = await ensureResolved(videoPanel);
        const transcript = await transcribeVideo({ url, platform });
        const ideas = await generateIdeas({ transcript, url });
        const markdown = `# Content Ideas\n\n${ideas}`;
        sendToSlideout(markdown);
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
        const { url, platform } = await ensureResolved(videoPanel);
        const transcript = await transcribeVideo({ url, platform });
        const hooksResp = await generateHooks({ transcript });
        const list = hooksResp.hooks.map((h, i) => `${i + 1}. ${h.text} — ${h.rating}/100 (${h.focus})`).join("\n");
        const markdown = `# Hooks\n\n${list}\n\n**Top Hook:** ${hooksResp.topHook.text} (${hooksResp.topHook.rating}/100)`;
        sendToSlideout(markdown);
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
