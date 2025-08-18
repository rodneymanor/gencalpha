import * as React from "react";

import { Sparkles, Link as LinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalyzerHeaderProps {
  creatorName?: string;
  creatorHandle?: string;
  platform?: string;
  isInsightsOpen: boolean;
  onToggleInsights: () => void;
  onDeepAnalysis: () => void;
  onCopyLink: () => void;
}

export function AnalyzerHeader({
  creatorName,
  creatorHandle,
  platform,
  isInsightsOpen,
  onToggleInsights,
  onDeepAnalysis,
  onCopyLink,
}: AnalyzerHeaderProps) {
  const avatarText = React.useMemo(() => {
    if (!creatorName) return "NA";
    return creatorName
      .split(" ")
      .map((n) => n[0])
      .join("");
  }, [creatorName]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-accent grid size-10 place-items-center rounded-full font-semibold">{avatarText}</div>
        <div className="flex flex-col">
          <div className="text-sm font-semibold">{creatorName ?? "John Doe"}</div>
          <div className="text-muted-foreground text-xs">{creatorHandle ?? "@johndoe"}</div>
        </div>
        <Badge variant="secondary" className="bg-accent text-foreground ml-1 rounded-[var(--radius-button)]">
          {(platform ?? "tiktok").replace(/^\w/, (m) => m.toUpperCase())}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="rounded-[var(--radius-button)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99]"
          onClick={onToggleInsights}
        >
          {isInsightsOpen ? "Hide Insights" : "Show Insights"}
        </Button>
        <Button
          className="rounded-[var(--radius-button)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99]"
          onClick={onDeepAnalysis}
        >
          <Sparkles className="mr-2 size-4" />
          Deep Analysis
        </Button>
        <Button variant="secondary" className="rounded-[var(--radius-button)]" onClick={onCopyLink} title="Copy Link">
          <LinkIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

