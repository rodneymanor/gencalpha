"use client";

import { useState } from "react";

import { FileText, Sparkles, CopyCheck, Lightbulb, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";

type Platform = "instagram" | "tiktok";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform;
  videoUrl: string;
  onResult: (payload: { type: string; data: unknown }) => void;
  onStart?: (status: string) => void;
  onChatTransition?: () => void; // New callback to transition to chat state
};

type ActionKey = "transcribe" | "analyze" | "emulate" | "ideas" | "hooks";

async function buildAuthHeaders(): Promise<HeadersInit> {
  const token = await import("@/lib/firebase").then((m) => m.auth?.currentUser?.getIdToken());
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;
  return headers;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers = await buildAuthHeaders();
  const res = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

function ActionCard({
  icon,
  title,
  desc,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      className="bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01]"
      onClick={onClick}
      disabled={active}
    >
      <div className="flex items-center gap-3">
        <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
          {icon}
        </div>
        <div>
          <div className="text-foreground font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{desc}</div>
        </div>
      </div>
    </button>
  );
}

export function VideoActionsDialog({ open, onOpenChange, platform, videoUrl, onResult, onStart, onChatTransition }: Props) {
  const [submitting, setSubmitting] = useState<ActionKey | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  // Helper: route structured content to slideout BlockNote editor (same as main chat)
  const sendToSlideout = (markdown: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("write:editor-set-content", {
          detail: { markdown },
        }),
      );
    }
  };

  // Helper: timing utilities for staged UX (same as main chat)
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const ACK_BEFORE_SLIDE_MS = 1500; // how long the ack+loader shows before slideout
  const SLIDE_DURATION_MS = 350; // approximate slideout animation time

  const ensureResolved = async (): Promise<{ url: string; platform: Platform }> => {
    if (resolvedUrl) return { url: resolvedUrl, platform };
    // Resolve via unified scraper
    const res = await postJson<{ success: boolean; videoUrl?: string; platform?: Platform }>("/api/video/resolve", {
      url: videoUrl,
    });
    const finalUrl = res?.videoUrl ?? videoUrl;
    const finalPlatform = res?.platform ?? platform;
    setResolvedUrl(finalUrl);
    return { url: finalUrl, platform: finalPlatform };
  };

  const handleTranscribe = async () => {
    setSubmitting("transcribe");
    try {
      // Follow main chat pattern: acknowledge immediately, transition to chat, then process
      onStart?.("I'll transcribe this video for you.");
      onOpenChange(false);
      
      // Try unified video scraper first, but expect it won't have transcripts
      let transcriptData: { transcript: string; success: boolean } | null = null;
      
      try {
        const videoData = await scrapeVideoUrl(videoUrl);
        
        // Check if scraper provided a transcript (unlikely but possible)
        if (videoData.transcript) {
          transcriptData = { transcript: videoData.transcript, success: true };
        } else if (videoData.description && videoData.description.length > 50) {
          // Use description as transcript only if it's substantial
          transcriptData = { transcript: videoData.description, success: true };
        }
      } catch (scraperError) {
        // Scraper failed, continue to API transcription
        console.log("🔍 [VideoActions] Unified scraper failed, using API transcription:", scraperError);
      }
      
      // If no transcript from scraper, use the transcription API
      if (!transcriptData) {
        const { url, platform: plat } = await ensureResolved();
        transcriptData = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform: plat });
        transcriptData = { ...transcriptData, success: true };
      }
      
      // Wait for acknowledgment timing, then send to slideout
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (transcriptData.transcript) {
        const markdown = `# Transcript\n\n${transcriptData.transcript}`;
        sendToSlideout(markdown);
        await delay(SLIDE_DURATION_MS);
        onResult({ type: "transcript", data: transcriptData });
      } else {
        throw new Error("No transcript received from any source");
      }
    } catch (error) {
      await delay(ACK_BEFORE_SLIDE_MS);
      const errorMessage = error instanceof Error ? error.message : "Transcription failed";
      onResult({ type: "error", data: { error: errorMessage } });
    } finally {
      setSubmitting(null);
    }
  };

  const handleAnalyze = async () => {
    setSubmitting("analyze");
    try {
      onStart?.("I'll perform advanced stylometric analysis using Gemini AI.");
      onOpenChange(false);
      
      // Get transcript using server-side API transcription
      const { url, platform: plat } = await ensureResolved();
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform: plat });
      if (!t.transcript) {
        throw new Error("Could not get transcript for analysis");
      }
      const transcript = t.transcript;
      console.log("✅ [VideoActions] Got transcript from API transcription");
      
      // Send transcript to Gemini for comprehensive stylometric analysis
      const analysisData = await postJson<{ analysis: string }>("/api/gemini/stylometric-analysis", { 
        transcript,
        sourceUrl: videoUrl,
        platform 
      });
      
      // Wait for acknowledgment timing, then send to slideout
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (analysisData.analysis) {
        const markdown = `# Advanced Stylometric Analysis\n\n${analysisData.analysis}`;
        sendToSlideout(markdown);
        await delay(SLIDE_DURATION_MS);
        onResult({ type: "stylometric-analysis", data: { success: true, transcript, analysis: analysisData.analysis } });
      } else {
        throw new Error("No analysis data received from Gemini API");
      }
    } catch (error) {
      await delay(ACK_BEFORE_SLIDE_MS);
      const errorMessage = error instanceof Error ? error.message : "Stylometric analysis failed";
      onResult({ type: "error", data: { error: errorMessage } });
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmulate = async () => {
    setSubmitting("emulate");
    try {
      onStart?.("I'll help you write a script about the core idea of this video.");
      onOpenChange(false);
      
      const { url, platform: plat } = await ensureResolved();
      
      // First get transcript, then emulate
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform: plat });
      if (!t.transcript) {
        throw new Error("Could not get transcript for script generation");
      }
      
      const emulationData = await postJson<{ script: { hook: string; bridge: string; goldenNugget: string; wta: string } }>("/api/style/emulate", {
        transcript: t.transcript,
        sourceUrl: url,
        platform: plat,
        newTopic: "Write a script about the core idea of this video for my audience",
      });
      
      // Wait for acknowledgment timing, then send to slideout
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (emulationData.script && emulationData.script.hook) {
        const markdown = `# Generated Script\n\n## Hook\n${emulationData.script.hook}\n\n## Bridge\n${emulationData.script.bridge}\n\n## Golden Nugget\n${emulationData.script.goldenNugget}\n\n## Call to Action\n${emulationData.script.wta}`;
        sendToSlideout(markdown);
        await delay(SLIDE_DURATION_MS);
        onResult({ type: "emulation", data: { success: true } });
      } else {
        throw new Error("No valid script data received from API");
      }
    } catch (error) {
      await delay(ACK_BEFORE_SLIDE_MS);
      const errorMessage = error instanceof Error ? error.message : "Script generation failed";
      onResult({ type: "error", data: { error: errorMessage } });
    } finally {
      setSubmitting(null);
    }
  };

  const handleIdeas = async () => {
    setSubmitting("ideas");
    try {
      onStart?.("I'll help you create 10 content ideas.");
      onOpenChange(false);
      
      const { url, platform: plat } = await ensureResolved();
      
      // First get transcript, then generate ideas
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform: plat });
      if (!t.transcript) {
        throw new Error("Could not get transcript for idea generation");
      }
      
      const ideasData = await postJson<{ ideas: string }>("/api/content/ideas", { 
        transcript: t.transcript, 
        sourceUrl: url 
      });
      
      // Wait for acknowledgment timing, then send to slideout
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (ideasData.ideas) {
        const markdown = `# Content Ideas\n\n${ideasData.ideas}`;
        sendToSlideout(markdown);
        await delay(SLIDE_DURATION_MS);
        onResult({ type: "ideas", data: { success: true } });
      } else {
        throw new Error("No ideas data received from API");
      }
    } catch (error) {
      await delay(ACK_BEFORE_SLIDE_MS);
      const errorMessage = error instanceof Error ? error.message : "Ideas generation failed";
      onResult({ type: "error", data: { error: errorMessage } });
    } finally {
      setSubmitting(null);
    }
  };

  const handleHooks = async () => {
    setSubmitting("hooks");
    try {
      onStart?.("I'll help you write 20 hooks.");
      onOpenChange(false);
      
      const { url, platform: plat } = await ensureResolved();
      
      // First get transcript, then generate hooks
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform: plat });
      if (!t.transcript) {
        throw new Error("Could not get transcript for hook generation");
      }
      
      const hooksData = await postJson<{ hooks: Array<{ hook: string; template: string }> }>("/api/hooks/generate", { 
        input: t.transcript 
      });
      
      // Wait for acknowledgment timing, then send to slideout
      await delay(ACK_BEFORE_SLIDE_MS);
      
      if (hooksData.hooks && Array.isArray(hooksData.hooks) && hooksData.hooks.length > 0) {
        const hooksList = hooksData.hooks.map((h, i) => `${i + 1}. ${h.hook} (Template: ${h.template})`).join("\n");
        const markdown = `# Hooks\n\n${hooksList}`;
        sendToSlideout(markdown);
        await delay(SLIDE_DURATION_MS);
        onResult({ type: "hooks", data: { success: true } });
      } else {
        throw new Error("No valid hooks data received from API");
      }
    } catch (error) {
      await delay(ACK_BEFORE_SLIDE_MS);
      const errorMessage = error instanceof Error ? error.message : "Hooks generation failed";
      onResult({ type: "error", data: { error: errorMessage } });
    } finally {
      setSubmitting(null);
    }
  };

  // removed nested component to satisfy linter

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an action</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard
            icon={<FileText className="h-5 w-5" />}
            title="Transcribe"
            desc="Extract plain text transcript"
            onClick={handleTranscribe}
            active={submitting === "transcribe"}
          />
          <ActionCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Advanced Stylometric Analysis"
            desc="Deep linguistic forensics & voice replication analysis"
            onClick={handleAnalyze}
            active={submitting === "analyze"}
          />
          <ActionCard
            icon={<CopyCheck className="h-5 w-5" />}
            title="Emulate Style (@Analyze)"
            desc="Generate new script in source style"
            onClick={handleEmulate}
            active={submitting === "emulate"}
          />
          <ActionCard
            icon={<Lightbulb className="h-5 w-5" />}
            title="Create Content Ideas (@Content Ideas.md)"
            desc="New content angles using PEQ"
            onClick={handleIdeas}
            active={submitting === "ideas"}
          />
          <ActionCard
            icon={<Megaphone className="h-5 w-5" />}
            title="Hook Generation (hook-generation.ts)"
            desc="High-performing hooks for Shorts"
            onClick={handleHooks}
            active={submitting === "hooks"}
          />
        </div>
        <div className="mt-2 text-right">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
