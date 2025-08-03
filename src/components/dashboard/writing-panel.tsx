"use client";

import { PanelHeader } from "@/components/ui/panel-header";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

export function WritingPanel() {
  const { toggleWritingPanel } = useResizableLayout();

  return (
    <div className="flex h-full flex-col bg-background">
      <PanelHeader title="Writing Panel" onClose={toggleWritingPanel} className="border-b p-4" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Writing panel content will be added here</p>
        </div>
      </div>
    </div>
  );
}
