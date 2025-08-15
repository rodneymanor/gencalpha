"use client";

import { Archive, PenTool } from "lucide-react";

import { IdeasView } from "@/components/standalone/ideas-view";

interface IdeaInboxContentProps {
  view: "ideas" | "drafts" | "archive";
  refreshTrigger?: number;
}

export function IdeaInboxContent({ view, refreshTrigger }: IdeaInboxContentProps) {
  switch (view) {
    case "ideas":
      return <IdeasView refreshTrigger={refreshTrigger} />;

    case "drafts":
      return (
        <div className="p-6 text-center">
          <div className="text-muted-foreground">
            <PenTool className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Drafts view coming soon...</p>
            <p className="mt-1 text-xs opacity-70">Your work-in-progress scripts and content will appear here.</p>
          </div>
        </div>
      );

    case "archive":
      return (
        <div className="p-6 text-center">
          <div className="text-muted-foreground">
            <Archive className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Archive view coming soon...</p>
            <p className="mt-1 text-xs opacity-70">Your archived ideas and completed projects will appear here.</p>
          </div>
        </div>
      );

    default:
      return <IdeasView refreshTrigger={refreshTrigger} />;
  }
}
