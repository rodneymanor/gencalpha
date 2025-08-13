"use client";

import { FileText, Lightbulb, Megaphone, Sparkles, CopyCheck } from "lucide-react";

type VideoActionsPanelProps = {
  active: boolean;
  onTranscribe: () => void;
  onAnalyze: () => void;
  onEmulate: () => void;
  onIdeas: () => void;
  onHooks: () => void;
};

export function VideoActionsPanel({
  active,
  onTranscribe,
  onAnalyze,
  onEmulate,
  onIdeas,
  onHooks,
}: VideoActionsPanelProps) {
  const disabled = !active;
  const baseClass =
    "bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01]" +
    (disabled ? " opacity-70" : "");

  return (
    <div className="bg-card border-border text-card-foreground rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft-drop)]">
      <div className="text-foreground mb-3 font-semibold">Choose an action</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button className={baseClass} onClick={onTranscribe} disabled={disabled}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Transcribe</div>
              <div className="text-muted-foreground text-sm">Extract plain text transcript</div>
            </div>
          </div>
        </button>
        <button className={baseClass} onClick={onAnalyze} disabled={disabled}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Advanced Stylometric Analysis</div>
              <div className="text-muted-foreground text-sm">
                Deep linguistic forensics & voice replication analysis
              </div>
            </div>
          </div>
        </button>
        <button className={baseClass} onClick={onEmulate} disabled={disabled}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <CopyCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Emulate Style (@Analyze)</div>
              <div className="text-muted-foreground text-sm">Generate new script in source style</div>
            </div>
          </div>
        </button>
        <button className={baseClass} onClick={onIdeas} disabled={disabled}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Create Content Ideas (@Content Ideas.md)</div>
              <div className="text-muted-foreground text-sm">New content angles using PEQ</div>
            </div>
          </div>
        </button>
        <button className={baseClass} onClick={onHooks} disabled={disabled}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-semibold">Hook Generation</div>
              <div className="text-muted-foreground text-sm">High-performing hooks for Shorts</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default VideoActionsPanel;
