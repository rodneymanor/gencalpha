"use client";

import { forwardRef } from "react";

interface ContextualMenuProps {
  isVisible: boolean;
  top: number;
  left: number;
  text: string;
  onClose: () => void;
}

export const ContextualMenu = forwardRef<HTMLDivElement, ContextualMenuProps>(
  ({ isVisible, top, left, text, onClose }, ref) => {
    if (!isVisible) return null;

    return (
      <div className="fixed z-50" style={{ top, left }} ref={ref}>
        <div className="bg-card border-border text-foreground min-w-[220px] rounded-[var(--radius-card)] border">
          <div className="px-3 py-2 text-xs opacity-80">{text || "Script component"}</div>
          <div className="bg-border h-px w-full" />
          <div className="p-1">
            {/* TODO: Wire these menu items to real actions (insert/replace/open editors) */}
            <button
              className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
              onClick={() => {
                console.log("Add Hook clicked");
                onClose();
              }}
            >
              Add Hook
            </button>
            <button
              className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
              onClick={() => {
                console.log("Add Bridge clicked");
                onClose();
              }}
            >
              Add Bridge
            </button>
            <button
              className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
              onClick={() => {
                console.log("Mark as Golden Nugget clicked");
                onClose();
              }}
            >
              Mark as Golden Nugget
            </button>
            <button
              className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(text ?? "");
                } catch {
                  /* no-op */
                }
                onClose();
              }}
            >
              Copy Text
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ContextualMenu.displayName = "ContextualMenu";
