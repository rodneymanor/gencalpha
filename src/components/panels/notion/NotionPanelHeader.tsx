'use client';

import React, { useState } from 'react';
import { Smile, Image, Layout } from 'lucide-react';

interface NotionPanelHeaderProps {
  title: string;
  onTitleChange?: (title: string) => void;
  showPageControls?: boolean;
}

export default function NotionPanelHeader({
  title,
  onTitleChange,
  showPageControls = true
}: NotionPanelHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [showControls, setShowControls] = useState(false);

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
    <>
      {/* Page Controls */}
      {showPageControls && (
        <div 
          className="px-2 py-1"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className={`
            flex flex-wrap gap-1 text-neutral-400 text-sm
            transition-opacity duration-200
            ${showControls ? 'opacity-100' : 'opacity-0'}
          `}>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Smile className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Add icon</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Image className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Add cover</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Layout className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Customize layout</span>
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onFocus={() => setIsEditingTitle(true)}
          placeholder="New page"
          className={`
            w-full bg-transparent text-3xl font-bold text-neutral-900
            placeholder-neutral-300 outline-none border-none
            transition-all duration-150
            ${isEditingTitle ? 'opacity-100' : 'opacity-90'}
          `}
        />
      </div>
    </>
  );
}