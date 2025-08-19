"use client";

import { useCallback, useState } from "react";

import { startAckWithLoader, finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import {
  generateHooks,
  generateIdeas,
  stylometricAnalysis,
  generateScriptFromVoice,
  transcribeVideo,
} from "@/components/write-chat/services/video-service";
import { sendToSlideout } from "@/components/write-chat/utils";
import { ensureResolved } from "@/lib/video/ensure-resolved";

export type InlineVideoAction = "transcribe" | "analyze" | "emulate" | "ideas" | "hooks";

export function useInlineVideoActions(options: {
  setMessages: React.Dispatch<React.SetStateAction<Array<{ id: string; role: "user" | "assistant"; content: string }>>>;
  onAnswerReady?: () => void;
}) {
  const { setMessages, onAnswerReady } = options;
  const [activeAction, setActiveAction] = useState<InlineVideoAction | null>(null);
  const [awaitingEmulateInput, setAwaitingEmulateInput] = useState(false);
  const [emulateIdea, setEmulateIdea] = useState("");

  // Helpers to keep action handlers simple (reduce complexity)
  const formatAnalysisMarkdown = (analysis: any): string => {
    const creator = analysis?.metadata?.creatorName ?? "Unknown";
    const accuracy = analysis?.metadata?.accuracyLevel ?? "Unknown";
    const confidence = analysis?.metadata?.confidenceScore ?? 0;
    const summary = `**Creator:** ${creator}\n**Accuracy:** ${accuracy}\n**Confidence:** ${confidence}`;
    return `# Forensic Voice Analysis\n\n${summary}\n\n<details><summary>View full JSON</summary>\n\n\n\n${"```json"}\n${JSON.stringify(
      analysis,
      null,
      2,
    )}\n${"```"}\n\n</details>`;
  };

  const saveAnalysisToLocalStorage = (analysis: any): void => {
    try {
      if (typeof window !== "undefined") {
        const creator = analysis?.metadata?.creatorName ?? "";
        localStorage.setItem("voiceAnalysis", JSON.stringify(analysis));
        if (creator) localStorage.setItem(`analysis_${creator}`, JSON.stringify(analysis));
      }
    } catch {
      // ignore storage errors
    }
  };

  const runForensicAnalysis = async (videoPanel: { url: string; platform: "instagram" | "tiktok" }): Promise<any> => {
    const { url, platform } = await ensureResolved(videoPanel);
    const transcript = await transcribeVideo({ url, platform });
    return stylometricAnalysis({ transcript, url, platform });
  };

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

  const handleAnalyze = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel) return;
      setActiveAction("analyze");
      startAckWithLoader(setMessages, "Analyzing this video's voice DNA (forensic analysis) with Gemini 1.5 Pro.");
      try {
        const analysis = await runForensicAnalysis(videoPanel);
        const markdown = formatAnalysisMarkdown(analysis);
        saveAnalysisToLocalStorage(analysis);
        sendToSlideout(markdown);
        finishAndRemoveLoader(setMessages);
        onAnswerReady?.();
      } catch (error) {
        finishAndRemoveLoader(setMessages);
        const errorMessage = error instanceof Error ? error.message : "Forensic analysis failed";
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

  const handleEmulateStart = useCallback(() => {
    setAwaitingEmulateInput(true);
  }, []);

  const handleEmulateSubmit = useCallback(
    async (videoPanel: { url: string; platform: "instagram" | "tiktok" } | null) => {
      if (!videoPanel || !emulateIdea.trim()) return;
      setActiveAction("emulate");
      startAckWithLoader(setMessages, "I'll help you write a script about your idea in this creator's style.");
      try {
        const { url, platform } = await ensureResolved(videoPanel);
        const transcript = await transcribeVideo({ url, platform });
        const analysis = await stylometricAnalysis({ transcript, url, platform });
        const script = await generateScriptFromVoice({ analysis, topic: emulateIdea.trim(), length: "medium" });
        const raw = script?.finalOutput?.rawScript ?? "";
        const markdown = `# Generated Script\n\n${raw ?? "(No content)"}`;
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
    },
    [emulateIdea, onAnswerReady, setMessages],
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
