"use client";

import { LayoutDashboard, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

export function PanelControls() {
  const { state, resetLayout, toggleNotesPanel } = useResizableLayout();
  const { showNotesPanel } = state;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" className="gap-2" onClick={toggleNotesPanel}>
              <Inbox className="h-4 w-4" />
              Idea Inbox
            </Button>
          </TooltipTrigger>
          <TooltipContent>Idea Inbox</TooltipContent>
        </Tooltip>

        {showNotesPanel && (
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
