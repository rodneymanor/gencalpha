"use client";

import { PanelHeader } from "@/components/ui/panel-header";
import { TweetStyleComposer } from "@/components/writing-panel/tweet-style-composer";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

export function WritingPanel() {
  const { toggleWritingPanel } = useResizableLayout();

  return (
    <div className="flex h-full flex-col bg-background">
      <PanelHeader title="Quick Composer" onClose={toggleWritingPanel} className="border-b p-4" />
      <div className="flex-1 overflow-y-auto p-6">
        <TweetStyleComposer className="max-w-none" />
      </div>
    </div>
  );
}
