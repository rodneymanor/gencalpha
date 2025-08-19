"use client";

import VideoActionSelector from "@/components/write-chat/video-action-selector";

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
  const handleAction = (action: "transcribe" | "analyze" | "emulate" | "ideas" | "hooks") => {
    switch (action) {
      case "transcribe":
        onTranscribe();
        break;
      case "analyze":
        onAnalyze();
        break;
      case "emulate":
        onEmulate();
        break;
      case "ideas":
        onIdeas();
        break;
      case "hooks":
        onHooks();
        break;
    }
  };

  return (
    <div className="interactive-element hover:bg-accent/5 -m-2 max-w-none rounded-[var(--radius-button)] p-2 transition-all duration-200">
      <VideoActionSelector onAction={handleAction} disabled={!active} className="w-full" />
    </div>
  );
}

export default VideoActionsPanel;
