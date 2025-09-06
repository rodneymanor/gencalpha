import React from "react";

import { FileText, List } from "lucide-react";

interface TranscriptToggleProps {
  showFullTranscript: boolean;
  onToggle: (showFull: boolean) => void;
  hasTranscriptData: boolean;
}

/**
 * Toggle component for switching between full transcript and transcript components
 */
export function TranscriptToggle({ showFullTranscript, onToggle, hasTranscriptData }: TranscriptToggleProps) {
  console.log("🔀 [TranscriptToggle] Rendering with:", { showFullTranscript, hasTranscriptData });

  if (!hasTranscriptData) {
    console.log("❌ [TranscriptToggle] No transcript data, hiding toggle");
    return null;
  }

  return (
    <div className="bg-muted/30 flex items-center space-x-2 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs font-medium">View:</span>
      <div className="border-border flex overflow-hidden rounded-md border">
        <button
          onClick={() => {
            console.log("🏗️ [TranscriptToggle] Components button clicked");
            onToggle(false);
          }}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium transition-colors ${
            !showFullTranscript
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
          } `}
          title="Show structured script components"
        >
          <List className="h-3 w-3" />
          <span>Components</span>
        </button>
        <button
          onClick={() => {
            console.log("📰 [TranscriptToggle] Full Transcript button clicked");
            onToggle(true);
          }}
          className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium transition-colors ${
            showFullTranscript
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
          } `}
          title="Show full raw transcript"
        >
          <FileText className="h-3 w-3" />
          <span>Full Transcript</span>
        </button>
      </div>
    </div>
  );
}
