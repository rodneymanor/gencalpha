"use client";

import { FileText, LayoutDashboard, StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

export function PanelControls() {
  const { state, toggleWritingPanel, toggleNotesPanel, resetLayout } = useResizableLayout();
  const { showWritingPanel, showNotesPanel } = state;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showWritingPanel ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleWritingPanel}
              aria-label="Toggle writing panel"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Writing Panel</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showNotesPanel ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleNotesPanel}
              aria-label="Toggle notes panel"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notes Panel</TooltipContent>
        </Tooltip>

        {(showWritingPanel || showNotesPanel) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={resetLayout} aria-label="Reset panels layout">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Panels</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
