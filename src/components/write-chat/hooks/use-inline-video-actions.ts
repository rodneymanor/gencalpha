"use client";

import { useCallback, useState } from "react";

import { startAckWithLoader, finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import { delay } from "@/components/write-chat/utils";
import { ACK_BEFORE_SLIDE_MS } from "@/components/write-chat/constants";
import { sendToSlideout } from "@/components/write-chat/utils";
import { ensureResolved } from "@/lib/video/ensure-resolved";
import {
  emulateStyle,
  generateHooks,
  generateIdeas,
  stylometricAnalysis,
  transcribeVideo,
} from "@/components/write-chat/services/video-service";

export type InlineVideoAction = "transcribe" | "analyze" | "emulate" | "ideas" | "hooks";

export function useInlineVideoActions(options: {
  setMessages: React.Dispatch<React.SetStateAction<Array<{ id: string; role: "user" | "assistant"; content: string }>>>;
  onAnswerReady?: () => void;
}) {
  const { setMessages, onAnswerReady } = options;
  const [activeAction, setActiveAction] = useState<InlineVideoAction | null>(null);
  const [awaitingEmulateInput, setAwaitingEmulateInput] = useState(false);
  const [emulateIdea, setEmulateIdea] = useState("");

  const handleTranscribe = useCallback(async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
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
  }, [onAnswerReady, setMessages]);

  const handleAnalyze = useCallback(async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
    if (!videoPanel) return;
    setActiveAction("analyze");
    startAckWithLoader(setMessages, "I'll perform advanced stylometric analysis using Gemini AI.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const transcript = await transcribeVideo({ url, platform });
      const analysis = await stylometricAnalysis({ transcript, url, platform });
      const markdown = `# Advanced Stylometric Analysis\n\n${analysis}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Stylometric analysis failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  }, [onAnswerReady, setMessages]);

  const handleEmulateStart = useCallback(() => {
    setAwaitingEmulateInput(true);
  }, []);

  const handleEmulateSubmit = useCallback(async (
    videoPanel: { url: string; platform: "instagram" | "tiktok" } | null,
  ) => {
    if (!videoPanel || !emulateIdea.trim()) return;
    setActiveAction("emulate");
    startAckWithLoader(setMessages, "I'll help you write a script about your idea in this creator's style.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const transcript = await transcribeVideo({ url, platform });
      const script = await emulateStyle({ transcript, url, platform, newTopic: emulateIdea.trim() });
      const markdown = `# Generated Script\n\n## Hook\n${script.hook}\n\n## Bridge\n${script.bridge}\n\n## Golden Nugget\n${script.goldenNugget}\n\n## Call to Action\n${script.wta}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
      setAwaitingEmulateInput(false);
      setEmulateIdea("");
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Script generation failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  }, [emulateIdea, onAnswerReady, setMessages]);

  const handleIdeas = useCallback(async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
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
  }, [onAnswerReady, setMessages]);

  const handleHooks = useCallback(async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
    if (!videoPanel) return;
    setActiveAction("hooks");
    startAckWithLoader(setMessages, "I'll help you write hooks.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const transcript = await transcribeVideo({ url, platform });
      const hooksResp = await generateHooks({ transcript });
      const list = hooksResp.hooks
        .map((h, i) => `${i + 1}. ${h.text} — ${h.rating}/100 (${h.focus})`)
        .join("\n");
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
  }, [onAnswerReady, setMessages]);

  return {
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
  } as const;
}

export default useInlineVideoActions;


