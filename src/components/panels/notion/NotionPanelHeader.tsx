"use client";

import React, { useState } from "react";

import { RefreshCw, Plus, Sparkles } from "lucide-react";

interface NotionPanelHeaderProps {
  title: string;
  onTitleChange?: (title: string) => void;
  showPageControls?: boolean;
  placeholder?: string;
}

export default function NotionPanelHeader({
  title,
  onTitleChange,
  showPageControls = true,
  placeholder = "New page",
  isVisible = true,
}: NotionPanelHeaderProps & { isVisible?: boolean }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && localTitle !== title) {
      onTitleChange(localTitle);
    }
  };

  // Update local title when prop changes
  React.useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div
      className={`transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"} `}
      style={{
        transitionDelay: isVisible ? "100ms" : "0ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Page Controls */}
      <div className="px-2 py-1">
        <div
          className={`flex flex-wrap gap-1 text-sm transition-opacity duration-200 ${showPageControls ? "opacity-100" : "opacity-0"} `}
        >
          <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-700">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs">Rewrite</span>
          </button>
          <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-700">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs">Hooks</span>
          </button>
          <button className="flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs">Content Ideas</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onFocus={() => setIsEditingTitle(true)}
          placeholder={placeholder}
          className={`w-full border-none bg-transparent text-3xl font-bold text-neutral-900 placeholder-neutral-300 transition-all duration-150 outline-none ${isEditingTitle ? "opacity-100" : "opacity-90"} `}
        />
      </div>
    </div>
  );
}
