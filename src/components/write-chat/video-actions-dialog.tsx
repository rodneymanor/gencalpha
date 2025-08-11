"use client";

import { useState } from "react";

import { FileText, Sparkles, CopyCheck, Lightbulb, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Platform = "instagram" | "tiktok";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform;
  videoUrl: string;
  onResult: (payload: { type: string; data: unknown }) => void;
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

export function VideoActionsDialog({ open, onOpenChange, platform, videoUrl, onResult }: Props) {
  const [submitting, setSubmitting] = useState<ActionKey | null>(null);

  const handleTranscribe = async () => {
    setSubmitting("transcribe");
    try {
      const data = await postJson("/api/video/transcribe", { videoUrl, platform });
      onResult({ type: "transcript", data });
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleAnalyze = async () => {
    setSubmitting("analyze");
    try {
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl, platform });
      const data = await postJson("/api/analyze/style", { transcript: t.transcript, sourceUrl: videoUrl, platform });
      onResult({ type: "analysis", data });
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmulate = async () => {
    setSubmitting("emulate");
    try {
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl, platform });
      // The client can prompt for topic separately; send a placeholder for now
      const data = await postJson("/api/style/emulate", {
        transcript: t.transcript,
        sourceUrl: videoUrl,
        platform,
        newTopic: "Write a script about the core idea of this video for my audience",
      });
      onResult({ type: "emulation", data });
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleIdeas = async () => {
    setSubmitting("ideas");
    try {
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl, platform });
      const data = await postJson("/api/content/ideas", { transcript: t.transcript, sourceUrl: videoUrl });
      onResult({ type: "ideas", data });
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleHooks = async () => {
    setSubmitting("hooks");
    try {
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl, platform });
      const data = await postJson("/api/hooks/generate", { input: t.transcript });
      onResult({ type: "hooks", data });
      onOpenChange(false);
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
            title="Analyze (@Analyze)"
            desc="Deep stylometric analysis"
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
