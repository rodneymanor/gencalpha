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
export function TranscriptToggle({ 
  showFullTranscript, 
  onToggle, 
  hasTranscriptData 
}: TranscriptToggleProps) {
  console.log("🔀 [TranscriptToggle] Rendering with:", { showFullTranscript, hasTranscriptData });
  
  if (!hasTranscriptData) {
    console.log("❌ [TranscriptToggle] No transcript data, hiding toggle");
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-muted/30 rounded-md border">
      <span className="text-xs font-medium text-muted-foreground">View:</span>
      <div className="flex rounded-md border border-border overflow-hidden">
        <button
          onClick={() => {
            console.log("🏗️ [TranscriptToggle] Components button clicked");
            onToggle(false);
          }}
          className={`
            flex items-center space-x-1 px-2 py-1 text-xs font-medium transition-colors
            ${!showFullTranscript 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
          title="Show structured script components"
        >
          <List className="w-3 h-3" />
          <span>Components</span>
        </button>
        <button
          onClick={() => {
            console.log("📰 [TranscriptToggle] Full Transcript button clicked");
            onToggle(true);
          }}
          className={`
            flex items-center space-x-1 px-2 py-1 text-xs font-medium transition-colors
            ${showFullTranscript 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
          title="Show full raw transcript"
        >
          <FileText className="w-3 h-3" />
          <span>Full Transcript</span>
        </button>
      </div>
    </div>
  );
}
